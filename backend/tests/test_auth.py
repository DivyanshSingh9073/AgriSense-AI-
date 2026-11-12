import asyncio
import hashlib
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlsplit
from uuid import UUID

import httpx
import jwt
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.auth import email_verification as email_verification_service
from app.auth.security import create_token_pair, hash_password, verify_password
from app.core.config import get_settings
from app.db.base import Base
from app.db.database import get_db_session
from app.db.models import EmailVerificationChallenge, RefreshToken, User
from app.main import app
from app.services.email import EmailDeliveryError


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
    outbox: list[tuple[str, str]] = []
    monkeypatch.setattr(
        email_verification_service,
        "send_verification_email",
        lambda recipient, url: outbox.append((recipient, url)),
    )

    async def request(method: str, path: str, **kwargs) -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.request(method, path, **kwargs)

    yield request, engine, outbox

    app.dependency_overrides.pop(get_db_session, None)
    engine.dispose()


def api_request(auth_client, method: str, path: str, **kwargs) -> httpx.Response:
    request, _, _ = auth_client
    return asyncio.run(request(method, path, **kwargs))


def sent_verification_token(auth_client) -> str:
    outbox = auth_client[2]
    assert outbox
    return parse_qs(urlsplit(outbox[-1][1]).query)["token"][0]


def test_register_sends_verification_link_without_issuing_session(auth_client) -> None:
    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "Farmer@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 202
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["email"] == "farmer@example.com"
    assert payload["data"]["emailSent"] is True
    assert "tokens" not in payload["data"]
    assert "password" not in response.text
    assert "password_hash" not in response.text
    assert auth_client[2][-1][0] == "farmer@example.com"
    assert sent_verification_token(auth_client) not in response.text

    engine = auth_client[1]
    with Session(engine) as session:
        user = session.scalar(select(User).where(User.email == "farmer@example.com"))
        assert user is not None
        assert user.is_email_verified is False
        assert user.password_hash != "StrongPass1"
        assert verify_password("StrongPass1", user.password_hash)
        challenge = session.scalar(select(EmailVerificationChallenge).where(EmailVerificationChallenge.user_id == user.id))
        assert challenge is not None
        assert challenge.code_hash == hashlib.sha256(sent_verification_token(auth_client).rsplit(".", 1)[1].encode()).hexdigest()

    verified = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/verify-email",
        json={"token": sent_verification_token(auth_client)},
    )
    assert verified.status_code == 200
    assert verified.json()["data"]["verified"] is True
    with Session(engine) as session:
        user = session.scalar(select(User).where(User.email == "farmer@example.com"))
        assert user.is_email_verified is True


def test_register_rejects_duplicate_email_case_insensitively(auth_client) -> None:
    body = {"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"}
    first = api_request(auth_client, "POST", "/api/v1/auth/register", json=body)
    duplicate = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={**body, "email": "FARMER@example.com"},
    )

    assert first.status_code == 202
    assert duplicate.status_code == 202
    assert first.json()["message"] == duplicate.json()["message"]
    assert first.json()["data"]["email"] == duplicate.json()["data"]["email"]
    assert duplicate.json()["data"]["emailSent"] is False
    with Session(auth_client[1]) as session:
        assert session.query(User).where(User.email == "farmer@example.com").count() == 1


def test_login_accepts_valid_credentials_and_rejects_incorrect_password(auth_client) -> None:
    body = {"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"}
    api_request(auth_client, "POST", "/api/v1/auth/register", json=body)
    token = sent_verification_token(auth_client)
    assert api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": token}).status_code == 200

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
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    assert api_request(
        auth_client,
        "POST",
        "/api/v1/auth/verify-email",
        json={"token": sent_verification_token(auth_client)},
    ).status_code == 200
    tokens = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "farmer@example.com", "password": "StrongPass1"},
    ).json()["data"]["tokens"]

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
    _, engine, _ = auth_client
    with Session(engine) as session:
        user = User(name="Test Farmer", email="farmer@example.com", password_hash=hash_password("StrongPass1"), is_email_verified=True)
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
    _, engine, _ = auth_client
    with Session(engine) as session:
        user = User(name="Test Farmer", email="farmer@example.com", password_hash=hash_password("StrongPass1"), is_email_verified=True)
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
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    token_pair = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "farmer@example.com", "password": "StrongPass1"},
    )
    assert token_pair.status_code == 403
    assert api_request(
        auth_client,
        "POST",
        "/api/v1/auth/verify-email",
        json={"token": sent_verification_token(auth_client)},
    ).status_code == 200
    token_pair = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "farmer@example.com", "password": "StrongPass1"},
    ).json()["data"]["tokens"]
    old_refresh = token_pair["refreshToken"]
    access_token = token_pair["accessToken"]

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


def test_registration_rolls_back_new_user_when_email_delivery_fails(
    auth_client,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_delivery(recipient: str, url: str) -> None:
        raise EmailDeliveryError("Email delivery failed.")

    monkeypatch.setattr(email_verification_service, "send_verification_email", fail_delivery)

    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )

    assert response.status_code == 503
    with Session(auth_client[1]) as session:
        assert session.scalar(select(User)) is None


def test_resend_is_generic_for_unknown_email_and_rate_limited_per_address(auth_client) -> None:
    first = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/resend-verification",
        json={"email": "not-registered@example.com"},
    )
    second = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/resend-verification",
        json={"email": "not-registered@example.com"},
    )

    assert first.status_code == 202
    assert first.json()["data"]["emailSent"] is True
    assert second.status_code == 202
    assert second.json()["message"] == first.json()["message"]
    assert second.json()["data"]["emailSent"] is False
    assert second.json()["data"]["retryAfterSeconds"] > 0


def test_verification_rejects_invalid_expired_and_reused_tokens(auth_client) -> None:
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    token = sent_verification_token(auth_client)

    invalid = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": token + "bad"})
    assert invalid.status_code == 400

    expired_token = token
    challenge_id = UUID(expired_token.split(".", 1)[0])
    with Session(auth_client[1]) as session:
        row = session.get(EmailVerificationChallenge, challenge_id)
        row.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        session.commit()
    expired = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": expired_token})
    assert expired.status_code == 400


def test_verification_token_is_single_use(auth_client) -> None:
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    token = sent_verification_token(auth_client)

    first = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": token})
    replay = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": token})

    assert first.status_code == 200
    assert first.json()["data"]["verified"] is True
    assert replay.status_code == 400


def test_verification_attempts_are_limited(auth_client, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("EMAIL_VERIFICATION_MAX_ATTEMPTS", "2")
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    token = sent_verification_token(auth_client)
    challenge_id, secret = token.split(".", 1)

    bad_token = f"{challenge_id}.{secret[:-1]}x"
    first = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": bad_token})
    second = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": bad_token})
    correct = api_request(auth_client, "POST", "/api/v1/auth/verify-email", json={"token": token})

    assert first.status_code == 400
    assert second.status_code == 429
    assert correct.status_code == 429


def test_resend_hourly_limit_is_enforced(auth_client, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("EMAIL_VERIFICATION_MAX_RESENDS_PER_HOUR", "2")
    monkeypatch.setenv("EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS", "1")
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    email_hash = email_verification_service._email_hash("farmer@example.com")

    with Session(auth_client[1]) as session:
        challenge = session.scalar(
            select(EmailVerificationChallenge).where(EmailVerificationChallenge.email_hash == email_hash)
        )
        challenge.last_sent_at = datetime.now(timezone.utc) - timedelta(seconds=2)
        session.commit()

    second = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/resend-verification",
        json={"email": "farmer@example.com"},
    )
    assert second.json()["data"]["emailSent"] is True

    with Session(auth_client[1]) as session:
        challenge = session.scalar(
            select(EmailVerificationChallenge).where(EmailVerificationChallenge.email_hash == email_hash)
        )
        challenge.last_sent_at = datetime.now(timezone.utc) - timedelta(seconds=2)
        session.commit()

    third = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/resend-verification",
        json={"email": "farmer@example.com"},
    )
    assert third.status_code == 202
    assert third.json()["data"]["emailSent"] is False
    assert third.json()["data"]["retryAfterSeconds"] > 0


def test_resend_smtp_failure_rolls_back_challenge_state(auth_client, monkeypatch: pytest.MonkeyPatch) -> None:
    api_request(
        auth_client,
        "POST",
        "/api/v1/auth/register",
        json={"name": "Test Farmer", "email": "farmer@example.com", "password": "StrongPass1"},
    )
    email_hash = email_verification_service._email_hash("farmer@example.com")
    with Session(auth_client[1]) as session:
        challenge = session.scalar(
            select(EmailVerificationChallenge).where(EmailVerificationChallenge.email_hash == email_hash)
        )
        challenge.last_sent_at = datetime.now(timezone.utc) - timedelta(minutes=2)
        session.commit()
        original_hash = challenge.code_hash
        original_count = challenge.resend_count

    def fail_delivery(recipient: str, url: str) -> None:
        raise EmailDeliveryError("Email delivery failed.")

    monkeypatch.setattr(email_verification_service, "send_verification_email", fail_delivery)
    response = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/resend-verification",
        json={"email": "farmer@example.com"},
    )
    assert response.status_code == 503
    with Session(auth_client[1]) as session:
        challenge = session.scalar(
            select(EmailVerificationChallenge).where(EmailVerificationChallenge.email_hash == email_hash)
        )
        assert challenge.code_hash == original_hash
        assert challenge.resend_count == original_count


def test_unverified_legacy_access_token_is_rejected_by_me(auth_client) -> None:
    _, engine, _ = auth_client
    with Session(engine) as session:
        user = User(
            name="Legacy Farmer",
            email="legacy@example.com",
            password_hash=hash_password("StrongPass1"),
            is_email_verified=False,
        )
        session.add(user)
        session.commit()
        issued = create_token_pair(str(user.id))
        access_token = issued.access_token
        session.add(
            RefreshToken(
                jti=issued.refresh_token_id,
                user_id=user.id,
                expires_at=issued.refresh_expires_at,
            )
        )
        session.commit()

    response = api_request(
        auth_client,
        "GET",
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 403

    login = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/login",
        json={"email": "legacy@example.com", "password": "StrongPass1"},
    )
    refresh = api_request(
        auth_client,
        "POST",
        "/api/v1/auth/refresh",
        json={"refreshToken": issued.refresh_token},
    )
    assert login.status_code == 403
    assert refresh.status_code == 403


def test_smtp_missing_configuration_fails_safely(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.services.email import send_verification_email

    monkeypatch.delenv("SMTP_HOST", raising=False)
    monkeypatch.delenv("SMTP_FROM_ADDRESS", raising=False)

    with pytest.raises(EmailDeliveryError, match="not configured"):
        send_verification_email("farmer@example.com", "https://example.test/verify-email?token=redacted")


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