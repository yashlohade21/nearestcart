import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class StockLedger(Base):
    __tablename__ = "stock_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)

    txn_date: Mapped[date] = mapped_column(Date, default=date.today)
    txn_type: Mapped[str] = mapped_column(String(20))  # purchase/sale/return/loss

    quantity: Mapped[float] = mapped_column(Numeric(10, 2))

    reference_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String(30))  # purchase_entry/sale_entry/etc

    balance_after: Mapped[float] = mapped_column(Numeric(10, 2))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="stock_ledger_entries")
    company = relationship("Company", back_populates="stock_ledger_entries")
    product = relationship("Product", back_populates="stock_ledger_entries")
