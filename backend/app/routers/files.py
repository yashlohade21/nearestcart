import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.storage import delete_file, upload_file
from app.models.file import FileRecord
from app.models.user import User
from app.schemas.file import FileResponse

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file_endpoint(
    file: UploadFile,
    entity_type: str = Query(..., description="deal, user, farmer, buyer, advance"),
    entity_id: str = Query(..., description="UUID of the entity"),
    file_type: str = Query("photo", description="photo, logo, receipt, weight_slip, invoice, document"),
    notes: str | None = Query(None),
    latitude: float | None = Query(None),
    longitude: float | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Accepted: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum 10 MB.",
        )

    parsed_entity_id = uuid_mod.UUID(entity_id)

    file_path, file_url = upload_file(
        content=content,
        entity_type=entity_type,
        entity_id=str(parsed_entity_id),
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
    )

    record = FileRecord(
        user_id=user.id,
        entity_type=entity_type,
        entity_id=parsed_entity_id,
        file_type=file_type,
        file_path=file_path,
        file_url=file_url,
        original_name=file.filename,
        mime_type=file.content_type,
        file_size=len(content),
        latitude=latitude,
        longitude=longitude,
        notes=notes,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("", response_model=list[FileResponse])
async def list_files(
    entity_type: str = Query(...),
    entity_id: str = Query(...),
    file_type: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    parsed_entity_id = uuid_mod.UUID(entity_id)
    query = (
        select(FileRecord)
        .where(
            FileRecord.user_id == user.id,
            FileRecord.entity_type == entity_type,
            FileRecord.entity_id == parsed_entity_id,
        )
        .order_by(FileRecord.created_at.desc())
    )
    if file_type:
        query = query.where(FileRecord.file_type == file_type)

    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file_endpoint(
    file_id: uuid_mod.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FileRecord).where(FileRecord.id == file_id, FileRecord.user_id == user.id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")

    delete_file(record.file_path)

    await db.delete(record)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
