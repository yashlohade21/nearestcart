import uuid
from datetime import datetime

from pydantic import BaseModel


class TransporterCreate(BaseModel):
    name: str
    phone: str | None = None
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    base_city: str | None = None
    notes: str | None = None


class TransporterUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    base_city: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class TransporterResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str | None
    vehicle_type: str | None
    vehicle_number: str | None
    base_city: str | None
    avg_cost_per_km: float | None
    avg_spoilage_pct: float | None
    on_time_pct: float | None
    total_trips: int
    rating: float | None
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
