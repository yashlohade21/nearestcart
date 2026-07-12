from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DeliveryPlaceCreate(BaseModel):
    company_id: UUID | None = None
    place_name: str
    district: str | None = None
    state: str | None = None


class DeliveryPlaceUpdate(BaseModel):
    company_id: UUID | None = None
    place_name: str | None = None
    district: str | None = None
    state: str | None = None


class DeliveryPlaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    place_name: str
    district: str | None
    state: str | None
    created_at: datetime
    updated_at: datetime
