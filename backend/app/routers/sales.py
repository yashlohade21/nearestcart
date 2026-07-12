import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.sale_entry import SaleEntry
from app.models.user import User
from app.schemas.sale_entry import SaleEntryCreate, SaleEntryUpdate, SaleEntryResponse

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/", response_model=list[SaleEntryResponse])
async def list_sales(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by invoice number or LR number"),
    company_id: uuid.UUID | None = Query(None),
    buyer_id: uuid.UUID | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(SaleEntry).where(SaleEntry.user_id == user.id)
    if search:
        q = q.where(
            SaleEntry.invoice_no.ilike(f"%{search}%")
            | SaleEntry.lr_no.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(SaleEntry.company_id == company_id)
    if buyer_id:
        q = q.where(SaleEntry.buyer_id == buyer_id)
    if product_id:
        q = q.where(SaleEntry.product_id == product_id)
    q = q.order_by(SaleEntry.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=SaleEntryResponse)
async def get_sale(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SaleEntry).where(SaleEntry.id == item_id, SaleEntry.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=SaleEntryResponse, status_code=201)
async def create_sale(
    data: SaleEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = SaleEntry(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=SaleEntryResponse)
async def update_sale(
    item_id: uuid.UUID,
    data: SaleEntryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SaleEntry).where(SaleEntry.id == item_id, SaleEntry.user_id == user.id)
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
async def delete_sale(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SaleEntry).where(SaleEntry.id == item_id, SaleEntry.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
