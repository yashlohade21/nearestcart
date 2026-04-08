import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.transporter import Transporter
from app.models.user import User
from app.schemas.transporter import TransporterCreate, TransporterResponse, TransporterUpdate

router = APIRouter(prefix="/transporters", tags=["transporters"])


@router.get("", response_model=list[TransporterResponse])
async def list_transporters(
    search: str | None = Query(None),
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Transporter)
        .where(Transporter.user_id == user.id, Transporter.is_active.is_(True))
        .order_by(Transporter.name)
    )
    if search:
        query = query.where(Transporter.name.ilike(f"%{search}%"))
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=TransporterResponse, status_code=status.HTTP_201_CREATED)
async def create_transporter(
    body: TransporterCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    transporter = Transporter(user_id=user.id, **body.model_dump(exclude_none=True))
    db.add(transporter)
    await db.commit()
    await db.refresh(transporter)
    return transporter


@router.get("/{transporter_id}", response_model=TransporterResponse)
async def get_transporter(
    transporter_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transporter).where(Transporter.id == transporter_id, Transporter.user_id == user.id)
    )
    transporter = result.scalar_one_or_none()
    if not transporter:
        raise HTTPException(status_code=404, detail="Transporter not found")
    return transporter


@router.patch("/{transporter_id}", response_model=TransporterResponse)
async def update_transporter(
    transporter_id: uuid.UUID,
    body: TransporterUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transporter).where(Transporter.id == transporter_id, Transporter.user_id == user.id)
    )
    transporter = result.scalar_one_or_none()
    if not transporter:
        raise HTTPException(status_code=404, detail="Transporter not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(transporter, field, value)
    await db.commit()
    await db.refresh(transporter)
    return transporter


@router.delete("/{transporter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transporter(
    transporter_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transporter).where(Transporter.id == transporter_id, Transporter.user_id == user.id)
    )
    transporter = result.scalar_one_or_none()
    if not transporter:
        raise HTTPException(status_code=404, detail="Transporter not found")
    transporter.is_active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
