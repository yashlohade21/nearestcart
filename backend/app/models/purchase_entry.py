import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class PurchaseEntry(Base):
    __tablename__ = "purchase_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    supplier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)
    agent_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("agents.id"), index=True)

    bill_no: Mapped[str] = mapped_column(String(50))
    p_date: Mapped[date] = mapped_column(Date, default=date.today)
    vehicle_no: Mapped[str | None] = mapped_column(String(20))

    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    gross_amount: Mapped[float] = mapped_column(Numeric(14, 2))
    transport_cost: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    loading_cost: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    unloading_cost: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    advance: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(14, 2))
    commission_deduction: Mapped[float] = mapped_column(Numeric(14, 2), default=0)

    branch: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="purchase_entries")
    company = relationship("Company", back_populates="purchase_entries")
    supplier = relationship("Farmer", back_populates="purchase_entries")
    product = relationship("Product", back_populates="purchase_entries")
    agent = relationship("Agent", back_populates="purchase_entries")
