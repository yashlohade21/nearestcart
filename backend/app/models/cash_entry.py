import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class CashEntry(Base):
    __tablename__ = "cash_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)

    entry_date: Mapped[date] = mapped_column(Date, default=date.today)
    type: Mapped[str] = mapped_column(String(20))  # receipt / payment
    narration: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    party_name: Mapped[str | None] = mapped_column(String(200))
    party_type: Mapped[str | None] = mapped_column(String(50))
    reference_no: Mapped[str | None] = mapped_column(String(50))
    branch: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="cash_entries")
    company = relationship("Company", back_populates="cash_entries")
