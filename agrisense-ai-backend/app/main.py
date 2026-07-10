from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

from app.models.user_model import User
from app.models.farm_model import Farm
from app.models.crop_model import Crop
from app.models.prediction_model import DiseasePrediction
from app.models.weather_model import WeatherData
from app.models.chat_model import ChatHistory
from app.models.report_model import Report

from app.routes import auth_routes, user_routes, farm_routes, crop_routes, ai_routes, weather_routes, report_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriSense-AI Backend",
    description="Backend API for AgriSense-AI smart farming assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AgriSense-AI Backend is running successfully"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AgriSense-AI Backend"}


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(farm_routes.router)
app.include_router(crop_routes.router)
app.include_router(ai_routes.router)
app.include_router(weather_routes.router)
app.include_router(report_routes.router)
