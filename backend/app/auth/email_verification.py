import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import EmailVerificationChallenge, User
from app.services.email import EmailDeliveryError, build_verification_url, send_verification_email


@dataclass(frozen=True)
class VerificationDispatchResult:
    email_sent: bool
    retry_after_seconds: int | None = None


def _email_hash(email: str) -> str:
    normalized = email.strip().lower().encode("utf-8")
    return hashlib.sha256(normalized).hexdigest()


def _code_hash(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def dispatch_verification(session: Session, email: str, user: User | None) -> VerificationDispatchResult:
    settings = get_settings()
    email_hash = _email_hash(email)
    now = datetime.now(timezone.utc)
    challenge = session.scalar(
        select(EmailVerificationChallenge)
        .where(EmailVerificationChallenge.email_hash == email_hash)
        .with_for_update()
    )

    if challenge is None:
        challenge = EmailVerificationChallenge(
            email_hash=email_hash,
            user_id=user.id if user else None,
            code_hash="0" * 64,
            expires_at=now,
            last_sent_at=now,
            resend_window_started_at=now,
            resend_count=0,
            attempt_count=0,
        )
        session.add(challenge)
        session.flush()
    elif user is not None:
        challenge.user_id = user.id

    window_start = _as_utc(challenge.resend_window_started_at)
    last_sent = _as_utc(challenge.last_sent_at)
    if window_start + timedelta(hours=1) <= now:
        challenge.resend_window_started_at = now
        challenge.resend_count = 0

    cooldown_remaining = int(
        (last_sent + timedelta(seconds=settings.email_verification_resend_cooldown_seconds) - now).total_seconds()
    )
    if challenge.resend_count > 0 and cooldown_remaining > 0:
        return VerificationDispatchResult(False, cooldown_remaining)

    if challenge.resend_count >= settings.email_verification_max_resends_per_hour:
        retry_after = int((window_start + timedelta(hours=1) - now).total_seconds())
        return VerificationDispatchResult(False, max(1, retry_after))

    token_secret = secrets.token_urlsafe(32)
    token = f"{challenge.id}.{token_secret}"
    challenge.code_hash = _code_hash(token_secret)
    challenge.expires_at = now + timedelta(minutes=settings.email_verification_expire_minutes)
    challenge.last_sent_at = now
    challenge.resend_count += 1
    challenge.attempt_count = 0
    challenge.used_at = None
    session.flush()

    verification_url = build_verification_url(email, token)
    send_verification_email(email, verification_url)
    return VerificationDispatchResult(True)


def consume_verification_token(session: Session, token: str) -> User:
    try:
        challenge_id_text, token_secret = token.split(".", maxsplit=1)
        challenge_id = UUID(challenge_id_text)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        ) from None

    challenge = session.scalar(
        select(EmailVerificationChallenge)
        .where(EmailVerificationChallenge.id == challenge_id)
        .with_for_update()
    )
    now = datetime.now(timezone.utc)
    if (
        challenge is None
        or challenge.used_at is not None
        or _as_utc(challenge.expires_at) <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        )

    settings = get_settings()
    if challenge.attempt_count >= settings.email_verification_max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts. Request a new link later.",
        )

    if not hmac.compare_digest(challenge.code_hash, _code_hash(token_secret)):
        challenge.attempt_count += 1
        session.commit()
        if challenge.attempt_count >= settings.email_verification_max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many verification attempts. Request a new link later.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        )

    user = session.get(User, challenge.user_id) if challenge.user_id else None
    if user is None:
        challenge.used_at = now
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        )

    challenge.used_at = now
    user.is_email_verified = True
    session.commit()
    return user