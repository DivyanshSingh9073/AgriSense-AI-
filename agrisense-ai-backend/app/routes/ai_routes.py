from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.routes.user_routes import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/ai", tags=["AI Services"])


class CropRecommendationRequest(BaseModel):
    soil_type: str
    location: str
    season: str
    rainfall: float
    temperature: float


class WeatherAnalysisRequest(BaseModel):
    location: str
    temperature: float
    humidity: float
    rainfall: float


class ChatbotRequest(BaseModel):
    question: str
    language: str = "English"


class YieldPredictionRequest(BaseModel):
    crop_name: str
    farm_size: float
    rainfall: float
    temperature: float
    soil_type: str


@router.post("/disease-detection")
def disease_detection(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Disease detection placeholder API working",
        "prediction": "Tomato Leaf Blight",
        "confidence": 0.91,
        "recommendation": "Avoid excess moisture and use suitable fungicide."
    }


@router.post("/crop-recommendation")
def crop_recommendation(request: CropRecommendationRequest, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Crop recommendation placeholder API working",
        "recommended_crops": ["Tomato", "Chilli", "Groundnut"],
        "input_data": request.model_dump()
    }


@router.post("/weather-analysis")
def weather_analysis(request: WeatherAnalysisRequest, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Weather analysis placeholder API working",
        "analysis": "Weather is suitable for irrigation planning.",
        "input_data": request.model_dump()
    }


@router.post("/chatbot")
def ai_chatbot(request: ChatbotRequest, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "AI chatbot placeholder API working",
        "question": request.question,
        "answer": "This is a placeholder chatbot answer for AgriSense-AI."
    }


@router.post("/yield-prediction")
def yield_prediction(request: YieldPredictionRequest, current_user: User = Depends(get_current_user)):
    estimated_yield = request.farm_size * 12
    return {
        "status": "success",
        "message": "Yield prediction placeholder API working",
        "estimated_yield_quintals": estimated_yield,
        "input_data": request.model_dump()
    }
