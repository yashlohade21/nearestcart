from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas.product import ProductResponse
from app.schemas.shop import ShopResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
async def search(
    query: str = Query(..., min_length=1, description="Search term"),
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(5.0, gt=0, le=50),
) -> dict[str, list[ShopResponse] | list[ProductResponse]]:
    """Search shops and products near a location.

    Stub: returns empty results. In production, performs a combined
    full-text + geo search against shops and products.
    """
    # TODO: implement real search using PostGIS + pg_trgm / full-text search
    return {
        "shops": [],
        "products": [],
    }
