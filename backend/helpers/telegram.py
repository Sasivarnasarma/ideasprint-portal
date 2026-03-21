import logging
import os
import re

import httpx

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def _escape_md(text: str) -> str:
    return re.sub(r"([_*\[\]()~`>#+\-=|{}.!\\])", r"\\\1", str(text))


async def send_telegram_notification(text: str):
    if (
        not TELEGRAM_BOT_TOKEN
        or not TELEGRAM_CHAT_ID
        or TELEGRAM_BOT_TOKEN == "your_bot_token_here"
    ):
        logger.warning("Telegram configuration is missing. Skipping notification.")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info("Successfully sent Telegram notification.")
            return True
    except httpx.HTTPError as e:
        logger.error(f"Failed to send Telegram notification: {e}")
        return False


async def send_telegram_document(file_path: str, caption: str):
    if (
        not TELEGRAM_BOT_TOKEN
        or not TELEGRAM_CHAT_ID
        or TELEGRAM_BOT_TOKEN == "your_bot_token_here"
    ):
        logger.warning("Telegram configuration is missing. Skipping document upload.")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
    data = {"chat_id": TELEGRAM_CHAT_ID, "caption": caption, "parse_mode": "Markdown"}

    try:
        with open(file_path, "rb") as f:
            files = {"document": (os.path.basename(file_path), f, "application/pdf")}
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, data=data, files=files)
                response.raise_for_status()
                logger.info("Successfully sent Telegram document.")
                return True
    except Exception as e:
        logger.error(f"Failed to upload Telegram document: {repr(e)}")
        return False


def format_registration_message(user_data, new_team, members):
    message = f"🚀 *New Team Registration!* 🚀\n\n"
    message += f"🏆 *Team Name:* `{_escape_md(new_team.name)}`\n"
    message += f"📊 *Level:* `{_escape_md(new_team.level)}`\n"
    if new_team.level == "Level 1" and new_team.idea:
        message += f"💡 *Idea:* `{_escape_md(new_team.idea)}`\n\n"
    message += f"📧 *Email:* `{_escape_md(user_data.email)}`\n\n"
    message += f"👤 *Leader:* `{_escape_md(user_data.name)}`\n"
    message += f"📞 *Phone:* `{_escape_md(user_data.phone)}`\n"
    message += f"🆔 *IM Number:* `{_escape_md(user_data.im_number)}`\n\n"
    if members and len(members) > 0:
        message += f"👥 *Team Members ({len(members)}):*\n\n"
        for i, member in enumerate(members, 1):
            message += f"👤 *Member {i}*\n"
            message += f"   *Name:* `{_escape_md(member.name)}`\n"
            message += f"   *IM Number:* `{_escape_md(member.im_number)}`\n"
            message += f"   *Phone:* `{_escape_md(member.phone)}`\n\n"
    else:
        message += f"👥 *Team Members:* `None`\n"
    message += f"🎉 *Welcome them to the Hackathon!*"
    return message


def format_submission_message(team_no, team_name, youtube_url, drive_url, user_name):
    message = f"🚀 *New Proposal Submitted!* 🚀\n\n"
    message += f"🏆 *Team ID:* `{_escape_md(team_no)}`\n"
    message += f"🏆 *Team Name:* `{_escape_md(team_name)}`\n"
    message += f"📧 *Submitted By:* `{_escape_md(user_name)}`\n\n"
    message += f"🔗 *YouTube Link:* {youtube_url}\n"
    message += f"🔗 *Drive Link:* {drive_url}\n"
    message += f"🎉 *Proposal submitted successfully!*"
    return message
