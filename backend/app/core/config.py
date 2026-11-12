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
    frontend_base_url: str
    email_verification_expire_minutes: int
    email_verification_resend_cooldown_seconds: int
    email_verification_max_resends_per_hour: int
    email_verification_max_attempts: int
    smtp_host: str | None
    smtp_port: int
    smtp_username: str | None
    smtp_password: str | None
    smtp_from_address: str | None
    smtp_use_starttls: bool


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
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").strip().rstrip("/")
    email_verification_expire_minutes = int(os.getenv("EMAIL_VERIFICATION_EXPIRE_MINUTES", "30"))
    email_verification_resend_cooldown_seconds = int(os.getenv("EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS", "60"))
    email_verification_max_resends_per_hour = int(os.getenv("EMAIL_VERIFICATION_MAX_RESENDS_PER_HOUR", "5"))
    email_verification_max_attempts = int(os.getenv("EMAIL_VERIFICATION_MAX_ATTEMPTS", "5"))
    smtp_host = os.getenv("SMTP_HOST", "").strip() or None
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME", "").strip() or None
    smtp_password = os.getenv("SMTP_PASSWORD", "") or None
    smtp_from_address = os.getenv("SMTP_FROM_ADDRESS", "").strip() or None
    smtp_tls_value = os.getenv("SMTP_USE_STARTTLS", "true").strip().lower()

    if smtp_tls_value not in {"true", "false", "1", "0", "yes", "no"}:
        raise ValueError("SMTP_USE_STARTTLS must be a boolean value.")
    smtp_use_starttls = smtp_tls_value in {"true", "1", "yes"}

    if min(
        access_token_expire_minutes,
        refresh_token_expire_days,
        smtp_port,
        email_verification_expire_minutes,
        email_verification_resend_cooldown_seconds,
        email_verification_max_resends_per_hour,
        email_verification_max_attempts,
    ) < 1:
        raise ValueError("Token, SMTP, and verification settings must be positive integers.")
    if smtp_port > 65535:
        raise ValueError("SMTP_PORT must be a valid TCP port.")

    if (smtp_username is None) != (smtp_password is None):
        raise ValueError("SMTP_USERNAME and SMTP_PASSWORD must be configured together.")

    if app_env == "production" and smtp_host and not smtp_use_starttls:
        raise ValueError("Production SMTP requires STARTTLS.")

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
        smtp_host=os.getenv("SMTP_HOST", "").strip() or None,
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME", "").strip() or None,
        smtp_password=os.getenv("SMTP_PASSWORD", "") or None,
        smtp_from_address=os.getenv("SMTP_FROM_ADDRESS", "").strip() or None,
        smtp_use_starttls=smtp_use_starttls,
        frontend_base_url=frontend_base_url,
        email_verification_expire_minutes=email_verification_expire_minutes,
        email_verification_resend_cooldown_seconds=email_verification_resend_cooldown_seconds,
        email_verification_max_resends_per_hour=email_verification_max_resends_per_hour,
        email_verification_max_attempts=email_verification_max_attempts,
    )