from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FarmCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    farm_name: str = Field(min_length=2, max_length=120)
    location: str = Field(min_length=2, max_length=255)
    soil_type: str | None = Field(default=None, max_length=80)
    farm_size: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    water_source: str | None = Field(default=None, max_length=120)

    @field_validator("farm_name", "location")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Must contain at least 2 non-whitespace characters.")
        return normalized

    @field_validator("soil_type", "water_source")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class FarmUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    farm_name: str | None = Field(default=None, min_length=2, max_length=120)
    location: str | None = Field(default=None, min_length=2, max_length=255)
    soil_type: str | None = Field(default=None, max_length=80)
    farm_size: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    water_source: str | None = Field(default=None, max_length=120)

    @field_validator("farm_name", "location")
    @classmethod
    def normalize_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Must contain at least 2 non-whitespace characters.")
        return normalized

    @field_validator("soil_type", "water_source")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class FarmResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: UUID
    farm_name: str
    location: str
    soil_type: str | None
    farm_size: float | None
    water_source: str | None
    created_at: datetime
    updated_at: datetime