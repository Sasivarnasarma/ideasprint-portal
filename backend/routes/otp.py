import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.connection import get_db
from helpers.email import generate_otp, send_otp_email
from helpers.otp_store import (check_otp, clear_otp, get_last_otp_info,
                               store_otp)
from helpers.security import (create_captcha_session_token,
                              create_verification_token,
                              decode_captcha_session_token)
from helpers.turnstile import verify_turnstile
from models.team import Team
from models.user import User
from schemas.otp import ResendOTPRequest, SendOTPRequest, VerifyOTPRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/otp", tags=["otp"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/send")
@limiter.limit("5/minute")
async def send_otp(
    body: SendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    logger.info(f"OTP send request for {body.email} (purpose: {body.purpose})")
    client_ip = request.client.host if request.client else None
    turnstile_ok = await verify_turnstile(body.turnstile_token, client_ip)
    if not turnstile_ok:
        raise HTTPException(
            status_code=400, detail="CAPTCHA verification failed. Please try again."
        )

    if body.purpose not in ["registration", "submission"]:
        raise HTTPException(status_code=400, detail="Invalid OTP purpose.")

    result = await db.execute(select(User).where(User.email == body.email))
    existing_user = result.scalars().first()

    if body.purpose == "registration":
        if existing_user:
            raise HTTPException(status_code=400, detail="User already registered.")
    elif body.purpose == "submission":
        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="Email is not registered. Please use the email you registered with.",
            )

    last_info = get_last_otp_info(body.email)
    if last_info:
        existing_otp, created_at = last_info
        time_elapsed = (datetime.now(timezone.utc) - created_at).total_seconds()
        if time_elapsed < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait 1 minute before requesting a new OTP.",
            )
        otp = existing_otp
        store_otp(body.email, otp)
    else:
        otp = generate_otp()
        store_otp(body.email, otp)

    success = await send_otp_email(body.email, otp, purpose=body.purpose)
    if not success:
        clear_otp(body.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later.",
        )

    captcha_token = create_captcha_session_token(body.email)
    return {
        "message": "OTP sent to email.",
        "email": body.email,
        "captcha_session_token": captcha_token,
    }


@router.post("/resend")
@limiter.limit("5/minute")
async def resend_otp(
    body: ResendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    session_email = decode_captcha_session_token(body.captcha_session_token)
    if not session_email or session_email != body.email:
        raise HTTPException(
            status_code=401, detail="Invalid session. Please restart your flow."
        )

    if body.purpose not in ["registration", "submission"]:
        raise HTTPException(status_code=400, detail="Invalid OTP purpose.")

    if body.purpose == "submission":
        result = await db.execute(select(User).where(User.email == body.email))
        existing_user = result.scalars().first()
        if not existing_user:
            raise HTTPException(status_code=404, detail="Email is not registered.")

    last_info = get_last_otp_info(body.email)
    if last_info:
        existing_otp, created_at = last_info
        time_elapsed = (datetime.now(timezone.utc) - created_at).total_seconds()
        if time_elapsed < 60:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait 1 minute before requesting a new OTP.",
            )
        otp = existing_otp
        store_otp(body.email, otp)
    else:
        otp = generate_otp()
        store_otp(body.email, otp)

    success = await send_otp_email(body.email, otp, purpose=body.purpose)
    if not success:
        clear_otp(body.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later.",
        )

    return {"message": "OTP resent to email.", "email": body.email}


@router.post("/verify")
@limiter.limit("10/minute")
async def verify_otp(
    body: VerifyOTPRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    session_email = decode_captcha_session_token(body.captcha_session_token)
    if not session_email or session_email != body.email:
        raise HTTPException(status_code=401, detail="Invalid session. Please restart.")

    if body.purpose not in ["registration", "submission"]:
        raise HTTPException(status_code=400, detail="Invalid OTP purpose.")

    otp_status = check_otp(body.email, body.otp)
    if otp_status == "expired":
        raise HTTPException(
            status_code=400, detail="OTP has expired. Please request a new OTP."
        )
    elif otp_status == "locked":
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Please request a new OTP.",
        )
    elif otp_status == "invalid":
        raise HTTPException(
            status_code=400, detail="Invalid OTP. Please check and try again."
        )

    clear_otp(body.email)
    token = create_verification_token(body.email)

    response_data = {
        "message": "OTP verified successfully.",
        "verification_token": token,
    }

    if body.purpose == "submission":
        result = await db.execute(select(User).where(User.email == body.email))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="Email is not registered.")

        result_team = await db.execute(select(Team).where(Team.leader_id == user.id))
        team = result_team.scalars().first()

        if team:
            response_data["team_name"] = team.name
            response_data["team_no"] = str(team.id)
            response_data["has_submitted"] = bool(team.youtube_link or team.pdf_link)
        else:
            raise HTTPException(
                status_code=404,
                detail="Only team leaders can submit proposals. No associated team found.",
            )

    return response_data
