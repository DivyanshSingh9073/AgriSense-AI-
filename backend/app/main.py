from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="AgriSense AI API", version="0.1.0")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors: dict[str, list[str]] = {}
    for error in exc.errors():
        location = error.get("loc", ())
        field = str(location[-1]) if location else "request"
        errors.setdefault(field, []).append(str(error.get("msg", "Invalid value.")))
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Request validation failed.", "errors": errors},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(api_router)