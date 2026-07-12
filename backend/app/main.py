import asyncio
import os
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.background import run_scheduled_tasks
from app.core.config import settings
from app.routers import (
    auth, deals, farmers, buyers, payments, advances, dashboard, products,
    files, transporters, export, notifications, analytics, mandi_rates,
    audit, voice, agents, bank_accounts, reports, admin,
    # Mandi trading & accounting routers
    companies, cash_book, bank_transactions, expenses, purchases, sales,
    purchase_payments, sale_payments, farmer_entries, farmer_sales,
    farmer_payments_new, nave_bills, agent_commissions, stock_ledger,
    vehicles, delivery_places, kharidars,
)

# Initialize Sentry if DSN is configured
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        environment="production" if not settings.DEV_MODE else "development",
    )

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(run_scheduled_tasks())
    yield
    task.cancel()


app = FastAPI(
    title="Dalla Deal Tracker",
    description="Deal tracking, payments, and proof management",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )

# CORS — parse origins from config
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(farmers.router, prefix="/api")
app.include_router(buyers.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(advances.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(transporters.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(mandi_rates.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(bank_accounts.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# Mandi trading & accounting routers
app.include_router(companies.router, prefix="/api")
app.include_router(cash_book.router, prefix="/api")
app.include_router(bank_transactions.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(purchases.router, prefix="/api")
app.include_router(sales.router, prefix="/api")
app.include_router(purchase_payments.router, prefix="/api")
app.include_router(sale_payments.router, prefix="/api")
app.include_router(farmer_entries.router, prefix="/api")
app.include_router(farmer_sales.router, prefix="/api")
app.include_router(farmer_payments_new.router, prefix="/api")
app.include_router(nave_bills.router, prefix="/api")
app.include_router(agent_commissions.router, prefix="/api")
app.include_router(stock_ledger.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(delivery_places.router, prefix="/api")
app.include_router(kharidars.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


os.makedirs("uploads/logos", exist_ok=True)
os.makedirs("uploads/files", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
