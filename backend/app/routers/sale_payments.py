import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.sale_payment import SalePayment
from app.models.user import User
from app.schemas.sale_payment import (
    SalePaymentCreate,
    SalePaymentUpdate,
    SalePaymentResponse,
)

router = APIRouter(prefix="/sale-payments", tags=["sale-payments"])


@router.get("/", response_model=list[SalePaymentResponse])
async def list_sale_payments(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by invoice number or narration"),
    company_id: uuid.UUID | None = Query(None),
    buyer_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(SalePayment).where(SalePayment.user_id == user.id)
    if search:
        q = q.where(
            SalePayment.invoice_no.ilike(f"%{search}%")
            | SalePayment.narration.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(SalePayment.company_id == company_id)
    if buyer_id:
        q = q.where(SalePayment.buyer_id == buyer_id)
    q = q.order_by(SalePayment.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=SalePaymentResponse)
async def get_sale_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SalePayment).where(
            SalePayment.id == item_id, SalePayment.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=SalePaymentResponse, status_code=201)
async def create_sale_payment(
    data: SalePaymentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = SalePayment(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=SalePaymentResponse)
async def update_sale_payment(
    item_id: uuid.UUID,
    data: SalePaymentUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SalePayment).where(
            SalePayment.id == item_id, SalePayment.user_id == user.id
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
async def delete_sale_payment(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SalePayment).where(
            SalePayment.id == item_id, SalePayment.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
