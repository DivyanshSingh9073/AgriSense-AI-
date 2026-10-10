import pytest

from app.core.config import get_settings


def test_production_cors_uses_configured_specific_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.com,https://admin.example.com")

    settings = get_settings()

    assert settings.cors_origins == (
        "https://app.example.com",
        "https://admin.example.com",
    )


def test_wildcard_cors_origin_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "*")

    with pytest.raises(ValueError, match="specific origins"):
        get_settings()


def test_database_url_is_optional_and_read_from_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_settings().database_url is None

    monkeypatch.setenv("DATABASE_URL", " postgresql+psycopg://user:pass@localhost/db ")
    assert get_settings().database_url == "postgresql+psycopg://user:pass@localhost/db"