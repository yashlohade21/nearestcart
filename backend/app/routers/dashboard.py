from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.redis import cache_get, cache_set
from app.models.advance import Advance
from app.models.deal import Deal
from app.models.user import User
from app.schemas.dashboard import DashboardOverview, WeeklyPnL

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def overview(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check cache first
    cache_key = f"dash:overview:{user.id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    today = date.today()

    # Today's deals
    today_result = await db.execute(
        select(
            func.count().label("count"),
            func.coalesce(func.sum(Deal.quantity * Deal.buy_rate), 0).label("buy_total"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("sell_total"),
            func.coalesce(
                func.sum(
                    Deal.quantity * (Deal.sell_rate - Deal.buy_rate)
                    - Deal.transport_cost - Deal.labour_cost - Deal.other_cost
                ), 0
            ).label("net_profit"),
        ).where(Deal.user_id == user.id, Deal.deal_date == today)
    )
    row = today_result.one()

    # Pending from buyers
    buyer_pending = await db.execute(
        select(
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate - Deal.buyer_received_amount), 0)
        ).where(Deal.user_id == user.id, Deal.buyer_payment_status != "paid")
    )
    pending_from = float(buyer_pending.scalar())

    # Pending to farmers
    farmer_pending = await db.execute(
        select(
            func.coalesce(func.sum(Deal.quantity * Deal.buy_rate - Deal.farmer_paid_amount), 0)
        ).where(Deal.user_id == user.id, Deal.farmer_payment_status != "paid")
    )
    pending_to = float(farmer_pending.scalar())

    # Active advances
    advance_result = await db.execute(
        select(func.coalesce(func.sum(Advance.amount - Advance.recovered), 0))
        .where(Advance.user_id == user.id, Advance.status.in_(["active", "partial"]))
    )
    active_advances = float(advance_result.scalar())

    result_data = DashboardOverview(
        today_deals=row.count,
        today_buy_total=float(row.buy_total),
        today_sell_total=float(row.sell_total),
        today_net_profit=float(row.net_profit),
        pending_from_buyers=pending_from,
        pending_to_farmers=pending_to,
        net_position=pending_from - pending_to,
        active_advances=active_advances,
    )
    await cache_set(cache_key, result_data.model_dump(), ttl=120)
    return result_data


@router.get("/weekly", response_model=WeeklyPnL)
async def weekly_pnl(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check cache first
    cache_key = f"dash:weekly:{user.id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    result = await db.execute(
        select(
            func.count().label("count"),
            func.coalesce(func.sum(Deal.quantity * Deal.buy_rate), 0).label("bought"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("sold"),
            func.coalesce(func.sum(Deal.quantity * (Deal.sell_rate - Deal.buy_rate)), 0).label("gross"),
            func.coalesce(func.sum(Deal.transport_cost + Deal.labour_cost + Deal.other_cost), 0).label("costs"),
            func.coalesce(func.sum(
                Deal.quantity * (Deal.sell_rate - Deal.buy_rate)
                - Deal.transport_cost - Deal.labour_cost - Deal.other_cost
            ), 0).label("net"),
            func.coalesce(func.sum(Deal.spoilage_qty), 0).label("spoilage_qty"),
            func.coalesce(func.avg(
                Deal.spoilage_qty * 100 / func.nullif(Deal.quantity, 0)
            ), 0).label("spoilage_pct"),
        ).where(
            Deal.user_id == user.id,
            Deal.deal_date >= week_start,
            Deal.deal_date <= week_end,
        )
    )
    row = result.one()

    result_data = WeeklyPnL(
        week_start=week_start,
        week_end=week_end,
        total_deals=row.count,
        total_bought=float(row.bought),
        total_sold=float(row.sold),
        gross_margin=float(row.gross),
        total_costs=float(row.costs),
        net_profit=float(row.net),
        total_spoilage_qty=float(row.spoilage_qty),
        avg_spoilage_pct=float(row.spoilage_pct),
    )
    await cache_set(cache_key, result_data.model_dump(), ttl=300)
    return result_data
