from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.crop_model import Crop
from app.models.farm_model import Farm
from app.models.user_model import User
from app.schemas.crop_schema import CropCreate, CropUpdate, CropResponse
from app.routes.user_routes import get_current_user

router = APIRouter(prefix="/crops", tags=["Crops"])


def _get_user_farm(db: Session, farm_id: int, user_id: int):
    return db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()


@router.post("/", response_model=CropResponse)
def create_crop(crop: CropCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = _get_user_farm(db, crop.farm_id, current_user.id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    new_crop = Crop(**crop.model_dump())
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop


@router.get("/", response_model=list[CropResponse])
def get_crops(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Crop).join(Farm, Crop.farm_id == Farm.id).filter(Farm.user_id == current_user.id).all()


@router.get("/{crop_id}", response_model=CropResponse)
def get_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.query(Crop).join(Farm, Crop.farm_id == Farm.id).filter(Crop.id == crop_id, Farm.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(crop_id: int, crop_update: CropUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.query(Crop).join(Farm, Crop.farm_id == Farm.id).filter(Crop.id == crop_id, Farm.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    for key, value in crop_update.model_dump(exclude_unset=True).items():
        setattr(crop, key, value)

    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}")
def delete_crop(crop_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    crop = db.query(Crop).join(Farm, Crop.farm_id == Farm.id).filter(Crop.id == crop_id, Farm.user_id == current_user.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return {"message": "Crop deleted successfully"}
