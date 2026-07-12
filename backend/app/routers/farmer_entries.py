import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.farmer_entry import FarmerEntry
from app.models.user import User
from app.schemas.farmer_entry import (
    FarmerEntryCreate,
    FarmerEntryUpdate,
    FarmerEntryResponse,
)

router = APIRouter(prefix="/farmer-entries", tags=["farmer-entries"])


@router.get("/", response_model=list[FarmerEntryResponse])
async def list_farmer_entries(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by invoice number or village"),
    company_id: uuid.UUID | None = Query(None),
    farmer_id: uuid.UUID | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(FarmerEntry).where(FarmerEntry.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            FarmerEntry.invoice_no.ilike(f"%{search}%"),
            FarmerEntry.village.ilike(f"%{search}%"),
        ))
    if company_id:
        q = q.where(FarmerEntry.company_id == company_id)
    if farmer_id:
        q = q.where(FarmerEntry.farmer_id == farmer_id)
    if product_id:
        q = q.where(FarmerEntry.product_id == product_id)
    q = q.order_by(FarmerEntry.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=FarmerEntryResponse)
async def get_farmer_entry(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerEntry).where(
            FarmerEntry.id == item_id, FarmerEntry.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=FarmerEntryResponse, status_code=201)
async def create_farmer_entry(
    data: FarmerEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = FarmerEntry(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=FarmerEntryResponse)
async def update_farmer_entry(
    item_id: uuid.UUID,
    data: FarmerEntryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerEntry).where(
            FarmerEntry.id == item_id, FarmerEntry.user_id == user.id
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
async def delete_farmer_entry(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerEntry).where(
            FarmerEntry.id == item_id, FarmerEntry.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
