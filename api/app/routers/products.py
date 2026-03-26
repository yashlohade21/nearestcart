from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Query

from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/shops/{shop_id}/products", response_model=ProductResponse, status_code=201)
async def create_product(shop_id: uuid.UUID, payload: ProductCreate) -> ProductResponse:
    """Create a product for a shop.

    Stub: returns mock data.
    """
    now = datetime.now(timezone.utc)
    return ProductResponse(
        id=uuid.uuid4(),
        shop_id=shop_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        category=payload.category,
        image_url=payload.image_url,
        in_stock=payload.in_stock,
        created_at=now,
        updated_at=now,
    )


@router.get("/nearby", response_model=list[ProductResponse])
async def nearby_products(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    q: str | None = Query(None, description="Search query for product name"),
    radius_km: float = Query(5.0, gt=0, le=50),
) -> list[ProductResponse]:
    """Find products near a location.

    Stub: returns an empty list. In production, uses PostGIS ST_DWithin via
    the geo service.
    """
    # TODO: implement real geo query via app.services.geo
    return []


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: uuid.UUID) -> ProductResponse:
    """Get a product by ID.

    Stub: returns mock data.
    """
    now = datetime.now(timezone.utc)
    return ProductResponse(
        id=product_id,
        shop_id=uuid.uuid4(),
        name="Mock Product",
        description="A placeholder product",
        price=Decimal("99.99"),
        category="general",
        image_url=None,
        in_stock=True,
        created_at=now,
        updated_at=now,
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: uuid.UUID, payload: ProductUpdate) -> ProductResponse:
    """Update a product by ID.

    Stub: returns mock data reflecting the update.
    """
    now = datetime.now(timezone.utc)
    return ProductResponse(
        id=product_id,
        shop_id=uuid.uuid4(),
        name=payload.name or "Mock Product",
        description=payload.description,
        price=payload.price or Decimal("99.99"),
        category=payload.category,
        image_url=payload.image_url,
        in_stock=payload.in_stock if payload.in_stock is not None else True,
        created_at=now,
        updated_at=now,
    )
