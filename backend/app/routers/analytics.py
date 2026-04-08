from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


class FarmerPerformance(BaseModel):
    farmer_id: str
    farmer_name: str
    total_deals: int
    total_quantity_kg: float
    total_business: float
    avg_spoilage_pct: float
    dispute_pct: float
    outstanding_advance: float


class BuyerPerformance(BaseModel):
    buyer_id: str
    buyer_name: str
    total_deals: int
    total_quantity_kg: float
    total_business: float
    total_profit_from_buyer: float
    dispute_pct: float


class TransporterPerformance(BaseModel):
    transporter_id: str
    transporter_name: str
    vehicle_type: str | None
    total_trips: int
    avg_trip_cost: float
    avg_spoilage_pct: float
    total_transport_spend: float


FARMER_SORT_COLUMNS = {
    "total_deals", "total_quantity_kg", "total_business",
    "avg_spoilage_pct", "dispute_pct", "outstanding_advance",
}

BUYER_SORT_COLUMNS = {
    "total_deals", "total_quantity_kg", "total_business",
    "total_profit_from_buyer", "dispute_pct",
}

TRANSPORTER_SORT_COLUMNS = {
    "total_trips", "avg_trip_cost", "avg_spoilage_pct",
    "total_transport_spend",
}


@router.get("/farmers", response_model=list[FarmerPerformance])
async def farmer_analytics(
    sort_by: str = Query(
        default="total_business",
        regex="^(total_deals|total_quantity_kg|total_business|avg_spoilage_pct|dispute_pct|outstanding_advance)$",
    ),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    limit: int = Query(default=50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if sort_by not in FARMER_SORT_COLUMNS:
        sort_by = "total_business"

    result = await db.execute(
        text(
            f"SELECT * FROM v_farmer_performance "
            f"WHERE user_id = :uid ORDER BY {sort_by} {order} LIMIT :lim"
        ),
        {"uid": user.id, "lim": limit},
    )
    rows = result.mappings().all()
    return [
        FarmerPerformance(
            farmer_id=str(r["farmer_id"]),
            farmer_name=r["farmer_name"],
            total_deals=r["total_deals"],
            total_quantity_kg=float(r["total_quantity_kg"] or 0),
            total_business=float(r["total_business"] or 0),
            avg_spoilage_pct=float(r["avg_spoilage_pct"] or 0),
            dispute_pct=float(r["dispute_pct"] or 0),
            outstanding_advance=float(r["outstanding_advance"] or 0),
        )
        for r in rows
    ]


@router.get("/buyers", response_model=list[BuyerPerformance])
async def buyer_analytics(
    sort_by: str = Query(
        default="total_business",
        regex="^(total_deals|total_quantity_kg|total_business|total_profit_from_buyer|dispute_pct)$",
    ),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    limit: int = Query(default=50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if sort_by not in BUYER_SORT_COLUMNS:
        sort_by = "total_business"

    result = await db.execute(
        text(
            f"SELECT * FROM v_buyer_performance "
            f"WHERE user_id = :uid ORDER BY {sort_by} {order} LIMIT :lim"
        ),
        {"uid": user.id, "lim": limit},
    )
    rows = result.mappings().all()
    return [
        BuyerPerformance(
            buyer_id=str(r["buyer_id"]),
            buyer_name=r["buyer_name"],
            total_deals=r["total_deals"],
            total_quantity_kg=float(r["total_quantity_kg"] or 0),
            total_business=float(r["total_business"] or 0),
            total_profit_from_buyer=float(r["total_profit_from_buyer"] or 0),
            dispute_pct=float(r["dispute_pct"] or 0),
        )
        for r in rows
    ]


@router.get("/transporters", response_model=list[TransporterPerformance])
async def transporter_analytics(
    sort_by: str = Query(
        default="total_trips",
        regex="^(total_trips|avg_trip_cost|avg_spoilage_pct|total_transport_spend)$",
    ),
    order: str = Query(default="desc", regex="^(asc|desc)$"),
    limit: int = Query(default=50, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if sort_by not in TRANSPORTER_SORT_COLUMNS:
        sort_by = "total_trips"

    result = await db.execute(
        text(
            f"SELECT * FROM v_transporter_performance "
            f"WHERE user_id = :uid ORDER BY {sort_by} {order} LIMIT :lim"
        ),
        {"uid": user.id, "lim": limit},
    )
    rows = result.mappings().all()
    return [
        TransporterPerformance(
            transporter_id=str(r["transporter_id"]),
            transporter_name=r["transporter_name"],
            vehicle_type=r["vehicle_type"],
            total_trips=r["total_trips"],
            avg_trip_cost=float(r["avg_trip_cost"] or 0),
            avg_spoilage_pct=float(r["avg_spoilage_pct"] or 0),
            total_transport_spend=float(r["total_transport_spend"] or 0),
        )
        for r in rows
    ]
