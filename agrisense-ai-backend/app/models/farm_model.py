from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    soil_type = Column(String, nullable=True)
    farm_size = Column(Float, nullable=True)
    water_source = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
