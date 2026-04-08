import uuid
from datetime import datetime

from pydantic import BaseModel


class FileResponse(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    file_type: str
    file_url: str
    original_name: str | None
    mime_type: str | None
    file_size: int | None
    latitude: float | None
    longitude: float | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
