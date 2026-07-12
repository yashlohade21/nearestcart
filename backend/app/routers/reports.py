import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user, get_effective_user_id
from app.models import User, Deal, Payment, Advance, Farmer, Buyer, Product
from app.schemas.reports import (
    LedgerEntry, LedgerResponse,
    StockItem, StockRegisterResponse,
    DayBookDeal, DayBookPayment, DayBookSummary, DayBookResponse,
    OutstandingParty, OutstandingBuckets, OutstandingResponse,
    GstProductRow, GstReportResponse,
)

router = APIRouter(prefix="/reports", tags=["reports"])


# ── Ledger ──────────────────────────────────────────────

@router.get("/ledger", response_model=LedgerResponse)
async def get_ledger(
    party_type: str = Query(..., pattern="^(farmer|buyer)$"),
    party_id: uuid.UUID = Query(...),
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uid = get_effective_user_id(user)

    # Get party name
    if party_type == "farmer":
        party = await db.get(Farmer, party_id)
    else:
        party = await db.get(Buyer, party_id)
    party_name = party.name if party else "Unknown"

    entries: list[LedgerEntry] = []

    # Deals for this party
    deal_q = select(Deal).where(Deal.user_id == uid)
    if party_type == "farmer":
        deal_q = deal_q.where(Deal.farmer_id == party_id)
    else:
        deal_q = deal_q.where(Deal.buyer_id == party_id)
    if date_from:
        deal_q = deal_q.where(Deal.deal_date >= date_from)
    if date_to:
        deal_q = deal_q.where(Deal.deal_date <= date_to)

    deal_q = deal_q.options(selectinload(Deal.product))
    result = await db.execute(deal_q)
    deals = result.scalars().all()

    for d in deals:
        prod = d.product.name if d.product else "Product"
        if party_type == "farmer":
            # We owe farmer buy_total (credit to farmer = debit in our books)
            entries.append(LedgerEntry(
                date=d.deal_date,
                type="deal_buy",
                description=f"Purchase: {prod} {d.quantity} {d.unit} @ ₹{d.buy_rate}",
                debit=float(d.quantity) * float(d.buy_rate),
                credit=0,
            ))
        else:
            # Buyer owes us sell_total (debit to buyer)
            entries.append(LedgerEntry(
                date=d.deal_date,
                type="deal_sell",
                description=f"Sale: {prod} {d.quantity} {d.unit} @ ₹{d.sell_rate}",
                debit=float(d.quantity) * float(d.sell_rate),
                credit=0,
            ))

    # Payments for this party
    pay_q = select(Payment).where(Payment.user_id == uid)
    if party_type == "farmer":
        pay_q = pay_q.where(Payment.farmer_id == party_id)
    else:
        pay_q = pay_q.where(Payment.buyer_id == party_id)
    if date_from:
        pay_q = pay_q.where(Payment.payment_date >= date_from)
    if date_to:
        pay_q = pay_q.where(Payment.payment_date <= date_to)

    result = await db.execute(pay_q)
    payments = result.scalars().all()

    for p in payments:
        mode = f" ({p.payment_mode})" if p.payment_mode else ""
        if p.direction == "outgoing":
            entries.append(LedgerEntry(
                date=p.payment_date,
                type="payment_out",
                description=f"Payment made{mode}",
                debit=0,
                credit=float(p.amount),
            ))
        else:
            entries.append(LedgerEntry(
                date=p.payment_date,
                type="payment_in",
                description=f"Payment received{mode}",
                debit=0,
                credit=float(p.amount),
            ))

    # Advances (only for farmers)
    if party_type == "farmer":
        adv_q = select(Advance).where(
            Advance.user_id == uid,
            Advance.farmer_id == party_id,
        )
        if date_from:
            adv_q = adv_q.where(Advance.given_date >= date_from)
        if date_to:
            adv_q = adv_q.where(Advance.given_date <= date_to)
        result = await db.execute(adv_q)
        advances = result.scalars().all()
        for a in advances:
            entries.append(LedgerEntry(
                date=a.given_date,
                type="advance",
                description=f"Advance given: {a.purpose or 'General'}",
                debit=float(a.amount),
                credit=0,
            ))

    # Sort by date
    entries.sort(key=lambda e: e.date)

    # Compute running balance
    total_debit = 0.0
    total_credit = 0.0
    balance = 0.0
    for e in entries:
        balance += e.debit - e.credit
        e.running_balance = round(balance, 2)
        total_debit += e.debit
        total_credit += e.credit

    return LedgerResponse(
        party_name=party_name,
        party_type=party_type,
        opening_balance=0,
        entries=entries,
        closing_balance=round(balance, 2),
        total_debit=round(total_debit, 2),
        total_credit=round(total_credit, 2),
    )


# ── Stock Register ──────────────────────────────────────

@router.get("/stock", response_model=StockRegisterResponse)
async def get_stock_register(
    product_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uid = get_effective_user_id(user)

    q = (
        select(
            Deal.product_id,
            Product.name.label("product_name"),
            Product.unit,
            Product.hsn_code,
            func.sum(Deal.quantity).label("total_purchased_qty"),
            func.sum(Deal.quantity - Deal.spoilage_qty).label("total_sold_qty"),
            func.sum(Deal.spoilage_qty).label("total_spoilage"),
            func.sum(Deal.quantity * Deal.buy_rate).label("purchase_value"),
            func.sum(Deal.quantity * Deal.sell_rate).label("sale_value"),
        )
        .join(Product, Deal.product_id == Product.id)
        .where(Deal.user_id == uid)
        .group_by(Deal.product_id, Product.name, Product.unit, Product.hsn_code)
    )

    if product_id:
        q = q.where(Deal.product_id == product_id)
    if date_from:
        q = q.where(Deal.deal_date >= date_from)
    if date_to:
        q = q.where(Deal.deal_date <= date_to)

    result = await db.execute(q)
    rows = result.all()

    items = []
    total_pv = 0.0
    total_sv = 0.0
    total_m = 0.0

    for r in rows:
        pv = float(r.purchase_value or 0)
        sv = float(r.sale_value or 0)
        m = sv - pv
        spoilage = float(r.total_spoilage or 0)
        purchased = float(r.total_purchased_qty or 0)
        sold = float(r.total_sold_qty or 0)
        items.append(StockItem(
            product_id=r.product_id,
            product_name=r.product_name,
            unit=r.unit,
            hsn_code=r.hsn_code,
            total_purchased_qty=purchased,
            total_sold_qty=sold,
            total_spoilage=spoilage,
            net_stock=round(purchased - sold - spoilage, 2),
            purchase_value=round(pv, 2),
            sale_value=round(sv, 2),
            margin=round(m, 2),
        ))
        total_pv += pv
        total_sv += sv
        total_m += m

    return StockRegisterResponse(
        items=items,
        total_purchase_value=round(total_pv, 2),
        total_sale_value=round(total_sv, 2),
        total_margin=round(total_m, 2),
    )


# ── Day Book ────────────────────────────────────────────

@router.get("/daybook", response_model=DayBookResponse)
async def get_daybook(
    date: date = Query(default_factory=date.today),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uid = get_effective_user_id(user)

    # Deals for the day
    deal_q = (
        select(Deal)
        .where(Deal.user_id == uid, Deal.deal_date == date)
        .options(
            selectinload(Deal.farmer),
            selectinload(Deal.buyer),
            selectinload(Deal.product),
        )
    )
    result = await db.execute(deal_q)
    deals = result.scalars().all()

    deal_items = []
    total_purchases = 0.0
    total_sales = 0.0

    for d in deals:
        bt = float(d.quantity) * float(d.buy_rate)
        st = float(d.quantity) * float(d.sell_rate)
        costs = float(d.transport_cost) + float(d.labour_cost) + float(d.other_cost)
        np = st - bt - costs
        deal_items.append(DayBookDeal(
            id=d.id,
            deal_date=d.deal_date,
            farmer_name=d.farmer.name if d.farmer else None,
            buyer_name=d.buyer.name if d.buyer else None,
            product_name=d.product.name if d.product else None,
            quantity=float(d.quantity),
            unit=d.unit,
            buy_rate=float(d.buy_rate),
            sell_rate=float(d.sell_rate),
            buy_total=round(bt, 2),
            sell_total=round(st, 2),
            net_profit=round(np, 2),
        ))
        total_purchases += bt
        total_sales += st

    # Payments for the day
    pay_q = (
        select(Payment)
        .where(Payment.user_id == uid, Payment.payment_date == date)
    )
    result = await db.execute(pay_q)
    payments = result.scalars().all()

    pay_items = []
    total_receipts = 0.0
    total_payments_out = 0.0

    for p in payments:
        # Resolve party name
        pname = None
        if p.buyer_id:
            buyer = await db.get(Buyer, p.buyer_id)
            pname = buyer.name if buyer else None
        elif p.farmer_id:
            farmer = await db.get(Farmer, p.farmer_id)
            pname = farmer.name if farmer else None

        pay_items.append(DayBookPayment(
            id=p.id,
            payment_date=p.payment_date,
            direction=p.direction,
            party_name=pname,
            amount=float(p.amount),
            payment_mode=p.payment_mode,
            reference_no=p.reference_no,
        ))

        if p.direction == "incoming":
            total_receipts += float(p.amount)
        else:
            total_payments_out += float(p.amount)

    summary = DayBookSummary(
        total_purchases=round(total_purchases, 2),
        total_sales=round(total_sales, 2),
        total_receipts=round(total_receipts, 2),
        total_payments_out=round(total_payments_out, 2),
        net_cash_flow=round(total_receipts - total_payments_out, 2),
    )

    return DayBookResponse(
        date=date,
        deals=deal_items,
        payments=pay_items,
        summary=summary,
    )


# ── Outstanding ─────────────────────────────────────────

@router.get("/outstanding", response_model=OutstandingResponse)
async def get_outstanding(
    type: str = Query("receivable", pattern="^(receivable|payable)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uid = get_effective_user_id(user)
    today = date.today()

    if type == "receivable":
        # Buyers who owe us: deals where buyer_payment_status != 'paid'
        q = (
            select(Deal)
            .where(
                Deal.user_id == uid,
                Deal.buyer_payment_status != "paid",
            )
            .options(selectinload(Deal.buyer))
        )
        result = await db.execute(q)
        deals = result.scalars().all()

        party_map: dict[uuid.UUID, OutstandingParty] = {}
        for d in deals:
            if not d.buyer_id or not d.buyer:
                continue
            outstanding = (float(d.quantity) * float(d.sell_rate)) - float(d.buyer_received_amount)
            if outstanding <= 0:
                continue

            days = (today - d.deal_date).days if d.deal_date else 0

            if d.buyer_id not in party_map:
                party_map[d.buyer_id] = OutstandingParty(
                    party_id=d.buyer_id,
                    party_name=d.buyer.name,
                    party_phone=d.buyer.phone if hasattr(d.buyer, 'phone') else None,
                )

            p = party_map[d.buyer_id]
            p.total_outstanding += outstanding
            if days < 30:
                p.current += outstanding
            elif days < 60:
                p.days_30_60 += outstanding
            elif days < 90:
                p.days_60_90 += outstanding
            else:
                p.days_90_plus += outstanding

    else:
        # We owe farmers: deals where farmer_payment_status != 'paid'
        q = (
            select(Deal)
            .where(
                Deal.user_id == uid,
                Deal.farmer_payment_status != "paid",
            )
            .options(selectinload(Deal.farmer))
        )
        result = await db.execute(q)
        deals = result.scalars().all()

        party_map = {}
        for d in deals:
            if not d.farmer_id or not d.farmer:
                continue
            outstanding = (float(d.quantity) * float(d.buy_rate)) - float(d.farmer_paid_amount)
            if outstanding <= 0:
                continue

            days = (today - d.deal_date).days if d.deal_date else 0

            if d.farmer_id not in party_map:
                party_map[d.farmer_id] = OutstandingParty(
                    party_id=d.farmer_id,
                    party_name=d.farmer.name,
                    party_phone=d.farmer.phone if hasattr(d.farmer, 'phone') else None,
                )

            p = party_map[d.farmer_id]
            p.total_outstanding += outstanding
            if days < 30:
                p.current += outstanding
            elif days < 60:
                p.days_30_60 += outstanding
            elif days < 90:
                p.days_60_90 += outstanding
            else:
                p.days_90_plus += outstanding

    parties = sorted(party_map.values(), key=lambda x: x.total_outstanding, reverse=True)

    # Round all values
    for p in parties:
        p.total_outstanding = round(p.total_outstanding, 2)
        p.current = round(p.current, 2)
        p.days_30_60 = round(p.days_30_60, 2)
        p.days_60_90 = round(p.days_60_90, 2)
        p.days_90_plus = round(p.days_90_plus, 2)

    buckets = OutstandingBuckets(
        current=round(sum(p.current for p in parties), 2),
        days_30_60=round(sum(p.days_30_60 for p in parties), 2),
        days_60_90=round(sum(p.days_60_90 for p in parties), 2),
        days_90_plus=round(sum(p.days_90_plus for p in parties), 2),
    )

    return OutstandingResponse(
        type=type,
        total=round(sum(p.total_outstanding for p in parties), 2),
        buckets=buckets,
        parties=parties,
    )


# ── GST Report ──────────────────────────────────────────

@router.get("/gst", response_model=GstReportResponse)
async def get_gst_report(
    date_from: date = Query(...),
    date_to: date = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uid = get_effective_user_id(user)

    q = (
        select(
            Deal.product_id,
            Product.name.label("product_name"),
            Product.hsn_code,
            Product.unit,
            func.count(Deal.id).label("deals_count"),
            func.sum(Deal.quantity).label("total_qty"),
            func.sum(Deal.quantity * Deal.buy_rate).label("purchase_value"),
            func.sum(Deal.quantity * Deal.sell_rate).label("sale_value"),
        )
        .join(Product, Deal.product_id == Product.id)
        .where(
            Deal.user_id == uid,
            Deal.deal_date >= date_from,
            Deal.deal_date <= date_to,
        )
        .group_by(Deal.product_id, Product.name, Product.hsn_code, Product.unit)
    )

    result = await db.execute(q)
    rows = result.all()

    products = []
    total_purchases = 0.0
    total_sales = 0.0
    total_deals = 0

    for r in rows:
        pv = float(r.purchase_value or 0)
        sv = float(r.sale_value or 0)
        products.append(GstProductRow(
            product_id=r.product_id,
            product_name=r.product_name,
            hsn_code=r.hsn_code,
            quantity=float(r.total_qty or 0),
            unit=r.unit,
            purchase_value=round(pv, 2),
            sale_value=round(sv, 2),
            margin=round(sv - pv, 2),
        ))
        total_purchases += pv
        total_sales += sv
        total_deals += r.deals_count

    return GstReportResponse(
        period_start=date_from,
        period_end=date_to,
        total_sales=round(total_sales, 2),
        total_purchases=round(total_purchases, 2),
        gross_profit=round(total_sales - total_purchases, 2),
        deals_count=total_deals,
        by_product=products,
    )
