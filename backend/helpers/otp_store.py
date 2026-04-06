import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5

_otp_store: Dict[str, tuple[str, datetime, int]] = {}


def store_otp(email: str, otp: str):
    logger.info(f"Storing new OTP for {email}")
    _otp_store[email] = (otp, datetime.now(timezone.utc), 0)



def check_otp(email: str, otp: str) -> str:
    if email not in _otp_store:
        return "expired"
    stored_otp, created_at, attempts = _otp_store[email]
    if datetime.now(timezone.utc) > created_at + timedelta(minutes=OTP_EXPIRY_MINUTES):
        del _otp_store[email]
        return "expired"
    if attempts >= MAX_OTP_ATTEMPTS:
        del _otp_store[email]
        return "locked"
    if stored_otp != otp:
        _otp_store[email] = (stored_otp, created_at, attempts + 1)
        remaining = MAX_OTP_ATTEMPTS - (attempts + 1)
        if remaining <= 0:
            return "locked"
        return "invalid"
    return "valid"


def clear_otp(email: str):
    if email in _otp_store:
        logger.info(f"Clearing OTP for {email}")
        del _otp_store[email]


def get_last_otp_info(email: str) -> Optional[tuple[str, datetime]]:
    if email not in _otp_store:
        return None
    stored_otp, created_at, _ = _otp_store[email]
    if datetime.now(timezone.utc) > created_at + timedelta(minutes=OTP_EXPIRY_MINUTES):
        del _otp_store[email]
        return None
    return (stored_otp, created_at)


async def cleanup_expired_otps():
    while True:
        await asyncio.sleep(60)
        now = datetime.now(timezone.utc)
        expired = [
            email
            for email, (_, created_at, __) in _otp_store.items()
            if now > created_at + timedelta(minutes=OTP_EXPIRY_MINUTES)
        ]
        if expired:
            logger.info(f"Cleaning up {len(expired)} expired OTPs")
            for email in expired:
                del _otp_store[email]
