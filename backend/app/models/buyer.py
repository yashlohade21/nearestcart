import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Buyer(Base):
    __tablename__ = "buyers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    contact_person: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(15))
    company_type: Mapped[str | None] = mapped_column(String(30))
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    state: Mapped[str | None] = mapped_column(String(50))
    gst_number: Mapped[str | None] = mapped_column(String(20))
    avg_payment_days: Mapped[float | None] = mapped_column(Numeric(5, 1))
    dispute_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    payment_rating: Mapped[float | None] = mapped_column(Numeric(2, 1))
    total_deals: Mapped[int] = mapped_column(Integer, default=0)
    total_volume_kg: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total_business_amt: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="buyers")
    deals = relationship("Deal", back_populates="buyer")
