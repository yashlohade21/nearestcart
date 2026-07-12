import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    bank_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("bank_accounts.id"), index=True)

    txn_date: Mapped[date] = mapped_column(Date, default=date.today)
    type: Mapped[str] = mapped_column(String(20))  # deposit / withdrawal / transfer
    amount: Mapped[float] = mapped_column(Numeric(14, 2))
    party_name: Mapped[str | None] = mapped_column(String(200))
    cheque_no: Mapped[str | None] = mapped_column(String(30))
    cheque_date: Mapped[date | None] = mapped_column(Date)
    narration: Mapped[str | None] = mapped_column(Text)
    reconciled: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="bank_transactions")
    company = relationship("Company", back_populates="bank_transactions")
    bank_account = relationship("BankAccount", back_populates="bank_transactions")
