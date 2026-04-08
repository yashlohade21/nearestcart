import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.buyer import Buyer
from app.models.deal import Deal
from app.models.payment import Payment
from app.models.user import User
from app.schemas.buyer import BuyerCreate, BuyerDetailResponse, BuyerResponse, BuyerUpdate

router = APIRouter(prefix="/buyers", tags=["buyers"])


@router.get("", response_model=list[BuyerResponse])
async def list_buyers(
    search: str | None = Query(None),
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Buyer)
        .where(Buyer.user_id == user.id, Buyer.is_active.is_(True))
        .order_by(Buyer.name)
    )
    if search:
        query = query.where(Buyer.name.ilike(f"%{search}%"))
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{buyer_id}", response_model=BuyerDetailResponse)
async def get_buyer(
    buyer_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Buyer).where(Buyer.id == buyer_id, Buyer.user_id == user.id)
    )
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    # Get deals
    deals_result = await db.execute(
        select(Deal)
        .options(selectinload(Deal.product), selectinload(Deal.farmer))
        .where(Deal.buyer_id == buyer_id, Deal.user_id == user.id)
        .order_by(Deal.deal_date.desc())
        .limit(50)
    )
    deals = deals_result.scalars().all()

    # Get payments
    payments_result = await db.execute(
        select(Payment)
        .where(Payment.buyer_id == buyer_id, Payment.user_id == user.id)
        .order_by(Payment.payment_date.desc())
        .limit(50)
    )
    payments = payments_result.scalars().all()

    # Compute outstanding balance
    total_sell = sum(float(d.quantity) * float(d.sell_rate) for d in deals if d.sell_rate)
    total_received = sum(float(p.amount) for p in payments if p.direction == "incoming")

    deal_items = [
        {
            "id": str(d.id),
            "deal_date": str(d.deal_date),
            "product_name": d.product.name if d.product else None,
            "farmer_name": d.farmer.name if d.farmer else None,
            "quantity": float(d.quantity),
            "unit": d.unit,
            "sell_rate": float(d.sell_rate) if d.sell_rate else 0,
            "sell_total": float(d.quantity) * float(d.sell_rate) if d.sell_rate else 0,
            "status": d.status,
        }
        for d in deals
    ]

    payment_items = [
        {
            "id": str(p.id),
            "payment_date": str(p.payment_date),
            "amount": float(p.amount),
            "payment_mode": p.payment_mode,
            "reference_no": p.reference_no,
            "notes": p.notes,
        }
        for p in payments
    ]

    return BuyerDetailResponse(
        **{c.key: getattr(buyer, c.key) for c in Buyer.__table__.columns},
        total_sell_amount=total_sell,
        total_received_amount=total_received,
        outstanding_balance=total_sell - total_received,
        deals=deal_items,
        payments=payment_items,
    )


@router.post("", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED)
async def create_buyer(
    body: BuyerCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    buyer = Buyer(user_id=user.id, **body.model_dump(exclude_none=True))
    db.add(buyer)
    await db.commit()
    await db.refresh(buyer)
    return buyer


@router.delete("/{buyer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_buyer(
    buyer_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Buyer).where(Buyer.id == buyer_id, Buyer.user_id == user.id)
    )
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    buyer.is_active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{buyer_id}", response_model=BuyerResponse)
async def update_buyer(
    buyer_id: uuid.UUID,
    body: BuyerUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Buyer).where(Buyer.id == buyer_id, Buyer.user_id == user.id)
    )
    buyer = result.scalar_one_or_none()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(buyer, field, value)
    await db.commit()
    await db.refresh(buyer)
    return buyer
