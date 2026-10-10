import pytest

from app.core.config import get_settings


def test_production_cors_uses_configured_specific_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.com,https://admin.example.com")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-only-production-key-that-is-long-enough")

    settings = get_settings()

    assert settings.cors_origins == (
        "https://app.example.com",
        "https://admin.example.com",
    )


def test_wildcard_cors_origin_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "*")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-only-production-key-that-is-long-enough")

    with pytest.raises(ValueError, match="specific origins"):
        get_settings()


def test_database_url_is_optional_and_read_from_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_settings().database_url is None

    monkeypatch.setenv("DATABASE_URL", " postgresql+psycopg://user:pass@localhost/db ")
    assert get_settings().database_url == "postgresql+psycopg://user:pass@localhost/db"


@pytest.mark.parametrize(
    "secret",
    [
        None,
        "short-secret",
        "replace_with_a_random_secret_of_at_least_32_bytes",
        "a" * 64,
    ],
)
def test_production_rejects_missing_or_insecure_jwt_secret(
    monkeypatch: pytest.MonkeyPatch,
    secret: str | None,
) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.com")
    if secret is None:
        monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    else:
        monkeypatch.setenv("JWT_SECRET_KEY", secret)

    with pytest.raises(ValueError, match="JWT_SECRET_KEY"):
        get_settings()