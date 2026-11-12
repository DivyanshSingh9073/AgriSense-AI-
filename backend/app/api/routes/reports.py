from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.schemas.report import (
    GenerateReportRequest,
    GenerateReportResponse,
    ReportListResponse,
    ReportResponse,
)
from app.auth.dependencies import get_current_user
from app.db.database import get_db_session
from app.db.models import Farm, Report, User
from app.services.reports import generate_report

router = APIRouter(prefix="/reports", tags=["reports"])


def _report_response(report: Report, farm_name: str | None = None) -> ReportResponse:
    return ReportResponse.model_validate(report).model_copy(update={"farm_name": farm_name})


@router.get("", response_model=ReportListResponse)
def list_reports(
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> ReportListResponse:
    try:
        rows = session.execute(
            select(Report, Farm.farm_name)
            .outerjoin(Farm, Report.farm_id == Farm.id)
            .where(Report.user_id == user.id)
            .order_by(Report.created_at.desc(), Report.id.desc())
        ).all()
    except SQLAlchemyError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Report history could not be loaded.",
        ) from None
    return ReportListResponse(
        reports=[_report_response(report, farm_name) for report, farm_name in rows]
    )


@router.post("/generate", response_model=GenerateReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: GenerateReportRequest,
    session: Session = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> GenerateReportResponse:
    try:
        report, farm_name = generate_report(session, user, payload)
        session.commit()
        session.refresh(report)
    except SQLAlchemyError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Report could not be generated.",
        ) from None
    return GenerateReportResponse(report=_report_response(report, farm_name))
