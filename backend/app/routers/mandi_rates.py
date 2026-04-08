from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.mandi_rate import MandiRate
from app.models.user import User
from app.services.mandi_scraper import fetch_mandi_rates, sync_rates_to_db

router = APIRouter(prefix="/mandi-rates", tags=["mandi-rates"])


class MandiRateResponse(BaseModel):
    id: str
    product_name: str
    mandi_name: str
    city: str
    state: str
    min_price: float | None
    max_price: float | None
    modal_price: float | None
    unit: str
    rate_date: str
    source: str

    model_config = {"from_attributes": True}


class MandiRateSummary(BaseModel):
    product_name: str
    avg_modal_price: float
    min_price: float
    max_price: float
    num_mandis: int


@router.get("", response_model=list[MandiRateResponse])
async def list_rates(
    product: str | None = None,
    state: str | None = None,
    city: str | None = None,
    days: int = Query(default=7, le=30),
    limit: int = Query(default=100, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get mandi rates for the past N days."""
    since = date.today() - timedelta(days=days)
    query = select(MandiRate).where(MandiRate.rate_date >= since)
    if product:
        query = query.where(MandiRate.product_name.ilike(f"%{product}%"))
    if state:
        query = query.where(MandiRate.state.ilike(f"%{state}%"))
    if city:
        query = query.where(MandiRate.city.ilike(f"%{city}%"))
    query = (
        query.order_by(desc(MandiRate.rate_date), MandiRate.product_name).limit(limit)
    )
    result = await db.execute(query)
    rates = result.scalars().all()
    return [
        MandiRateResponse(
            id=str(r.id),
            product_name=r.product_name,
            mandi_name=r.mandi_name,
            city=r.city,
            state=r.state,
            min_price=float(r.min_price) if r.min_price else None,
            max_price=float(r.max_price) if r.max_price else None,
            modal_price=float(r.modal_price) if r.modal_price else None,
            unit=r.unit,
            rate_date=str(r.rate_date),
            source=r.source,
        )
        for r in rates
    ]


@router.get("/summary", response_model=list[MandiRateSummary])
async def rate_summary(
    state: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get average rates per product for today (or latest available date)."""
    today = date.today()
    query = (
        select(
            MandiRate.product_name,
            func.avg(MandiRate.modal_price).label("avg_modal_price"),
            func.min(MandiRate.min_price).label("min_price"),
            func.max(MandiRate.max_price).label("max_price"),
            func.count().label("num_mandis"),
        )
        .where(MandiRate.rate_date >= today - timedelta(days=3))
        .group_by(MandiRate.product_name)
        .order_by(MandiRate.product_name)
    )
    if state:
        query = query.where(MandiRate.state.ilike(f"%{state}%"))
    result = await db.execute(query)
    rows = result.all()
    return [
        MandiRateSummary(
            product_name=r.product_name,
            avg_modal_price=float(r.avg_modal_price or 0),
            min_price=float(r.min_price or 0),
            max_price=float(r.max_price or 0),
            num_mandis=r.num_mandis,
        )
        for r in rows
    ]


@router.post("/sync")
async def sync_rates(
    commodity: str | None = None,
    state: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch latest rates from data.gov.in and sync to DB."""
    rates = await fetch_mandi_rates(commodity=commodity, state=state)
    count = await sync_rates_to_db(db, rates)
    return {"synced": count, "fetched": len(rates)}
