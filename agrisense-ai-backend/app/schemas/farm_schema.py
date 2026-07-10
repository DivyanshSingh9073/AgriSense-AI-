from pydantic import BaseModel
from typing import Optional


class FarmCreate(BaseModel):
    farm_name: str
    location: str
    soil_type: Optional[str] = None
    farm_size: Optional[float] = None
    water_source: Optional[str] = None


class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    location: Optional[str] = None
    soil_type: Optional[str] = None
    farm_size: Optional[float] = None
    water_source: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    location: str
    soil_type: Optional[str] = None
    farm_size: Optional[float] = None
    water_source: Optional[str] = None

    class Config:
        from_attributes = True
