import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    deal_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("deals.id"), index=True)
    advance_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("advances.id"), index=True)
    direction: Mapped[str] = mapped_column(String(10))
    farmer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("farmers.id"), index=True)
    buyer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("buyers.id"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    payment_mode: Mapped[str | None] = mapped_column(String(20))
    reference_no: Mapped[str | None] = mapped_column(String(100))
    payment_date: Mapped[date] = mapped_column(Date, default=date.today)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))

    deal = relationship("Deal", back_populates="payments")
    advance = relationship("Advance", back_populates="payments")
