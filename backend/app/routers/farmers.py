import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.deal import Deal
from app.models.farmer import Farmer
from app.models.payment import Payment
from app.models.user import User
from app.schemas.farmer import FarmerCreate, FarmerDetailResponse, FarmerResponse, FarmerUpdate

router = APIRouter(prefix="/farmers", tags=["farmers"])


@router.get("", response_model=list[FarmerResponse])
async def list_farmers(
    search: str | None = Query(None),
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Farmer)
        .where(Farmer.user_id == user.id, Farmer.is_active.is_(True))
        .order_by(Farmer.name)
    )
    if search:
        query = query.where(Farmer.name.ilike(f"%{search}%"))
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{farmer_id}", response_model=FarmerDetailResponse)
async def get_farmer(
    farmer_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Farmer).where(Farmer.id == farmer_id, Farmer.user_id == user.id)
    )
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Get deals
    deals_result = await db.execute(
        select(Deal)
        .options(selectinload(Deal.product), selectinload(Deal.buyer))
        .where(Deal.farmer_id == farmer_id, Deal.user_id == user.id)
        .order_by(Deal.deal_date.desc())
        .limit(50)
    )
    deals = deals_result.scalars().all()

    # Get payments
    payments_result = await db.execute(
        select(Payment)
        .where(Payment.farmer_id == farmer_id, Payment.user_id == user.id)
        .order_by(Payment.payment_date.desc())
        .limit(50)
    )
    payments = payments_result.scalars().all()

    # Compute outstanding balance
    total_buy = sum(float(d.quantity) * float(d.buy_rate) for d in deals)
    total_paid = sum(float(p.amount) for p in payments if p.direction == "outgoing")

    deal_items = [
        {
            "id": str(d.id),
            "deal_date": str(d.deal_date),
            "product_name": d.product.name if d.product else None,
            "buyer_name": d.buyer.name if d.buyer else None,
            "quantity": float(d.quantity),
            "unit": d.unit,
            "buy_rate": float(d.buy_rate),
            "buy_total": float(d.quantity) * float(d.buy_rate),
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

    return FarmerDetailResponse(
        **{c.key: getattr(farmer, c.key) for c in Farmer.__table__.columns},
        total_buy_amount=total_buy,
        total_paid_amount=total_paid,
        outstanding_balance=total_buy - total_paid,
        deals=deal_items,
        payments=payment_items,
    )


@router.post("", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    body: FarmerCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    farmer = Farmer(user_id=user.id, **body.model_dump(exclude_none=True))
    db.add(farmer)
    await db.commit()
    await db.refresh(farmer)
    return farmer


@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farmer(
    farmer_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Farmer).where(Farmer.id == farmer_id, Farmer.user_id == user.id)
    )
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    farmer.is_active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{farmer_id}", response_model=FarmerResponse)
async def update_farmer(
    farmer_id: uuid.UUID,
    body: FarmerUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Farmer).where(Farmer.id == farmer_id, Farmer.user_id == user.id)
    )
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(farmer, field, value)
    await db.commit()
    await db.refresh(farmer)
    return farmer
