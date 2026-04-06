import logging
import os
import re

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.connection import AsyncSessionLocal, get_db
from helpers.drive import upload_file_to_google_drive
from helpers.email import send_submission_success_email
from helpers.security import decode_verification_token
from helpers.sheets import update_team_submission_links
from helpers.storage import download_r2_to_tempfile, generate_presigned_url
from helpers.telegram import (
    format_submission_message,
    send_telegram_document,
    send_telegram_notification,
)
from models.team import Team
from models.user import User
from schemas.submission import PresignedUrlRequest, ProposalSubmission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/submission", tags=["submission"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/presigned-url")
@limiter.limit("10/minute")
async def get_presigned_url(
    body: PresignedUrlRequest,
    request: Request,
):
    verified_email = decode_verification_token(body.verification_token)
    if not verified_email:
        raise HTTPException(
            status_code=401, detail="Invalid session. Please restart submission."
        )

    sanitized_team_name = body.team_name.replace(" ", "_").replace("/", "-")
    new_filename = f"{body.team_no}_{sanitized_team_name}.pdf"

    url = generate_presigned_url(new_filename)
    if not url:
        raise HTTPException(
            status_code=500, detail="Failed to generate upload URL. Try again."
        )

    return {"upload_url": url, "file_key": new_filename}


@router.post("/submit")
@limiter.limit("3/minute")
async def submit_proposal(
    body: ProposalSubmission,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    logger.info("Proposal submission request received.")
    verified_email = decode_verification_token(body.verification_token)
    if not verified_email:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired verification. Please verify your email again.",
        )

    result = await db.execute(select(User).where(User.email == verified_email))
    user = result.scalars().first()

    def extract_youtube_id(url: str) -> str:
        match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
        return match.group(1) if match else url

    result_team = await db.execute(select(Team).where(Team.id == int(body.team_no)))
    team = result_team.scalars().first()
    youtube_id = extract_youtube_id(body.youtube_url)

    if team:
        team.youtube_link = youtube_id
        await db.commit()

        if team.pdf_link:
            from helpers.drive import delete_file_from_google_drive

            background_tasks.add_task(delete_file_from_google_drive, team.pdf_link)

    background_tasks.add_task(
        process_background_submission,
        body.team_no,
        body.team_name,
        body.file_key,
        youtube_id,
        user.name,
        verified_email,
    )

    return {"message": "Proposal submitted successfully."}


async def process_background_submission(
    team_no: str,
    team_name: str,
    file_key: str,
    youtube_id: str,
    user_name: str,
    user_email: str,
):
    try:
        os.makedirs("Submissions", exist_ok=True)
        file_path = os.path.join("Submissions", file_key)

        download_success = await run_in_threadpool(
            download_r2_to_tempfile, file_key, file_path
        )

        drive_id = None
        if download_success:
            drive_id = await upload_file_to_google_drive(file_path, file_key)
        async with AsyncSessionLocal() as session:
            result_team = await session.execute(
                select(Team).where(Team.id == int(team_no))
            )
            team = result_team.scalars().first()
            if team:
                team.pdf_link = (
                    drive_id
                    if drive_id
                    else f"Error: Failed to process R2 Key: {file_key}"
                )
                await session.commit()

        if drive_id:
            drive_url = f"https://drive.google.com/file/d/{drive_id}/view"
            youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"

            await update_team_submission_links(team_no, youtube_url, drive_url)

            telegram_msg = format_submission_message(
                team_no, team_name, youtube_url, drive_url, user_name
            )
            doc_success = await send_telegram_document(file_path, telegram_msg)
            if not doc_success:
                await send_telegram_notification(telegram_msg)

            await send_submission_success_email(user_email, user_name, team_name)

    except Exception as e:
        logger.error(f"Background Submission processor failed for Team {team_no}: {e}")
