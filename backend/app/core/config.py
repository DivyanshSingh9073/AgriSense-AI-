import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_env: str
    cors_origins: tuple[str, ...]
    database_url: str | None


def get_settings() -> Settings:
    app_env = os.getenv("APP_ENV", "development").strip().lower()
    default_origins = "http://localhost:5173" if app_env != "production" else ""
    origins = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", default_origins).split(",")
        if origin.strip()
    )

    if "*" in origins:
        raise ValueError("CORS_ORIGINS must list specific origins; wildcard origins are not allowed.")

    database_url = os.getenv("DATABASE_URL", "").strip() or None

    return Settings(
        app_env=app_env,
        cors_origins=origins,
        database_url=database_url,
    )