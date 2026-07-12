import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.purchase_payment import PurchasePayment
from app.models.user import User
from app.schemas.purchase_payment import (
    PurchasePaymentCreate,
    PurchasePaymentUpdate,
    PurchasePaymentResponse,
)

router = APIRouter(prefix="/purchase-payments", tags=["purchase-payments"])


@router.get("/", response_model=list[PurchasePaymentResponse])
async def list_purchase_payments(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by bill number or narration"),
    company_id: uuid.UUID | None = Query(None),
    supplier_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(PurchasePayment).where(PurchasePayment.user_id == user.id)
    if search:
        q = q.where(
            PurchasePayment.bill_no.ilike(f"%{search}%")
            | PurchasePayment.narration.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(PurchasePayment.company_id == company_id)
    if supplier_id:
        q = q.where(PurchasePayment.supplier_id == supplier_id)
    q = q.order_by(PurchasePayment.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=PurchasePaymentResponse)
async def get_purchase_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchasePayment).where(
            PurchasePayment.id == item_id, PurchasePayment.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=PurchasePaymentResponse, status_code=201)
async def create_purchase_payment(
    data: PurchasePaymentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = PurchasePayment(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=PurchasePaymentResponse)
async def update_purchase_payment(
    item_id: uuid.UUID,
    data: PurchasePaymentUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchasePayment).where(
            PurchasePayment.id == item_id, PurchasePayment.user_id == user.id
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
async def delete_purchase_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PurchasePayment).where(
            PurchasePayment.id == item_id, PurchasePayment.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
