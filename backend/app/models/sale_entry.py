import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class SaleEntry(Base):
    __tablename__ = "sale_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("buyers.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)

    invoice_no: Mapped[str] = mapped_column(String(50))
    sale_date: Mapped[date] = mapped_column(Date, default=date.today)

    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    gross_amount: Mapped[float] = mapped_column(Numeric(14, 2))
    transport_cost: Mapped[float] = mapped_column(Numeric(14, 2), default=0)

    lr_no: Mapped[str | None] = mapped_column(String(50))
    driver_name: Mapped[str | None] = mapped_column(String(150))
    vehicle_no: Mapped[str | None] = mapped_column(String(20))
    owner_name: Mapped[str | None] = mapped_column(String(150))
    hsn_code: Mapped[str | None] = mapped_column(String(20))

    tcs_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    add_topay: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    less_topay: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(14, 2))

    po_no: Mapped[str | None] = mapped_column(String(50))
    branch: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="sale_entries")
    company = relationship("Company", back_populates="sale_entries")
    buyer = relationship("Buyer", back_populates="sale_entries")
    product = relationship("Product", back_populates="sale_entries")
