import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    name_local: Mapped[str | None] = mapped_column(String(100))
    category: Mapped[str | None] = mapped_column(String(50))
    unit: Mapped[str] = mapped_column(String(20), default="kg")
    hsn_code: Mapped[str | None] = mapped_column(String(8))
    purchase_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    selling_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    min_stock: Mapped[float | None] = mapped_column(Numeric(10, 2), default=0)
    current_stock: Mapped[float | None] = mapped_column(Numeric(10, 2), default=0)
    product_name_marathi: Mapped[str | None] = mapped_column(String(100))
    gst_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    is_perishable: Mapped[bool] = mapped_column(Boolean, default=True)
    avg_spoilage_pct: Mapped[float | None] = mapped_column(Numeric(5, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="products")
    deals = relationship("Deal", back_populates="product")
    farmer_entries = relationship("FarmerEntry", back_populates="product")
    nave_bill_items = relationship("NaveBillItem", back_populates="product")
    purchase_entries = relationship("PurchaseEntry", back_populates="product")
    sale_entries = relationship("SaleEntry", back_populates="product")
    stock_ledger_entries = relationship("StockLedger", back_populates="product")
