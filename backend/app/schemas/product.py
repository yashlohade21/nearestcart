from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: str | None = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    category: str | None = Field(None, max_length=100)
    image_url: str | None = Field(None, max_length=500)
    in_stock: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    description: str | None = None
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    category: str | None = Field(None, max_length=100)
    image_url: str | None = Field(None, max_length=500)
    in_stock: bool | None = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    shop_id: uuid.UUID
    name: str
    description: str | None = None
    price: Decimal
    category: str | None = None
    image_url: str | None = None
    in_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NearbyProductsQuery(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    q: str | None = Field(None, description="Search query for product name")
    radius_km: float = Field(5.0, gt=0, le=50, description="Search radius in kilometres")
