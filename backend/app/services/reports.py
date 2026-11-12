from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.schemas.report import (
    FarmProfileSnapshot,
    GenerateReportRequest,
    ReportContent,
    ReportType,
)
from app.db.models import Farm, Report, User

REPORT_TITLES: dict[ReportType, str] = {
    "crop_health": "Crop Health",
    "weather_summary": "Weather Summary",
    "soil_analysis": "Soil Analysis",
    "yield_forecast": "Yield Forecast",
}

UNAVAILABLE_DATA: dict[ReportType, str] = {
    "crop_health": "Crop-health observations, disease scans, and crop measurements",
    "weather_summary": "Weather observations and forecasts",
    "soil_analysis": "Soil test results, nutrient measurements, and moisture readings",
    "yield_forecast": "Crop details, planting data, and historical yield measurements",
}


def _format_farm_profile(farm: Farm) -> str:
    details = [f"location: {farm.location}"]
    if farm.farm_size is not None:
        details.append(f"size: {farm.farm_size.normalize():f} acres")
    if farm.soil_type:
        details.append(f"recorded soil type: {farm.soil_type}")
    if farm.water_source:
        details.append(f"recorded water source: {farm.water_source}")
    return f"{farm.farm_name} ({'; '.join(details)})"


def _report_summary(report_type: ReportType, farms: list[Farm]) -> str:
    label = REPORT_TITLES[report_type]
    missing = UNAVAILABLE_DATA[report_type].lower()
    if not farms:
        return (
            f"{label} report generated. No farm records are available; add a farm to include its recorded profile. "
            f"No assessment is made because {missing} are not available."
        )

    farm_word = "farm profile" if len(farms) == 1 else "farm profiles"
    profiles = "; ".join(_format_farm_profile(farm) for farm in farms)
    return (
        f"{label} report generated from {len(farms)} {farm_word}: {profiles}. "
        f"No assessment is made because {missing} are not available."
    )


def generate_report(
    session: Session,
    user: User,
    payload: GenerateReportRequest,
) -> tuple[Report, str | None]:
    if payload.farm_id is None:
        farms = list(
            session.scalars(
                select(Farm).where(Farm.user_id == user.id).order_by(Farm.id)
            ).all()
        )
    else:
        farm = session.scalar(
            select(Farm).where(Farm.id == payload.farm_id, Farm.user_id == user.id)
        )
        if farm is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
        farms = [farm]

    content = ReportContent(
        farm_profiles=[
            FarmProfileSnapshot(
                id=farm.id,
                name=farm.farm_name,
                location=farm.location,
                farm_size=float(farm.farm_size) if farm.farm_size is not None else None,
                soil_type=farm.soil_type,
                water_source=farm.water_source,
            )
            for farm in farms
        ],
        unavailable_data=[UNAVAILABLE_DATA[payload.report_type]],
        limitations=[
            "This rule-based report uses only stored farm-profile fields.",
            "No weather service, AI service, sensor readings, laboratory results, crop-health measurements, or yield records are used.",
        ],
    )
    title = f"{REPORT_TITLES[payload.report_type]} Report"
    if payload.farm_id is not None:
        title = f"{title} — {farms[0].farm_name}"

    report = Report(
        user_id=user.id,
        farm_id=payload.farm_id,
        report_type=payload.report_type,
        title=title,
        summary=_report_summary(payload.report_type, farms),
        content=content.model_dump(mode="json"),
    )
    session.add(report)
    return report, farms[0].farm_name if payload.farm_id is not None else None
