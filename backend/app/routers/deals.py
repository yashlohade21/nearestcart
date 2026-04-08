import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.deal import Deal
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.models.product import Product
from app.models.user import User
from app.core.audit import log_action
from app.schemas.deal import DealCreate, DealResponse, DealUpdate

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("", response_model=list[DealResponse])
async def list_deals(
    date_from: date | None = None,
    date_to: date | None = None,
    farmer_id: uuid.UUID | None = None,
    buyer_id: uuid.UUID | None = None,
    status_filter: str | None = Query(None, alias="status"),
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Deal)
        .options(selectinload(Deal.farmer), selectinload(Deal.buyer), selectinload(Deal.product))
        .where(Deal.user_id == user.id)
        .order_by(Deal.deal_date.desc(), Deal.created_at.desc())
    )
    if date_from:
        query = query.where(Deal.deal_date >= date_from)
    if date_to:
        query = query.where(Deal.deal_date <= date_to)
    if farmer_id:
        query = query.where(Deal.farmer_id == farmer_id)
    if buyer_id:
        query = query.where(Deal.buyer_id == buyer_id)
    if status_filter:
        query = query.where(Deal.status == status_filter)
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    deals = result.scalars().all()
    return [
        DealResponse(
            **{c.key: getattr(d, c.key) for c in Deal.__table__.columns},
            farmer_name=d.farmer.name if d.farmer else None,
            buyer_name=d.buyer.name if d.buyer else None,
            product_name=d.product.name if d.product else None,
        )
        for d in deals
    ]


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    body: DealCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deal = Deal(user_id=user.id, **body.model_dump(exclude_none=True))
    if deal.deal_date is None:
        deal.deal_date = date.today()
    db.add(deal)
    await db.flush()
    await log_action(db, user.id, "create", "deal", deal.id)
    await db.commit()
    await db.refresh(deal)

    # Load relations
    await db.refresh(deal, ["farmer", "buyer", "product"])
    return DealResponse(
        **{c.key: getattr(deal, c.key) for c in Deal.__table__.columns},
        farmer_name=deal.farmer.name if deal.farmer else None,
        buyer_name=deal.buyer.name if deal.buyer else None,
        product_name=deal.product.name if deal.product else None,
    )


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deal)
        .options(selectinload(Deal.farmer), selectinload(Deal.buyer), selectinload(Deal.product))
        .where(Deal.id == deal_id, Deal.user_id == user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return DealResponse(
        **{c.key: getattr(deal, c.key) for c in Deal.__table__.columns},
        farmer_name=deal.farmer.name if deal.farmer else None,
        buyer_name=deal.buyer.name if deal.buyer else None,
        product_name=deal.product.name if deal.product else None,
    )


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deal(
    deal_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deal).where(Deal.id == deal_id, Deal.user_id == user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    deal.status = "cancelled"
    await log_action(db, user.id, "delete", "deal", deal_id)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: uuid.UUID,
    body: DealUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deal)
        .options(selectinload(Deal.farmer), selectinload(Deal.buyer), selectinload(Deal.product))
        .where(Deal.id == deal_id, Deal.user_id == user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(deal, field, value)
    await log_action(db, user.id, "update", "deal", deal_id, changes=update_data)
    await db.commit()
    await db.refresh(deal)
    return DealResponse(
        **{c.key: getattr(deal, c.key) for c in Deal.__table__.columns},
        farmer_name=deal.farmer.name if deal.farmer else None,
        buyer_name=deal.buyer.name if deal.buyer else None,
        product_name=deal.product.name if deal.product else None,
    )
