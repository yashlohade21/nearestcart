import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Transporter(Base):
    __tablename__ = "transporters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(15))
    vehicle_type: Mapped[str | None] = mapped_column(String(50))
    vehicle_number: Mapped[str | None] = mapped_column(String(20))
    base_city: Mapped[str | None] = mapped_column(String(100))
    avg_cost_per_km: Mapped[float | None] = mapped_column(Numeric(8, 2))
    avg_spoilage_pct: Mapped[float | None] = mapped_column(Numeric(5, 2))
    on_time_pct: Mapped[float | None] = mapped_column(Numeric(5, 2))
    total_trips: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float | None] = mapped_column(Numeric(2, 1))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="transporters")
    deals = relationship("Deal", back_populates="transporter")
