import hashlib
import hmac
import logging
import time
from datetime import datetime, timedelta, timezone

import httpx
from jose import JWTError, jwt

from app.core.config import settings

logger = logging.getLogger(__name__)

DEV_OTP = "888888"


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def generate_otp(phone: str) -> str:
    """Generate a time-based 6-digit OTP for a phone number."""
    time_step = int(time.time()) // 300  # 5-minute window
    msg = f"{phone}:{time_step}".encode()
    h = hmac.new(settings.OTP_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    return str(int(h[:8], 16) % 1000000).zfill(6)


def verify_otp(phone: str, otp: str) -> bool:
    """Verify OTP against current and previous time window."""
    if settings.DEV_MODE:
        return otp == DEV_OTP

    current = generate_otp(phone)
    # Also check previous window for edge cases
    time_step = int(time.time()) // 300 - 1
    msg = f"{phone}:{time_step}".encode()
    h = hmac.new(settings.OTP_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    previous = str(int(h[:8], 16) % 1000000).zfill(6)
    return otp == current or otp == previous


async def send_otp_sms(phone: str) -> str:
    """Send OTP via MSG91 in production, return fixed OTP in dev mode."""
    if settings.DEV_MODE:
        logger.info(f"DEV MODE: OTP for {phone} is {DEV_OTP}")
        return DEV_OTP

    otp = generate_otp(phone)

    if not settings.MSG91_AUTH_KEY or not settings.MSG91_TEMPLATE_ID:
        logger.warning("MSG91 not configured, falling back to dev OTP")
        return otp

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://control.msg91.com/api/v5/otp",
                headers={"authkey": settings.MSG91_AUTH_KEY},
                json={
                    "template_id": settings.MSG91_TEMPLATE_ID,
                    "mobile": f"91{phone}" if not phone.startswith("91") else phone,
                    "otp": otp,
                },
            )
            resp.raise_for_status()
            logger.info(f"OTP sent to {phone} via MSG91")
    except Exception as e:
        logger.error(f"MSG91 send failed for {phone}: {e}")
        raise

    return otp
