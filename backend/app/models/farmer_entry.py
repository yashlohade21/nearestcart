import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class FarmerEntry(Base):
    __tablename__ = "farmer_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)

    invoice_no: Mapped[str] = mapped_column(String(50))
    entry_date: Mapped[date] = mapped_column(Date, default=date.today)
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), index=True)
    village: Mapped[str] = mapped_column(String(200))
    kharidar_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("kharidars.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)

    weight: Mapped[float] = mapped_column(Numeric(10, 2))
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    hamali: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    tawali: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    warai: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    auto_charge: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    kharcha: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    mobile_no: Mapped[str | None] = mapped_column(String(15))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="farmer_entries")
    company = relationship("Company", back_populates="farmer_entries")
    farmer = relationship("Farmer", back_populates="farmer_entries")
    kharidar = relationship("Kharidar", back_populates="farmer_entries")
    product = relationship("Product", back_populates="farmer_entries")
    farmer_sale = relationship("FarmerSale", back_populates="farmer_entry", uselist=False)
