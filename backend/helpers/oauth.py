import logging
import os

from helpers.drive import get_google_drive_service
from helpers.sheets import get_google_sheets_service

logger = logging.getLogger(__name__)


def verify_oauth_token_on_startup():
    logger.info("Verifying Google OAuth Token functionality...")

    drive_service = get_google_drive_service()
    if not drive_service:
        logger.error("Google Drive OAuth Token is missing or invalid.")
    else:
        try:
            about = drive_service.about().get(fields="user").execute()
            user_info = about.get("user", {})
            display_name = user_info.get("displayName", "Unknown User")
            email = user_info.get("emailAddress", "Unknown Email")
            logger.info(
                f"Google Drive API is authenticated as: {display_name} ({email})"
            )
        except Exception as e:
            logger.error(f"Failed to verify Google Drive OAuth token. Error: {e}")

    sheets_service = get_google_sheets_service()
    if not sheets_service:
        logger.error("Google Sheets OAuth Token is missing or invalid.")
    else:
        try:
            sheet_id = os.getenv("GOOGLE_SHEET_ID")
            if sheet_id and sheet_id != "your_spreadsheet_id_here":
                sheet = (
                    sheets_service.spreadsheets()
                    .get(spreadsheetId=sheet_id, fields="properties.title")
                    .execute()
                )
                title = sheet.get("properties", {}).get("title", "Unknown Sheet")
                logger.info(
                    f"Google Sheets API is authenticated and can access sheet: '{title}'"
                )
            else:
                logger.warning(
                    "Google Sheets API is authenticated, but no valid GOOGLE_SHEET_ID provided to test access to a specific sheet."
                )
        except Exception as e:
            logger.error(
                f"Failed to test Google Sheets access. Token may be missing scopes or GOOGLE_SHEET_ID is incorrect. Error: {e}"
            )
