from datetime import date

from pydantic import BaseModel

from app.schemas.payment import PendingPaymentSummary


class DashboardOverview(BaseModel):
    today_deals: int
    today_buy_total: float
    today_sell_total: float
    today_net_profit: float
    pending_from_buyers: float  # mujhe milna hai
    pending_to_farmers: float  # mujhe dena hai
    net_position: float
    active_advances: float


class WeeklyPnL(BaseModel):
    week_start: date
    week_end: date
    total_deals: int
    total_bought: float
    total_sold: float
    gross_margin: float
    total_costs: float
    net_profit: float
    total_spoilage_qty: float
    avg_spoilage_pct: float


class PendingPayments(BaseModel):
    from_buyers: list[PendingPaymentSummary]
    to_farmers: list[PendingPaymentSummary]
    total_from_buyers: float
    total_to_farmers: float
    net_position: float
