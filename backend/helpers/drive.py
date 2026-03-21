import base64
import json
import logging
import os

from fastapi.concurrency import run_in_threadpool
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

logger = logging.getLogger(__name__)

GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
GOOGLE_OAUTH_TOKEN_B64 = os.getenv("GOOGLE_OAUTH_TOKEN_B64")


SCOPES = ["https://www.googleapis.com/auth/drive"]


def get_google_drive_service():
    if (
        not GOOGLE_DRIVE_FOLDER_ID
        or not GOOGLE_OAUTH_TOKEN_B64
        or GOOGLE_DRIVE_FOLDER_ID == "your_google_drive_folder_id"
    ):
        logger.warning("Google Drive configuration is missing. Skipping upload.")
        return None

    try:
        decoded_bytes = base64.b64decode(GOOGLE_OAUTH_TOKEN_B64)
        credentials_dict = json.loads(decoded_bytes.decode("utf-8"))
        credentials = Credentials.from_authorized_user_info(
            credentials_dict, scopes=SCOPES
        )
        service = build("drive", "v3", credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to initialize Google Drive service: {e}")
        return None


async def upload_file_to_google_drive(
    file_path: str, filename: str, mime_type: str = "application/pdf"
):
    service = get_google_drive_service()
    if not service:
        return None

    try:
        file_metadata = {"name": filename, "parents": [GOOGLE_DRIVE_FOLDER_ID]}
        media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
        request = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink",
            supportsAllDrives=True,
        )
        file = await run_in_threadpool(request.execute)
        logger.info(
            f"Successfully streamed {filename} to Google Drive. File ID: {file.get('id')}"
        )
        return file.get("id")
    except Exception as e:
        logger.error(f"Failed to stream upload to Google Drive: {e}")
        return None


async def delete_file_from_google_drive(file_id: str):
    service = get_google_drive_service()
    if not service:
        return False

    try:
        request = service.files().delete(fileId=file_id, supportsAllDrives=True)
        await run_in_threadpool(request.execute)
        logger.info(f"Successfully deleted old Google Drive file: {file_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete old file from Google Drive: {e}")
        return False
