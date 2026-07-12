import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.farmer_sale import FarmerSale
from app.models.user import User
from app.schemas.farmer_sale import (
    FarmerSaleCreate,
    FarmerSaleUpdate,
    FarmerSaleResponse,
)

router = APIRouter(prefix="/farmer-sales", tags=["farmer-sales"])


@router.get("/", response_model=list[FarmerSaleResponse])
async def list_farmer_sales(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    company_id: uuid.UUID | None = Query(None),
    farmer_entry_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(FarmerSale).where(FarmerSale.user_id == user.id)
    if company_id:
        q = q.where(FarmerSale.company_id == company_id)
    if farmer_entry_id:
        q = q.where(FarmerSale.farmer_entry_id == farmer_entry_id)
    q = q.order_by(FarmerSale.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=FarmerSaleResponse)
async def get_farmer_sale(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerSale).where(
            FarmerSale.id == item_id, FarmerSale.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=FarmerSaleResponse, status_code=201)
async def create_farmer_sale(
    data: FarmerSaleCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = FarmerSale(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=FarmerSaleResponse)
async def update_farmer_sale(
    item_id: uuid.UUID,
    data: FarmerSaleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerSale).where(
            FarmerSale.id == item_id, FarmerSale.user_id == user.id
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
async def delete_farmer_sale(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerSale).where(
            FarmerSale.id == item_id, FarmerSale.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
