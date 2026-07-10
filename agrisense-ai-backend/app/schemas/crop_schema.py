from pydantic import BaseModel
from typing import Optional
from datetime import date


class CropCreate(BaseModel):
    farm_id: int
    crop_name: str
    season: Optional[str] = None
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    status: Optional[str] = "active"


class CropUpdate(BaseModel):
    crop_name: Optional[str] = None
    season: Optional[str] = None
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    status: Optional[str] = None


class CropResponse(BaseModel):
    id: int
    farm_id: int
    crop_name: str
    season: Optional[str] = None
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    status: str

    class Config:
        from_attributes = True
