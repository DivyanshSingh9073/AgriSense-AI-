from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.routes.user_routes import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/weather", tags=["Weather"])


class WeatherSaveRequest(BaseModel):
    location: str
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None
    wind_speed: float | None = None
    weather_condition: str | None = None


@router.get("/current")
def current_weather(location: str, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Weather placeholder API working",
        "location": location,
        "temperature": 31.2,
        "humidity": 70,
        "rainfall": 12.5,
        "condition": "Cloudy"
    }


@router.get("/forecast")
def weather_forecast(location: str, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Weather forecast placeholder API working",
        "location": location,
        "forecast": [
            {"day": "Day 1", "condition": "Cloudy", "rainfall": 10},
            {"day": "Day 2", "condition": "Sunny", "rainfall": 0},
            {"day": "Day 3", "condition": "Rain", "rainfall": 20}
        ]
    }


@router.post("/save")
def save_weather(request: WeatherSaveRequest, current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Weather data save placeholder working",
        "data": request.model_dump()
    }
