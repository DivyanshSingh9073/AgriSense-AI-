from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.schemas.auth import (
    APIResponse,
    AuthSession,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UserProfile,
)
from app.auth.dependencies import get_current_user
from app.auth.security import (
    DUMMY_PASSWORD_HASH,
    create_token_pair,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db_session
from app.db.models import RefreshToken, User

router = APIRouter(prefix="/auth", tags=["auth"])


def _profile(user: User) -> UserProfile:
    return UserProfile(
        id=str(user.id),
        name=user.name,
        email=user.email,
        avatar_url=None,
        is_email_verified=user.is_email_verified,
        role="farmer",
        created_at=user.created_at,
    )


def _auth_response(user: User, session: Session) -> AuthSession:
    issued = create_token_pair(str(user.id))
    session.add(
        RefreshToken(
            jti=issued.refresh_token_id,
            user_id=user.id,
            expires_at=issued.refresh_expires_at,
        )
    )
    return AuthSession(
        user=_profile(user),
        tokens=TokenPair(access_token=issued.access_token, refresh_token=issued.refresh_token),
    )


@router.post(
    "/register",
    response_model=APIResponse[AuthSession],
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, session: Session = Depends(get_db_session)):
    existing_user = session.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    try:
        session.flush()
        session.refresh(user)
        auth_session = _auth_response(user, session)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from None
    return {"success": True, "message": "Account created.", "data": auth_session}


@router.post("/login", response_model=APIResponse[AuthSession])
def login(payload: LoginRequest, session: Session = Depends(get_db_session)):
    user = session.scalar(select(User).where(User.email == payload.email))
    password_hash = user.password_hash if user is not None else DUMMY_PASSWORD_HASH
    password_is_valid = verify_password(payload.password, password_hash)
    if user is None or not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    auth_session = _auth_response(user, session)
    session.commit()
    return {"success": True, "message": "Login successful.", "data": auth_session}


@router.get("/me", response_model=APIResponse[UserProfile])
def current_profile(user: User = Depends(get_current_user)):
    return {"success": True, "message": "Current user.", "data": _profile(user)}


@router.post("/refresh", response_model=APIResponse[TokenPair])
def refresh(payload: RefreshRequest, session: Session = Depends(get_db_session)):
    claims = decode_token(payload.refresh_token, expected_type="refresh")
    try:
        user_id = UUID(str(claims["sub"]))
        token_id = str(claims["jti"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    now = datetime.now(timezone.utc)
    refresh_token = session.scalar(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.jti == token_id,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > now,
        )
    )
    user = session.get(User, user_id)
    if refresh_token is None or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    issued = create_token_pair(str(user.id))
    consumed = session.execute(
        update(RefreshToken)
        .where(RefreshToken.id == refresh_token.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    if consumed.rowcount != 1:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    session.add(
        RefreshToken(
            jti=issued.refresh_token_id,
            user_id=user.id,
            expires_at=issued.refresh_expires_at,
        )
    )
    session.commit()
    tokens = TokenPair(access_token=issued.access_token, refresh_token=issued.refresh_token)
    return {"success": True, "message": "Tokens refreshed.", "data": tokens}