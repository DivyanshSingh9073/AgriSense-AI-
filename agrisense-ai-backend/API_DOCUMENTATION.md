# AgriSense-AI Backend API Documentation

Base URL local: `http://127.0.0.1:8000`
Swagger Docs: `http://127.0.0.1:8000/docs`

## Health

### GET `/`
Checks backend home route.

### GET `/health`
Checks backend health.

## Authentication

### POST `/auth/register`
Request:
```json
{
  "full_name": "Prasanna",
  "email": "prasanna@example.com",
  "phone": "9876543210",
  "password": "123456"
}
```

### POST `/auth/login`
Request:
```json
{
  "email": "prasanna@example.com",
  "password": "123456"
}
```

Response:
```json
{
  "access_token": "token_here",
  "token_type": "bearer"
}
```

Use `Bearer token_here` for protected APIs.

## Users

### GET `/users/profile`
Protected route. Returns logged-in user profile.

## Farms

### POST `/farms/`
Create farm.

### GET `/farms/`
Get all farms of logged-in user.

### GET `/farms/{farm_id}`
Get one farm.

### PUT `/farms/{farm_id}`
Update farm.

### DELETE `/farms/{farm_id}`
Delete farm.

## Crops

### POST `/crops/`
Create crop.

### GET `/crops/`
Get all crops.

### GET `/crops/{crop_id}`
Get one crop.

### PUT `/crops/{crop_id}`
Update crop.

### DELETE `/crops/{crop_id}`
Delete crop.

## AI Placeholder APIs

### POST `/ai/disease-detection`
Disease detection placeholder.

### POST `/ai/crop-recommendation`
Crop recommendation placeholder.

### POST `/ai/weather-analysis`
Weather analysis placeholder.

### POST `/ai/chatbot`
AI chatbot placeholder.

### POST `/ai/yield-prediction`
Future yield prediction placeholder.

## Weather Placeholder APIs

### GET `/weather/current?location=Andhra Pradesh`
Current weather placeholder.

### GET `/weather/forecast?location=Andhra Pradesh`
Forecast placeholder.

### POST `/weather/save`
Save weather placeholder.

## Reports Placeholder APIs

### POST `/reports/generate`
Generate report placeholder.

### GET `/reports/`
Get reports placeholder.
