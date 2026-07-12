from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class VehicleCreate(BaseModel):
    company_id: UUID | None = None
    vehicle_no: str
    owner_name: str | None = None
    driver_name: str | None = None
    phone: str | None = None
    vehicle_type: str | None = None
    is_active: bool = True


class VehicleUpdate(BaseModel):
    company_id: UUID | None = None
    vehicle_no: str | None = None
    owner_name: str | None = None
    driver_name: str | None = None
    phone: str | None = None
    vehicle_type: str | None = None
    is_active: bool | None = None


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    vehicle_no: str
    owner_name: str | None
    driver_name: str | None
    phone: str | None
    vehicle_type: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
