import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.kharidar import Kharidar
from app.models.user import User

router = APIRouter(prefix="/kharidars", tags=["kharidars"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for kharidar)
# ---------------------------------------------------------------------------

class KharidarCreate(BaseModel):
    company_id: uuid.UUID | None = None
    name: str
    phone: str | None = None
    address: str | None = None
    is_active: bool = True


class KharidarUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    is_active: bool | None = None


class KharidarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    name: str
    phone: str | None
    address: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[KharidarResponse])
async def list_kharidars(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by name or phone"),
    company_id: uuid.UUID | None = Query(None),
    is_active: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(Kharidar).where(Kharidar.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            Kharidar.name.ilike(f"%{search}%"),
            Kharidar.phone.ilike(f"%{search}%"),
        ))
    if company_id:
        q = q.where(Kharidar.company_id == company_id)
    if is_active is not None:
        q = q.where(Kharidar.is_active == is_active)
    q = q.order_by(Kharidar.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=KharidarResponse)
async def get_kharidar(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Kharidar).where(Kharidar.id == item_id, Kharidar.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=KharidarResponse, status_code=201)
async def create_kharidar(
    data: KharidarCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = Kharidar(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=KharidarResponse)
async def update_kharidar(
    item_id: uuid.UUID,
    data: KharidarUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Kharidar).where(Kharidar.id == item_id, Kharidar.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_kharidar(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Kharidar).where(Kharidar.id == item_id, Kharidar.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
