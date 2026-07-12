import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.delivery_place import DeliveryPlace
from app.models.user import User

router = APIRouter(prefix="/delivery-places", tags=["delivery-places"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for delivery_place)
# ---------------------------------------------------------------------------

class DeliveryPlaceCreate(BaseModel):
    company_id: uuid.UUID | None = None
    place_name: str
    district: str | None = None
    state: str | None = None


class DeliveryPlaceUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    place_name: str | None = None
    district: str | None = None
    state: str | None = None


class DeliveryPlaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    place_name: str
    district: str | None
    state: str | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[DeliveryPlaceResponse])
async def list_delivery_places(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by place name, district, or state"),
    company_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(DeliveryPlace).where(DeliveryPlace.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            DeliveryPlace.place_name.ilike(f"%{search}%"),
            DeliveryPlace.district.ilike(f"%{search}%"),
            DeliveryPlace.state.ilike(f"%{search}%"),
        ))
    if company_id:
        q = q.where(DeliveryPlace.company_id == company_id)
    q = q.order_by(DeliveryPlace.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=DeliveryPlaceResponse)
async def get_delivery_place(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeliveryPlace).where(
            DeliveryPlace.id == item_id, DeliveryPlace.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=DeliveryPlaceResponse, status_code=201)
async def create_delivery_place(
    data: DeliveryPlaceCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = DeliveryPlace(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=DeliveryPlaceResponse)
async def update_delivery_place(
    item_id: uuid.UUID,
    data: DeliveryPlaceUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeliveryPlace).where(
            DeliveryPlace.id == item_id, DeliveryPlace.user_id == user.id
        )
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
async def delete_delivery_place(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeliveryPlace).where(
            DeliveryPlace.id == item_id, DeliveryPlace.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
