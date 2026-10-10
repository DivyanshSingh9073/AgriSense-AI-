import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_env: str
    cors_origins: tuple[str, ...]
    database_url: str | None
    jwt_secret_key: str | None
    access_token_expire_minutes: int
    refresh_token_expire_days: int


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
    jwt_secret_key = os.getenv("JWT_SECRET_KEY", "").strip() or None
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    if access_token_expire_minutes < 1 or refresh_token_expire_days < 1:
        raise ValueError("Token expiration settings must be positive integers.")

    if app_env == "production":
        if not jwt_secret_key or len(jwt_secret_key.encode("utf-8")) < 32:
            raise ValueError("Production requires a JWT_SECRET_KEY of at least 32 bytes.")
        if len(set(jwt_secret_key)) < 16:
            raise ValueError("Production JWT_SECRET_KEY must contain sufficient character diversity.")
        if any(marker in jwt_secret_key.lower() for marker in ("replace_", "change_me", "placeholder", "example")):
            raise ValueError("Production JWT_SECRET_KEY must not be a placeholder value.")

    return Settings(
        app_env=app_env,
        cors_origins=origins,
        database_url=database_url,
        jwt_secret_key=jwt_secret_key,
        access_token_expire_minutes=access_token_expire_minutes,
        refresh_token_expire_days=refresh_token_expire_days,
    )