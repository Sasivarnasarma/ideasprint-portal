import logging
from datetime import datetime, timezone
from fastapi import (APIRouter, BackgroundTasks, Depends, HTTPException,
                     Request, status)
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

from database.connection import get_db
from helpers.email import generate_otp, send_otp_email, send_welcome_email
from helpers.otp_store import (check_otp, clear_otp, get_last_otp_info,
                               store_otp)
from helpers.security import (create_captcha_session_token,
                              create_verification_token,
                              decode_captcha_session_token)
from helpers.sheets import append_to_google_sheet, format_registration_row
from helpers.telegram import (format_registration_message,
                              send_telegram_notification)
from helpers.turnstile import verify_turnstile
from models.team import Team, TeamMember
from models.user import User
from schemas.auth import (ResendOTPRequest, SendOTPRequest,
                          UserFullRegistration, UserVerifyOTP)

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/otp/send")
@limiter.limit("5/minute")
async def send_otp(
    body: SendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    logger.info(f"OTP send request for {body.email}")
    client_ip = request.client.host if request.client else None
    turnstile_ok = await verify_turnstile(body.turnstile_token, client_ip)
    if not turnstile_ok:
        raise HTTPException(
            status_code=400, detail="CAPTCHA verification failed. Please try again."
        )

    result = await db.execute(select(User).where(User.email == body.email))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered.")

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

    success = await send_otp_email(body.email, otp)
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


@router.post("/otp/resend")
@limiter.limit("5/minute")
async def resend_otp(
    body: ResendOTPRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    session_email = decode_captcha_session_token(body.captcha_session_token)
    if not session_email or session_email != body.email:
        raise HTTPException(
            status_code=401, detail="Invalid session. Please start registration again."
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

    success = await send_otp_email(body.email, otp)
    if not success:
        clear_otp(body.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again later.",
        )

    return {"message": "OTP resent to email.", "email": body.email}


@router.post("/otp/verify")
@limiter.limit("10/minute")
async def verify_otp(
    body: UserVerifyOTP, request: Request, db: AsyncSession = Depends(get_db)
):
    session_email = decode_captcha_session_token(body.captcha_session_token)
    if not session_email or session_email != body.email:
        raise HTTPException(
            status_code=401, detail="Invalid session. Please start registration again."
        )

    otp_status = check_otp(body.email, body.otp)
    if otp_status == "expired":
        raise HTTPException(
            status_code=400, detail="OTP has expired. Please request a new OTP."
        )
    if otp_status == "locked":
        raise HTTPException(
            status_code=429,
            detail="Too many failed attempts. Please request a new OTP.",
        )
    if otp_status == "invalid":
        raise HTTPException(
            status_code=400, detail="Invalid OTP. Please check and try again."
        )

    clear_otp(body.email)

    token = create_verification_token(body.email)
    return {"message": "OTP verified successfully.", "verification_token": token}


@router.post("/register")
@limiter.limit("3/minute")
async def register_complete(
    data: UserFullRegistration,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    logger.info("Registration complete request received.")
    verified_email = decode_verification_token(data.verification_token)
    if not verified_email:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired verification. Please verify your email again.",
        )

    result = await db.execute(select(User).where(User.email == verified_email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered.")

    team_result = await db.execute(select(Team).where(Team.name == data.team_name))
    if team_result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Team name already taken. Please choose a different team name.",
        )

    all_im_numbers = [data.im_number] + [m.im_number for m in data.members]

    existing_user_im = await db.execute(
        select(User.im_number).where(User.im_number.in_(all_im_numbers))
    )
    taken_user_im = existing_user_im.scalars().first()
    if taken_user_im:
        raise HTTPException(
            status_code=400,
            detail=f"IM number '{taken_user_im}' is already registered. Please verify the IM numbers.",
        )

    existing_member_im = await db.execute(
        select(TeamMember.im_number).where(TeamMember.im_number.in_(all_im_numbers))
    )
    taken_member_im = existing_member_im.scalars().first()
    if taken_member_im:
        raise HTTPException(
            status_code=400,
            detail=f"IM number '{taken_member_im}' is already registered. Please verify the IM numbers.",
        )

    user = User(
        name=data.name, email=verified_email, phone=data.phone, im_number=data.im_number
    )
    db.add(user)

    await db.flush()

    new_team = Team(
        name=data.team_name,
        leader_id=user.id,
        level=data.level,
        idea=data.idea,
    )
    db.add(new_team)
    await db.flush()

    for member in data.members:
        team_member = TeamMember(
            team_id=new_team.id,
            name=member.name,
            phone=member.phone,
            im_number=member.im_number,
        )
        db.add(team_member)

    await db.commit()
    logger.info(f"Successfully registered user {user.email} and team {new_team.name}")

    background_tasks.add_task(
        send_welcome_email,
        user.email,
        user.name,
        user.phone,
        user.im_number,
        new_team.name,
        data.members,
    )

    telegram_msg = format_registration_message(user, new_team, data.members)
    background_tasks.add_task(send_telegram_notification, telegram_msg)

    sheets_row = format_registration_row(user, new_team, data.members)
    background_tasks.add_task(append_to_google_sheet, sheets_row)

    return {"message": "Registration successful"}
