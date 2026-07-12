import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class FarmerPaymentRecord(Base):
    __tablename__ = "farmer_payment_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), index=True)

    payment_date: Mapped[date] = mapped_column(Date, default=date.today)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    cash_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    bank_name: Mapped[str | None] = mapped_column(String(100))
    cheque_no: Mapped[str | None] = mapped_column(String(30))
    narration: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="farmer_payment_records")
    company = relationship("Company", back_populates="farmer_payment_records")
    farmer = relationship("Farmer", back_populates="farmer_payment_records")
