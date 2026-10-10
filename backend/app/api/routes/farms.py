from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.database import get_db_session
from app.db.models import Farm, User
from app.api.schemas.farm import FarmCreateRequest, FarmResponse, FarmUpdateRequest

router = APIRouter(prefix="/farms", tags=["farms"])


def _raise_database_error(session: Session, *, conflict_message: str = "Farm operation could not be completed.") -> None:
    session.rollback()
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=conflict_message,
    ) from None


def _commit(session: Session) -> None:
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farm could not be saved.",
        ) from None
    except SQLAlchemyError:
        _raise_database_error(session)


def _get_owned_farm(farm_id: int, user: User, session: Session) -> Farm:
    try:
        farm = session.scalar(
            select(Farm).where(Farm.id == farm_id, Farm.user_id == user.id)
        )
    except SQLAlchemyError:
        _raise_database_error(session)

    if farm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
    return farm


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    payload: FarmCreateRequest,
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> Farm:
    farm = Farm(user_id=user.id, **payload.model_dump())
    session.add(farm)
    _commit(session)
    try:
        session.refresh(farm)
    except SQLAlchemyError:
        _raise_database_error(session)
    return farm


@router.get("", response_model=list[FarmResponse])
def list_farms(
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> list[Farm]:
    try:
        return list(
            session.scalars(
                select(Farm).where(Farm.user_id == user.id).order_by(Farm.id.desc())
            ).all()
        )
    except SQLAlchemyError:
        _raise_database_error(session)


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(
    farm_id: int = Path(gt=0),
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> Farm:
    return _get_owned_farm(farm_id, user, session)


@router.patch("/{farm_id}", response_model=FarmResponse)
@router.put("/{farm_id}", response_model=FarmResponse, include_in_schema=False)
def update_farm(
    payload: FarmUpdateRequest,
    farm_id: int = Path(gt=0),
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> Farm:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="No farm fields were provided.")
    if any(changes.get(field) is None for field in ("farm_name", "location") if field in changes):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Farm name and location cannot be null.")

    farm = _get_owned_farm(farm_id, user, session)
    for field, value in changes.items():
        setattr(farm, field, value)
    _commit(session)
    try:
        session.refresh(farm)
    except SQLAlchemyError:
        _raise_database_error(session)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int = Path(gt=0),
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> Response:
    farm = _get_owned_farm(farm_id, user, session)
    session.delete(farm)
    _commit(session)
    return Response(status_code=status.HTTP_204_NO_CONTENT)