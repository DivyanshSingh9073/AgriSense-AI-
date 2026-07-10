from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any
from app.routes.user_routes import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/reports", tags=["Reports"])


class ReportGenerateRequest(BaseModel):
    farm_id: int | None = None
    report_type: str
    report_data: dict[str, Any] | None = None


@router.post("/generate")
def generate_report(request: ReportGenerateRequest, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Report generation placeholder API working",
        "report": {
            "user_id": current_user.id,
            "farm_id": request.farm_id,
            "report_type": request.report_type,
            "summary": "Farm condition looks stable. Monitor rainfall and crop disease symptoms."
        }
    }


@router.get("/")
def get_reports(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Reports list placeholder API working",
        "reports": []
    }
