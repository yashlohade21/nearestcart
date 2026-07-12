import uuid
from datetime import date

from pydantic import BaseModel


# ── Ledger ──────────────────────────────────────────────

class LedgerEntry(BaseModel):
    date: date
    type: str  # "deal_buy" | "deal_sell" | "payment_in" | "payment_out" | "advance"
    description: str
    debit: float = 0
    credit: float = 0
    running_balance: float = 0


class LedgerResponse(BaseModel):
    party_name: str
    party_type: str
    opening_balance: float = 0
    entries: list[LedgerEntry] = []
    closing_balance: float = 0
    total_debit: float = 0
    total_credit: float = 0


# ── Stock Register ──────────────────────────────────────

class StockItem(BaseModel):
    product_id: uuid.UUID
    product_name: str
    unit: str
    hsn_code: str | None = None
    total_purchased_qty: float = 0
    total_sold_qty: float = 0
    total_spoilage: float = 0
    net_stock: float = 0
    purchase_value: float = 0
    sale_value: float = 0
    margin: float = 0


class StockRegisterResponse(BaseModel):
    items: list[StockItem] = []
    total_purchase_value: float = 0
    total_sale_value: float = 0
    total_margin: float = 0


# ── Day Book ────────────────────────────────────────────

class DayBookDeal(BaseModel):
    id: uuid.UUID
    deal_date: date
    farmer_name: str | None = None
    buyer_name: str | None = None
    product_name: str | None = None
    quantity: float
    unit: str
    buy_rate: float
    sell_rate: float
    buy_total: float
    sell_total: float
    net_profit: float


class DayBookPayment(BaseModel):
    id: uuid.UUID
    payment_date: date
    direction: str
    party_name: str | None = None
    amount: float
    payment_mode: str | None = None
    reference_no: str | None = None


class DayBookSummary(BaseModel):
    total_purchases: float = 0
    total_sales: float = 0
    total_receipts: float = 0
    total_payments_out: float = 0
    net_cash_flow: float = 0


class DayBookResponse(BaseModel):
    date: date
    deals: list[DayBookDeal] = []
    payments: list[DayBookPayment] = []
    summary: DayBookSummary = DayBookSummary()


# ── Outstanding ─────────────────────────────────────────

class OutstandingParty(BaseModel):
    party_id: uuid.UUID
    party_name: str
    party_phone: str | None = None
    total_outstanding: float = 0
    current: float = 0
    days_30_60: float = 0
    days_60_90: float = 0
    days_90_plus: float = 0


class OutstandingBuckets(BaseModel):
    current: float = 0
    days_30_60: float = 0
    days_60_90: float = 0
    days_90_plus: float = 0


class OutstandingResponse(BaseModel):
    type: str  # "receivable" | "payable"
    total: float = 0
    buckets: OutstandingBuckets = OutstandingBuckets()
    parties: list[OutstandingParty] = []


# ── GST Report ──────────────────────────────────────────

class GstProductRow(BaseModel):
    product_id: uuid.UUID
    product_name: str
    hsn_code: str | None = None
    quantity: float = 0
    unit: str = "kg"
    purchase_value: float = 0
    sale_value: float = 0
    margin: float = 0


class GstReportResponse(BaseModel):
    period_start: date
    period_end: date
    total_sales: float = 0
    total_purchases: float = 0
    gross_profit: float = 0
    deals_count: int = 0
    by_product: list[GstProductRow] = []
