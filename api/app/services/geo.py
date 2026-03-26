from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.shop import Shop


async def find_nearby_shops(
    session: AsyncSession,
    lat: float,
    lng: float,
    radius_m: float,
) -> list[Shop]:
    """Return shops within ``radius_m`` metres of the given point.

    Uses PostGIS ``ST_DWithin`` on the shop's geography column, which
    calculates great-circle distance automatically when using geography types.
    """
    point = func.ST_MakePoint(lng, lat)  # ST_MakePoint takes (x=lon, y=lat)
    point_geog = func.ST_SetSRID(point, 4326).cast_to("geography")

    stmt = (
        select(Shop)
        .where(Shop.is_active.is_(True))
        .where(func.ST_DWithin(Shop.location, point_geog, radius_m))
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def find_nearby_products(
    session: AsyncSession,
    lat: float,
    lng: float,
    radius_m: float,
    search_query: str | None = None,
) -> list[Product]:
    """Return products whose shop is within ``radius_m`` metres of the point.

    Optionally filters by a case-insensitive name search.
    """
    point = func.ST_MakePoint(lng, lat)
    point_geog = func.ST_SetSRID(point, 4326).cast_to("geography")

    stmt = (
        select(Product)
        .join(Shop, Product.shop_id == Shop.id)
        .where(Shop.is_active.is_(True))
        .where(func.ST_DWithin(Shop.location, point_geog, radius_m))
    )

    if search_query:
        stmt = stmt.where(Product.name.ilike(f"%{search_query}%"))

    result = await session.execute(stmt)
    return list(result.scalars().all())
