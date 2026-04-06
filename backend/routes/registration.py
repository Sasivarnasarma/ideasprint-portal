import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.connection import get_db
from helpers.email import send_welcome_email
from helpers.security import decode_verification_token
from helpers.sheets import append_to_google_sheet, format_registration_row
from helpers.telegram import (format_registration_message,
                              send_telegram_notification)
from models.team import Team, TeamMember
from models.user import User
from schemas.registration import UserFullRegistration

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/registration", tags=["registration"])
limiter = Limiter(key_func=get_remote_address)


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
