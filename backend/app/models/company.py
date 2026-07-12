import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str | None] = mapped_column(Text)
    gst_no: Mapped[str | None] = mapped_column(String(20))
    pan_no: Mapped[str | None] = mapped_column(String(15))
    logo_url: Mapped[str | None] = mapped_column(String(500))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    phone: Mapped[str | None] = mapped_column(String(15))
    email: Mapped[str | None] = mapped_column(String(150))
    bank_name: Mapped[str | None] = mapped_column(String(100))
    account_no: Mapped[str | None] = mapped_column(String(30))
    ifsc_code: Mapped[str | None] = mapped_column(String(15))
    branch: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="companies")
    cash_entries = relationship("CashEntry", back_populates="company")
    bank_transactions = relationship("BankTransaction", back_populates="company")
    expenses = relationship("Expense", back_populates="company")
    vehicles = relationship("Vehicle", back_populates="company")
    delivery_places = relationship("DeliveryPlace", back_populates="company")
    kharidars = relationship("Kharidar", back_populates="company")
    farmer_entries = relationship("FarmerEntry", back_populates="company")
    farmer_sales = relationship("FarmerSale", back_populates="company")
    farmer_payment_records = relationship("FarmerPaymentRecord", back_populates="company")
    nave_bills = relationship("NaveBill", back_populates="company")
    purchase_entries = relationship("PurchaseEntry", back_populates="company")
    sale_entries = relationship("SaleEntry", back_populates="company")
    purchase_payments = relationship("PurchasePayment", back_populates="company")
    sale_payments = relationship("SalePayment", back_populates="company")
    stock_ledger_entries = relationship("StockLedger", back_populates="company")
    agent_commissions = relationship("AgentCommission", back_populates="company")
