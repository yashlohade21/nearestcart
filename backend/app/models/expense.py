import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)

    expense_date: Mapped[date] = mapped_column(Date, default=date.today)
    category: Mapped[str | None] = mapped_column(String(100))
    narration: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    payment_mode: Mapped[str | None] = mapped_column(String(20))  # cash / bank / cheque
    bank_account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("bank_accounts.id"), index=True)
    cheque_no: Mapped[str | None] = mapped_column(String(30))
    party_name: Mapped[str | None] = mapped_column(String(200))
    farmer_bill_ref: Mapped[str | None] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="expenses")
    company = relationship("Company", back_populates="expenses")
    bank_account = relationship("BankAccount", back_populates="expenses")
