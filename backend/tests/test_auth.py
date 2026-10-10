import asyncio
from datetime import datetime, timedelta, timezone

import httpx
import jwt
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.auth.security import hash_password, verify_password
from app.core.config import get_settings
from app.db.base import Base
from app.db.database import get_db_session
from app.db.models import User
from app.main import app


@pytest.fixture
def auth_client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-only-jwt-secret-that-is-at-least-32-bytes-long")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
    monkeypatch.setenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_db_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db_session] = override_db_session

    async def request(method: str, path: str, **kwargs) -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.request(method, path, **kwargs)

    yield request, engine

    app.dependency_overrides.pop(get_db_session, None)
    engine.dispose()


def api_request(auth_client, method: str, path: str, **kwargs) -> httpx.Response:
    request, _ = auth_client
    return asyncio.run(request(method, path, **kwargs))


def test_register_persists_password_hash_and_returns_frontend_shape(auth_client) -> None:
    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "Farmer@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["user"]["email"] == "farmer@example.com"
    assert payload["data"]["user"]["isEmailVerified"] is False
    assert payload["data"]["user"]["role"] == "farmer"
    assert payload["data"]["user"]["createdAt"]
    assert payload["data"]["user"]["avatarUrl"] is None
    assert payload["data"]["tokens"]["accessToken"]
    assert payload["data"]["tokens"]["refreshToken"]
    assert "password" not in response.text
    assert "password_hash" not in response.text

    engine = auth_client[1]
    with Session(engine) as session:
        user = session.scalar(select(User).where(User.email == "farmer@example.com"))
        assert user is not None
        assert user.password_hash != "StrongPass1"
        assert verify_password("StrongPass1", user.password_hash)


def test_register_rejects_duplicate_email_case_insensitively(auth_client) -> None:
    body = {"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"}
    first = api_request(auth_client, "POST", "/api/v1/auth/register", json=body)
    duplicate = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={**body, "email": "FARMER@example.com"},
    )

    assert first.status_code == 201
    assert duplicate.status_code == 409


def test_login_accepts_valid_credentials_and_rejects_incorrect_password(auth_client) -> None:
    body = {"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"}
    api_request(auth_client, "POST", "/api/v1/auth/register", json=body)

    success = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "farmer@example.com", "password": "StrongPass1"},
    )
    failure = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "farmer@example.com", "password": "WrongPass1"},
    )

    assert success.status_code == 200
    assert success.json()["data"]["tokens"]["accessToken"]
    assert failure.status_code == 401
    assert failure.json()["detail"] == "Invalid email or password."


def test_me_requires_valid_access_token_and_returns_safe_profile(auth_client) -> None:
    registration = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    ).json()
    tokens = registration["data"]["tokens"]

    missing = api_request(auth_client, "GET", "/api/v1/auth/me")
    valid = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['accessToken']}"},
    )
    wrong_type = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['refreshToken']}"},
    )

    assert missing.status_code == 401
    assert valid.status_code == 200
    assert valid.json()["data"]["email"] == "farmer@example.com"
    assert "password_hash" not in valid.text
    assert wrong_type.status_code == 401


def test_me_rejects_expired_token(auth_client) -> None:
    _, engine = auth_client
    with Session(engine) as session:
        user = User(name="Test Farmer", email="farmer@example.com", password_hash=hash_password("StrongPass1"))
        session.add(user)
        session.commit()
        subject = str(user.id)

    now = datetime.now(timezone.utc)
    expired = jwt.encode(
        {
            "sub": subject,
            "type": "access",
            "iat": now - timedelta(minutes=2),
            "exp": now - timedelta(minutes=1),
            "jti": "expired-access-token-id",
        },
        get_settings().jwt_secret_key,
        algorithm="HS256",
    )
    response = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired}"},
    )

    assert response.status_code == 401


def test_me_rejects_malformed_or_tampered_tokens(auth_client) -> None:
    malformed = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-jwt"},
    )
    tampered = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4IiwidHlwZSI6ImFjY2VzcyIsImV4cCI6NDEwMjQ0NDgwMH0.invalid"},
    )

    assert malformed.status_code == 401
    assert tampered.status_code == 401
    assert "not-a-jwt" not in malformed.text


def test_me_rejects_token_signed_with_unconfigured_algorithm(auth_client) -> None:
    _, engine = auth_client
    with Session(engine) as session:
        user = User(name="Test Farmer", email="farmer@example.com", password_hash=hash_password("StrongPass1"))
        session.add(user)
        session.commit()
        subject = str(user.id)

    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": subject,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=5),
            "jti": "valid-looking-token-id",
        },
        get_settings().jwt_secret_key,
        algorithm="HS384",
    )
    response = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert token not in response.text


def test_refresh_rotates_frontend_compatible_token_pair(auth_client) -> None:
    registration = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    ).json()
    old_refresh = registration["data"]["tokens"]["refreshToken"]
    access_token = registration["data"]["tokens"]["accessToken"]

    access_as_refresh = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/refresh",
        json={"refreshToken": access_token},
    )
    assert access_as_refresh.status_code == 401

    response = api_request(auth_client, "POST", "/api/v1/auth/refresh", json={"refreshToken": old_refresh})

    assert response.status_code == 200
    assert response.json()["data"]["accessToken"]
    assert response.json()["data"]["refreshToken"] != old_refresh

    replay = api_request(auth_client, "POST", "/api/v1/auth/refresh", json={"refreshToken": old_refresh})
    assert replay.status_code == 401


def test_registration_does_not_create_user_when_jwt_is_unconfigured(
    auth_client,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)

    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 503
    with Session(auth_client[1]) as session:
        assert session.scalar(select(User)) is None


def test_registration_validates_email_and_password_policy(auth_client) -> None:
    invalid_email = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "invalid", "password": "StrongPass1"},
    )
    weak_password = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "weakpassword"},
    )

    assert invalid_email.status_code == 422
    assert weak_password.status_code == 422
    assert "weakpassword" not in weak_password.text
    assert weak_password.json()["message"] == "Request validation failed."


def test_malformed_stored_hash_fails_closed() -> None:
    assert verify_password("StrongPass1", "not-a-valid-hash") is False


def test_login_rejects_unknown_email_with_same_public_error(auth_client) -> None:
    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."