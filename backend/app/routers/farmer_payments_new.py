import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.farmer_payment_record import FarmerPaymentRecord
from app.models.user import User
from app.schemas.farmer_payment_record import (
    FarmerPaymentRecordCreate,
    FarmerPaymentRecordUpdate,
    FarmerPaymentRecordResponse,
)

router = APIRouter(prefix="/farmer-payments", tags=["farmer-payments"])


@router.get("/", response_model=list[FarmerPaymentRecordResponse])
async def list_farmer_payments(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by narration or bank name"),
    company_id: uuid.UUID | None = Query(None),
    farmer_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(FarmerPaymentRecord).where(FarmerPaymentRecord.user_id == user.id)
    if search:
        q = q.where(
            FarmerPaymentRecord.narration.ilike(f"%{search}%")
            | FarmerPaymentRecord.bank_name.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(FarmerPaymentRecord.company_id == company_id)
    if farmer_id:
        q = q.where(FarmerPaymentRecord.farmer_id == farmer_id)
    q = q.order_by(FarmerPaymentRecord.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=FarmerPaymentRecordResponse)
async def get_farmer_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerPaymentRecord).where(
            FarmerPaymentRecord.id == item_id, FarmerPaymentRecord.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=FarmerPaymentRecordResponse, status_code=201)
async def create_farmer_payment(
    data: FarmerPaymentRecordCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = FarmerPaymentRecord(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=FarmerPaymentRecordResponse)
async def update_farmer_payment(
    item_id: uuid.UUID,
    data: FarmerPaymentRecordUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerPaymentRecord).where(
            FarmerPaymentRecord.id == item_id, FarmerPaymentRecord.user_id == user.id
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
async def delete_farmer_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(FarmerPaymentRecord).where(
            FarmerPaymentRecord.id == item_id, FarmerPaymentRecord.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
