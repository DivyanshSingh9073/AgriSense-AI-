import smtplib
import ssl
from email.message import EmailMessage
from urllib.parse import urlencode, urlsplit

from app.core.config import get_settings


class EmailDeliveryError(RuntimeError):
    """Raised when SMTP delivery is unavailable or fails."""


def build_verification_url(email: str, token: str) -> str:
    settings = get_settings()
    parsed = urlsplit(settings.frontend_base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise EmailDeliveryError("Email verification is not configured.")
    if settings.app_env == "production" and parsed.scheme != "https":
        raise EmailDeliveryError("Email verification is not configured securely.")
    query = urlencode({"email": email, "token": token})
    return f"{settings.frontend_base_url}/verify-email?{query}"


def send_verification_email(recipient: str, verification_url: str) -> None:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_from_address:
        raise EmailDeliveryError("Email delivery is not configured.")

    message = EmailMessage()
    message["Subject"] = "Verify your AgriSense AI email"
    message["From"] = settings.smtp_from_address
    message["To"] = recipient
    message.set_content(
        "If you requested an AgriSense AI account verification, open this link to continue:\n\n"
        f"{verification_url}\n\n"
        "This link expires soon. If you did not request it, you can ignore this message."
    )

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.ehlo()
            if settings.smtp_use_starttls:
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException, ssl.SSLError):
        raise EmailDeliveryError("Email delivery failed.") from None