import base64
import json
import logging
import os

from fastapi.concurrency import run_in_threadpool
from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

GOOGLE_SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
GOOGLE_SERVICE_ACCOUNT_B64 = os.getenv("GOOGLE_SERVICE_ACCOUNT_B64")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def get_google_sheets_service():
    if (
        not GOOGLE_SHEET_ID
        or not GOOGLE_SERVICE_ACCOUNT_B64
        or GOOGLE_SHEET_ID == "your_spreadsheet_id_here"
    ):
        logger.warning("Google Sheets configuration is missing. Skipping notification.")
        return None

    try:
        decoded_bytes = base64.b64decode(GOOGLE_SERVICE_ACCOUNT_B64)
        credentials_dict = json.loads(decoded_bytes.decode("utf-8"))
        credentials = service_account.Credentials.from_service_account_info(
            credentials_dict, scopes=SCOPES
        )
        service = build("sheets", "v4", credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to initialize Google Sheets service: {e}")
        return None


async def append_to_google_sheet(row_data: list):
    service = get_google_sheets_service()
    if not service:
        return False

    try:
        sheet = service.spreadsheets()
        range_name = "Don't Edit"
        body = {"values": [row_data]}
        request = sheet.values().append(
            spreadsheetId=GOOGLE_SHEET_ID,
            range=range_name,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=body,
        )
        result = await run_in_threadpool(request.execute)
        logger.info(
            f"Successfully appended row to Google Sheet. {result.get('updates').get('updatedCells')} cells updated."
        )
        return True
    except Exception as e:
        logger.error(f"Failed to append to Google Sheet: {e}")
        return False


def format_registration_row(user_data, new_team, members):
    row = [
        new_team.id,
        new_team.name,
        user_data.email,
        new_team.level,
        new_team.idea if new_team.idea else "N/A",
        user_data.name,
        user_data.phone,
        user_data.im_number,
    ]
    
    member_limit = 4

    for i in range(member_limit):
        if members and i < len(members):
            member = members[i]
            row.extend([member.name, member.phone, member.im_number])
        else:
            row.extend(["", "", ""])

    return row
