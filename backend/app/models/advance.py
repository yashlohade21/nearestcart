import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Advance(Base):
    __tablename__ = "advances"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    recovered: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    purpose: Mapped[str | None] = mapped_column(String(100))
    given_date: Mapped[date] = mapped_column(Date, default=date.today)
    expected_recovery_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @property
    def balance(self) -> float:
        return float(self.amount) - float(self.recovered)

    farmer = relationship("Farmer", back_populates="advances")
    payments = relationship("Payment", back_populates="advance")
