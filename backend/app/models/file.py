import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

TZ = DateTime(timezone=True)


class FileRecord(Base):
    __tablename__ = "files"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Polymorphic link — what entity this file belongs to
    entity_type: Mapped[str] = mapped_column(String(30), index=True)  # "deal", "user", "farmer", "buyer", "advance"
    entity_id: Mapped[uuid.UUID] = mapped_column(index=True)

    # File classification
    file_type: Mapped[str] = mapped_column(String(30))  # "photo", "logo", "receipt", "weight_slip", "invoice", "document"

    # Storage
    file_path: Mapped[str] = mapped_column(String(500))  # disk path or S3 key
    file_url: Mapped[str] = mapped_column(String(500))   # public URL
    original_name: Mapped[str | None] = mapped_column(String(255))
    mime_type: Mapped[str | None] = mapped_column(String(100))
    file_size: Mapped[int | None] = mapped_column(Integer)  # bytes

    # GPS (optional, for camera photos)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))

    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
