import csv
import io
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.deal import Deal
from app.models.user import User

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/deals/csv")
async def export_deals_csv(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Deal)
        .options(selectinload(Deal.farmer), selectinload(Deal.buyer), selectinload(Deal.product))
        .where(Deal.user_id == user.id)
        .order_by(Deal.deal_date.desc())
    )
    if date_from:
        query = query.where(Deal.deal_date >= date_from)
    if date_to:
        query = query.where(Deal.deal_date <= date_to)

    result = await db.execute(query)
    deals = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Farmer", "Buyer", "Product", "Qty", "Unit",
        "Buy Rate", "Sell Rate", "Buy Total", "Sell Total",
        "Transport", "Labour", "Other Cost", "Net Profit", "Status",
    ])
    for d in deals:
        buy_total = float(d.quantity) * float(d.buy_rate)
        sell_total = float(d.quantity) * float(d.sell_rate) if d.sell_rate else 0
        net = sell_total - buy_total - float(d.transport_cost or 0) - float(d.labour_cost or 0) - float(d.other_cost or 0)
        writer.writerow([
            str(d.deal_date),
            d.farmer.name if d.farmer else "",
            d.buyer.name if d.buyer else "",
            d.product.name if d.product else "",
            float(d.quantity), d.unit,
            float(d.buy_rate), float(d.sell_rate) if d.sell_rate else 0,
            round(buy_total, 2), round(sell_total, 2),
            float(d.transport_cost or 0), float(d.labour_cost or 0), float(d.other_cost or 0),
            round(net, 2), d.status,
        ])

    output.seek(0)
    filename = f"deals_{date.today().isoformat()}.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/deals/excel")
async def export_deals_excel(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Deal)
        .options(selectinload(Deal.farmer), selectinload(Deal.buyer), selectinload(Deal.product))
        .where(Deal.user_id == user.id)
        .order_by(Deal.deal_date.desc())
    )
    if date_from:
        query = query.where(Deal.deal_date >= date_from)
    if date_to:
        query = query.where(Deal.deal_date <= date_to)

    result = await db.execute(query)
    deals = result.scalars().all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Deals"
    headers = [
        "Date", "Farmer", "Buyer", "Product", "Qty", "Unit",
        "Buy Rate", "Sell Rate", "Buy Total", "Sell Total",
        "Transport", "Labour", "Other Cost", "Net Profit", "Status",
    ]
    ws.append(headers)

    for d in deals:
        buy_total = float(d.quantity) * float(d.buy_rate)
        sell_total = float(d.quantity) * float(d.sell_rate) if d.sell_rate else 0
        net = sell_total - buy_total - float(d.transport_cost or 0) - float(d.labour_cost or 0) - float(d.other_cost or 0)
        ws.append([
            str(d.deal_date),
            d.farmer.name if d.farmer else "",
            d.buyer.name if d.buyer else "",
            d.product.name if d.product else "",
            float(d.quantity), d.unit,
            float(d.buy_rate), float(d.sell_rate) if d.sell_rate else 0,
            round(buy_total, 2), round(sell_total, 2),
            float(d.transport_cost or 0), float(d.labour_cost or 0), float(d.other_cost or 0),
            round(net, 2), d.status,
        ])

    # Auto-size columns
    for col in ws.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 25)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"deals_{date.today().isoformat()}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/pnl/pdf")
async def export_pnl_pdf(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not date_from:
        date_from = date.today().replace(day=1)
    if not date_to:
        date_to = date.today()

    result = await db.execute(
        select(
            func.count().label("count"),
            func.coalesce(func.sum(Deal.quantity * Deal.buy_rate), 0).label("bought"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("sold"),
            func.coalesce(func.sum(Deal.quantity * (Deal.sell_rate - Deal.buy_rate)), 0).label("gross"),
            func.coalesce(func.sum(Deal.transport_cost + Deal.labour_cost + Deal.other_cost), 0).label("costs"),
            func.coalesce(func.sum(
                Deal.quantity * (Deal.sell_rate - Deal.buy_rate)
                - Deal.transport_cost - Deal.labour_cost - Deal.other_cost
            ), 0).label("net"),
        ).where(
            Deal.user_id == user.id,
            Deal.deal_date >= date_from,
            Deal.deal_date <= date_to,
        )
    )
    row = result.one()

    # Build PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph(f"Profit & Loss Report", styles["Title"]))
    business_name = user.business_name or user.name
    elements.append(Paragraph(f"{business_name}", styles["Heading2"]))
    elements.append(Paragraph(f"Period: {date_from} to {date_to}", styles["Normal"]))
    elements.append(Spacer(1, 10 * mm))

    def fmt(val):
        return f"₹{abs(float(val)):,.2f}"

    data = [
        ["Metric", "Amount"],
        ["Total Deals", str(row.count)],
        ["Total Purchased", fmt(row.bought)],
        ["Total Sold", fmt(row.sold)],
        ["Gross Margin", fmt(row.gross)],
        ["Total Costs", fmt(row.costs)],
        ["Net Profit", fmt(row.net)],
    ]

    table = Table(data, colWidths=[200, 150])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#059669")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 10 * mm))
    elements.append(Paragraph(f"Generated by Dalla Deal Tracker", styles["Italic"]))

    doc.build(elements)
    buffer.seek(0)

    filename = f"pnl_{date_from}_{date_to}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
