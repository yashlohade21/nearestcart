import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(15))
    email: Mapped[str | None] = mapped_column(String(150))
    village: Mapped[str | None] = mapped_column(String(100))
    district: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(Text)
    pan_number: Mapped[str | None] = mapped_column(String(10))
    opening_balance: Mapped[float | None] = mapped_column(Numeric(14, 2), default=0)
    credit_days: Mapped[int | None] = mapped_column(Integer, default=0)
    primary_crops: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    quality_rating: Mapped[float | None] = mapped_column(Numeric(2, 1))
    reliability: Mapped[float | None] = mapped_column(Numeric(5, 2))
    total_deals: Mapped[int] = mapped_column(Integer, default=0)
    total_volume_kg: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    # Mandi-specific fields
    gaon: Mapped[str | None] = mapped_column(String(100))
    taluka: Mapped[str | None] = mapped_column(String(100))
    bank_name: Mapped[str | None] = mapped_column(String(100))
    account_no: Mapped[str | None] = mapped_column(String(30))
    ifsc_code: Mapped[str | None] = mapped_column(String(11))
    farmer_bank_branch: Mapped[str | None] = mapped_column(String(100))

    notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="farmers")
    deals = relationship("Deal", back_populates="farmer")
    advances = relationship("Advance", back_populates="farmer")
    farmer_entries = relationship("FarmerEntry", back_populates="farmer")
    farmer_payment_records = relationship("FarmerPaymentRecord", back_populates="farmer")
    purchase_entries = relationship("PurchaseEntry", back_populates="supplier")
    purchase_payments = relationship("PurchasePayment", back_populates="supplier")
