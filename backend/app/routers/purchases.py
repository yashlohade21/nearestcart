import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.purchase_entry import PurchaseEntry
from app.models.user import User
from app.schemas.purchase_entry import (
    PurchaseEntryCreate,
    PurchaseEntryUpdate,
    PurchaseEntryResponse,
)

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("/", response_model=list[PurchaseEntryResponse])
async def list_purchases(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by bill number or notes"),
    company_id: uuid.UUID | None = Query(None),
    supplier_id: uuid.UUID | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(PurchaseEntry).where(PurchaseEntry.user_id == user.id)
    if search:
        q = q.where(
            PurchaseEntry.bill_no.ilike(f"%{search}%")
            | PurchaseEntry.notes.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(PurchaseEntry.company_id == company_id)
    if supplier_id:
        q = q.where(PurchaseEntry.supplier_id == supplier_id)
    if product_id:
        q = q.where(PurchaseEntry.product_id == product_id)
    q = q.order_by(PurchaseEntry.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=PurchaseEntryResponse)
async def get_purchase(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchaseEntry).where(
            PurchaseEntry.id == item_id, PurchaseEntry.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=PurchaseEntryResponse, status_code=201)
async def create_purchase(
    data: PurchaseEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = PurchaseEntry(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=PurchaseEntryResponse)
async def update_purchase(
    item_id: uuid.UUID,
    data: PurchaseEntryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchaseEntry).where(
            PurchaseEntry.id == item_id, PurchaseEntry.user_id == user.id
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
async def delete_purchase(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchaseEntry).where(
            PurchaseEntry.id == item_id, PurchaseEntry.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
