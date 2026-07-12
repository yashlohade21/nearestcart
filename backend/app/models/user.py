import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    phone: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    business_name: Mapped[str | None] = mapped_column(String(150))
    city: Mapped[str | None] = mapped_column(String(100), index=True)
    state: Mapped[str | None] = mapped_column(String(50))
    mandi_name: Mapped[str | None] = mapped_column(String(150))
    language: Mapped[str] = mapped_column(String(10), default="hi")
    gst_number: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    upi_id: Mapped[str | None] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), default="owner")  # owner, manager, viewer
    owner_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    fcm_token: Mapped[str | None] = mapped_column(String(500))
    plan: Mapped[str] = mapped_column(String(20), default="free")
    plan_expires_at: Mapped[datetime | None] = mapped_column(TZ)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    farmers = relationship("Farmer", back_populates="user", cascade="all, delete-orphan")
    buyers = relationship("Buyer", back_populates="user", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="user", cascade="all, delete-orphan")
    transporters = relationship("Transporter", back_populates="user", cascade="all, delete-orphan")
    agents = relationship("Agent", back_populates="user", cascade="all, delete-orphan")
    bank_accounts = relationship("BankAccount", back_populates="user", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="user", cascade="all, delete-orphan")
    companies = relationship("Company", back_populates="user", cascade="all, delete-orphan")
    cash_entries = relationship("CashEntry", back_populates="user", cascade="all, delete-orphan")
    bank_transactions = relationship("BankTransaction", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")
    delivery_places = relationship("DeliveryPlace", back_populates="user", cascade="all, delete-orphan")
    kharidars = relationship("Kharidar", back_populates="user", cascade="all, delete-orphan")
    farmer_entries = relationship("FarmerEntry", back_populates="user", cascade="all, delete-orphan")
    farmer_sales = relationship("FarmerSale", back_populates="user", cascade="all, delete-orphan")
    farmer_payment_records = relationship("FarmerPaymentRecord", back_populates="user", cascade="all, delete-orphan")
    nave_bills = relationship("NaveBill", back_populates="user", cascade="all, delete-orphan")
    purchase_entries = relationship("PurchaseEntry", back_populates="user", cascade="all, delete-orphan")
    sale_entries = relationship("SaleEntry", back_populates="user", cascade="all, delete-orphan")
    purchase_payments = relationship("PurchasePayment", back_populates="user", cascade="all, delete-orphan")
    sale_payments = relationship("SalePayment", back_populates="user", cascade="all, delete-orphan")
    stock_ledger_entries = relationship("StockLedger", back_populates="user", cascade="all, delete-orphan")
    agent_commissions = relationship("AgentCommission", back_populates="user", cascade="all, delete-orphan")
