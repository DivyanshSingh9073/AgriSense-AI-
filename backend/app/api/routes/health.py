from fastapi import APIRouter, HTTPException

from app.db.database import check_database_connection

router = APIRouter()


@router.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Confirm that the API process is responding."""
    return {"status": "ok"}


@router.get("/health/ready", tags=["health"])
def readiness() -> dict[str, str]:
    """Report whether the API can currently reach its database."""
    if not check_database_connection():
        raise HTTPException(
            status_code=503,
            detail={"status": "not_ready", "database": "unavailable"},
        )
    return {"status": "ready", "database": "ok"}