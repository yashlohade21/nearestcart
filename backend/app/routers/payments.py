import uuid
from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_action
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.deal import Deal
from app.models.buyer import Buyer
from app.models.farmer import Farmer
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse, PendingPaymentSummary
from app.schemas.dashboard import PendingPayments

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=list[PaymentResponse])
async def list_payments(
    direction: str | None = None,
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Payment).where(Payment.user_id == user.id).order_by(Payment.payment_date.desc())
    if direction:
        query = query.where(Payment.direction == direction)
    result = await db.execute(query.limit(limit).offset(offset))
    return result.scalars().all()


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    body: PaymentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = Payment(user_id=user.id, **body.model_dump(exclude_none=True))
    if payment.payment_date is None:
        payment.payment_date = date.today()
    db.add(payment)

    # Update deal payment status if linked
    if body.deal_id:
        result = await db.execute(select(Deal).where(Deal.id == body.deal_id, Deal.user_id == user.id))
        deal = result.scalar_one_or_none()
        if deal:
            if body.direction == "incoming":
                deal.buyer_received_amount = float(deal.buyer_received_amount or 0) + body.amount
                if deal.buyer_received_amount >= deal.sell_total:
                    deal.buyer_payment_status = "paid"
                else:
                    deal.buyer_payment_status = "partial"
            elif body.direction == "outgoing":
                deal.farmer_paid_amount = float(deal.farmer_paid_amount or 0) + body.amount
                if deal.farmer_paid_amount >= deal.buy_total:
                    deal.farmer_payment_status = "paid"
                else:
                    deal.farmer_payment_status = "partial"

    # Update advance if linked
    if body.advance_id:
        from app.models.advance import Advance

        result = await db.execute(
            select(Advance).where(Advance.id == body.advance_id, Advance.user_id == user.id)
        )
        advance = result.scalar_one_or_none()
        if advance:
            advance.recovered = float(advance.recovered or 0) + body.amount
            if advance.recovered >= float(advance.amount):
                advance.status = "recovered"
            else:
                advance.status = "partial"

    await db.flush()
    await log_action(db, user.id, "create", "payment", payment.id)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.get("/pending", response_model=PendingPayments)
async def pending_payments(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Pending from buyers (mujhe milna hai)
    buyer_query = (
        select(
            Deal.buyer_id,
            Buyer.name,
            Buyer.phone,
            func.sum(Deal.quantity * Deal.sell_rate - Deal.buyer_received_amount).label("pending"),
            func.count().label("count"),
            func.min(Deal.deal_date).label("oldest"),
        )
        .join(Buyer, Buyer.id == Deal.buyer_id)
        .where(Deal.user_id == user.id, Deal.buyer_payment_status != "paid")
        .group_by(Deal.buyer_id, Buyer.name, Buyer.phone)
    )
    buyer_result = await db.execute(buyer_query)
    from_buyers = []
    total_from = 0.0
    for row in buyer_result:
        pending = float(row.pending or 0)
        total_from += pending
        overdue = (date.today() - row.oldest).days if row.oldest else None
        from_buyers.append(
            PendingPaymentSummary(
                party_id=row.buyer_id,
                party_name=row.name,
                party_phone=row.phone,
                pending_amount=pending,
                pending_deals=row.count,
                oldest_deal_date=row.oldest,
                max_overdue_days=overdue,
            )
        )

    # Pending to farmers (mujhe dena hai)
    farmer_query = (
        select(
            Deal.farmer_id,
            Farmer.name,
            Farmer.phone,
            func.sum(Deal.quantity * Deal.buy_rate - Deal.farmer_paid_amount).label("pending"),
            func.count().label("count"),
            func.min(Deal.deal_date).label("oldest"),
        )
        .join(Farmer, Farmer.id == Deal.farmer_id)
        .where(Deal.user_id == user.id, Deal.farmer_payment_status != "paid")
        .group_by(Deal.farmer_id, Farmer.name, Farmer.phone)
    )
    farmer_result = await db.execute(farmer_query)
    to_farmers = []
    total_to = 0.0
    for row in farmer_result:
        pending = float(row.pending or 0)
        total_to += pending
        overdue = (date.today() - row.oldest).days if row.oldest else None
        to_farmers.append(
            PendingPaymentSummary(
                party_id=row.farmer_id,
                party_name=row.name,
                party_phone=row.phone,
                pending_amount=pending,
                pending_deals=row.count,
                oldest_deal_date=row.oldest,
                max_overdue_days=overdue,
            )
        )

    return PendingPayments(
        from_buyers=from_buyers,
        to_farmers=to_farmers,
        total_from_buyers=total_from,
        total_to_farmers=total_to,
        net_position=total_from - total_to,
    )
