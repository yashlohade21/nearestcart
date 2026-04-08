import logging
import os
import uuid

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

_s3_client = None


def _get_s3_client():
    global _s3_client
    if _s3_client is None and settings.AWS_ACCESS_KEY_ID:
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
    return _s3_client


def use_s3() -> bool:
    """Check if S3 is configured."""
    return bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)


def upload_file(
    content: bytes,
    entity_type: str,
    entity_id: str,
    original_filename: str | None,
    content_type: str = "image/jpeg",
) -> tuple[str, str]:
    """
    Upload file to S3 or local disk.
    Returns (file_path, file_url).
    """
    ext = "jpg"
    if original_filename and "." in original_filename:
        ext = original_filename.rsplit(".", 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex[:12]}.{ext}"
    key = f"files/{entity_type}/{entity_id}/{unique_name}"

    if use_s3():
        return _upload_s3(content, key, content_type)
    return _upload_local(content, key)


def _upload_s3(content: bytes, key: str, content_type: str) -> tuple[str, str]:
    client = _get_s3_client()
    try:
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
    except ClientError as e:
        logger.error(f"S3 upload failed: {e}")
        raise

    url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    return key, url


def _upload_local(content: bytes, key: str) -> tuple[str, str]:
    local_path = os.path.join("uploads", key)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, "wb") as f:
        f.write(content)
    return local_path, f"/{local_path}"


def delete_file(file_path: str) -> None:
    """Delete file from S3 or local disk."""
    if use_s3() and not file_path.startswith("/") and not file_path.startswith("uploads"):
        # It's an S3 key
        client = _get_s3_client()
        try:
            client.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=file_path)
        except ClientError as e:
            logger.error(f"S3 delete failed: {e}")
    else:
        # Local file
        local_path = file_path.lstrip("/")
        if os.path.exists(local_path):
            os.remove(local_path)


def get_presigned_url(file_path: str, expires_in: int = 3600) -> str | None:
    """Generate a presigned URL for S3 files. Returns None for local files."""
    if not use_s3() or file_path.startswith("/") or file_path.startswith("uploads"):
        return None
    client = _get_s3_client()
    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET, "Key": file_path},
            ExpiresIn=expires_in,
        )
    except ClientError:
        return None
