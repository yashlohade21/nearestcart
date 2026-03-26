from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    id: uuid.UUID
    phone: str
    display_name: str | None = None
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: str | None = Field(None, max_length=100)
    role: str | None = Field(None, pattern="^(shopper|owner|both)$")
