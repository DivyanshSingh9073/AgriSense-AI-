from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt
from fastapi import HTTPException, status
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from app.core.config import get_settings

password_hasher = PasswordHash.recommended()
JWT_ALGORITHM = "HS256"
DUMMY_PASSWORD_HASH = password_hasher.hash("not-a-real-user-password")


@dataclass(frozen=True)
class IssuedTokens:
    access_token: str
    refresh_token: str
    refresh_token_id: str
    refresh_expires_at: datetime


def _jwt_secret() -> str:
    secret = get_settings().jwt_secret_key
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured.",
        )
    return secret


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password, password_hash)
    except UnknownHashError:
        return False


def create_token_pair(subject: str) -> IssuedTokens:
    settings = get_settings()
    secret = _jwt_secret()
    now = datetime.now(timezone.utc)

    access_id = uuid4()
    refresh_id = uuid4()
    refresh_expires_at = now + timedelta(days=settings.refresh_token_expire_days)

    def encode(token_type: str, expires_at: datetime, token_id: UUID) -> str:
        claims = {
            "sub": subject,
            "type": token_type,
            "iat": now,
            "exp": expires_at,
            "jti": str(token_id),
        }
        return jwt.encode(claims, secret, algorithm=JWT_ALGORITHM)

    return IssuedTokens(
        access_token=encode(
            "access",
            now + timedelta(minutes=settings.access_token_expire_minutes),
            access_id,
        ),
        refresh_token=encode(
            "refresh",
            refresh_expires_at,
            refresh_id,
        ),
        refresh_token_id=str(refresh_id),
        refresh_expires_at=refresh_expires_at,
    )


def decode_token(token: str, expected_type: str = "access") -> dict[str, object]:
    try:
        claims = jwt.decode(
            token,
            _jwt_secret(),
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "iat", "sub", "type", "jti"]},
        )
    except HTTPException:
        raise
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    if claims.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return claims