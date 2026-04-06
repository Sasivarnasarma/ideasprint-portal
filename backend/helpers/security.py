import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

VERIFICATION_TOKEN_EXPIRE_MINUTES = 30
CAPTCHA_SESSION_EXPIRE_MINUTES = 30


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def create_verification_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": email,
        "purpose": "email_verification",
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_verification_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "email_verification":
            return None
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.PyJWTError:
        return None


def create_captcha_session_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=CAPTCHA_SESSION_EXPIRE_MINUTES
    )
    payload = {
        "sub": email,
        "purpose": "captcha_session",
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_captcha_session_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "captcha_session":
            return None
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.PyJWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_admin_access_token(username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=12)
    payload = {
        "sub": username,
        "purpose": "admin_access",
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_admin_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "admin_access":
            return None
        return {"username": payload.get("sub"), "role": payload.get("role")}
    except jwt.ExpiredSignatureError:
        return None
    except jwt.PyJWTError:
        return None
