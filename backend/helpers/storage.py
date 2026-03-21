import logging
import os

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")


def get_s3_client():
    if not CLOUDFLARE_ACCOUNT_ID or not R2_ACCESS_KEY_ID or not R2_SECRET_ACCESS_KEY:
        logger.warning("Cloudflare R2 configuration is missing.")
        return None

    endpoint_url = f"https://{CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def generate_presigned_url(object_name: str, expiration: int = 3600):
    s3_client = get_s3_client()
    if not s3_client:
        return None

    try:
        response = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": R2_BUCKET_NAME, "Key": object_name},
            ExpiresIn=expiration,
        )
        return response
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None


def download_r2_to_tempfile(object_name: str, file_path: str):
    s3_client = get_s3_client()
    if not s3_client:
        return False
    try:
        with open(file_path, "wb") as f:
            s3_client.download_fileobj(R2_BUCKET_NAME, object_name, f)
        return True
    except ClientError as e:
        logger.error(f"Error downloading file to disk {object_name}: {e}")
        return False
