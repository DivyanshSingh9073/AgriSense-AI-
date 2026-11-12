from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ReportType = Literal["crop_health", "weather_summary", "soil_analysis", "yield_forecast"]


class GenerateReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    farm_id: int | None = Field(default=None, gt=0)
    report_type: ReportType


class FarmProfileSnapshot(BaseModel):
    id: int
    name: str
    location: str
    farm_size: float | None
    soil_type: str | None
    water_source: str | None


class ReportContent(BaseModel):
    farm_profiles: list[FarmProfileSnapshot]
    unavailable_data: list[str]
    limitations: list[str]


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    farm_id: int | None
    farm_name: str | None = None
    report_type: ReportType
    title: str
    summary: str
    content: ReportContent
    created_at: datetime
    updated_at: datetime


class ReportListResponse(BaseModel):
    reports: list[ReportResponse]


class GenerateReportResponse(BaseModel):
    report: ReportResponse
