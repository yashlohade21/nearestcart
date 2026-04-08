# Dalla Deal Tracker — CLAUDE.md

## Project Overview

Business tool for agricultural middlemen (dalla/dalal) in India. Tracks deals, payments, advances, photo proof, and generates P&L reports.

## Tech Stack

- **Backend**: Python 3.10+ / FastAPI / SQLAlchemy 2.0 async / asyncpg / PostgreSQL 14
- **Web Dashboard**: Next.js 15 (App Router) / Tailwind CSS / TypeScript
- **Mobile App**: Expo (React Native) / expo-router / TypeScript
- **Database**: PostgreSQL (`dalla_deal_tracker`) — local, user `yash`

## Project Structure

```
nearkart/
├── backend/                 # FastAPI API server (port 8000)
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py    # Pydantic settings from .env
│   │   │   ├── database.py  # Async SQLAlchemy engine + session
│   │   │   ├── security.py  # JWT creation/verification, OTP (bypassed in dev)
│   │   │   └── deps.py      # get_current_user dependency
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── routers/         # API route handlers
│   │   └── services/        # Business logic helpers
│   ├── alembic/             # DB migrations (not yet used — schema.sql was applied directly)
│   ├── schema.sql           # Full PostgreSQL DDL (tables + views)
│   ├── requirements.txt
│   └── .env                 # Local config (DO NOT COMMIT)
├── web/                     # Next.js web dashboard (port 3000)
│   ├── app/
│   │   ├── (auth)/login/    # Phone + OTP login page
│   │   └── dashboard/       # Dashboard pages (deals, payments, farmers, buyers, reports)
│   └── lib/api.ts           # Axios client with Bearer token
├── app/                     # Expo React Native mobile app
│   ├── app/
│   │   ├── (auth)/          # Login flow
│   │   └── (tabs)/          # Home, New Deal, Payments, Profile
│   └── lib/api.ts           # Fetch client with SecureStore token
├── dalla-deal-tracker.md        # Full product spec and requirements
└── dalla-deal-tracker-db-schema.md  # Complete DB schema design
```

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
# DB already set up: psql -U yash -d dalla_deal_tracker
uvicorn app.main:app --reload --port 8000
```

### Web

```bash
cd web
npm install
npm run dev  # port 3000
```

### Mobile

```bash
cd app
npm install
npx expo start
```

## Database

- **Host**: localhost:5432
- **User**: yash
- **Database**: dalla_deal_tracker
- **12 tables**: users, farmers, buyers, products, transporters, deals, payments, advances, photos, mandi_rates, notifications, dalla_network_posts
- **6 views**: v_pending_from_buyers, v_pending_to_farmers, v_weekly_pnl, v_farmer_performance, v_buyer_performance, v_transporter_performance
- **Generated columns on deals table**: buy_total, sell_total, gross_margin, total_cost, net_profit (auto-computed by PostgreSQL)

## API Design

- All routes under `/api` prefix
- Auth: Phone OTP (bypassed in dev — any 6-digit code works)
- JWT Bearer token in Authorization header
- `get_current_user` dependency scopes all data to the logged-in dalla

### Key Endpoints

```
POST /api/auth/otp/send       # Send OTP (dev: returns "000000")
POST /api/auth/otp/verify     # Verify + get JWT (dev: any code works)

GET/POST   /api/deals         # List/create deals
GET/PATCH  /api/deals/:id     # Get/update deal
GET/POST   /api/farmers       # List/create farmers
GET/POST   /api/buyers        # List/create buyers
GET/POST   /api/products      # List/create products
GET/POST   /api/payments      # List/create payment records
GET        /api/payments/pending  # "Milna hai" + "Dena hai" summary
GET/POST   /api/advances      # Advance tracking
GET        /api/advances/active
GET        /api/dashboard/overview  # Today's stats
GET        /api/dashboard/weekly    # Weekly P&L
GET        /api/health
```

## Coding Rules

### Backend (Python)

- Use async/await everywhere — no sync DB calls
- All models use `DateTime(timezone=True)` for TIMESTAMPTZ columns
- Generated DB columns (buy_total, etc.) are NOT in SQLAlchemy models — use `@property` instead
- Pydantic schemas use `computed_field` for derived values
- Every query MUST filter by `user_id` — data is tenant-scoped
- Use `selectinload` for relationship eager loading
- Keep routers thin — business logic goes in services/

### Frontend (TypeScript)

- Web: `"use client"` directive on interactive components
- Mobile: `StyleSheet.create` for styling (no NativeWind configured yet)
- API calls go through `lib/api.ts` — never call fetch/axios directly
- Token stored in localStorage (web) or expo-secure-store (mobile)
- Color theme: emerald/green (#059669 primary, #f0fdf4 light bg)

### General

- Never commit `.env` files
- Never commit `node_modules/` or `__pycache__/`
- Indian Rupee formatting: `Intl.NumberFormat("en-IN")` or `₹` prefix
- Hindi/English bilingual UI terminology: "Milna hai" = receivable, "Dena hai" = payable
- All monetary amounts use DECIMAL/Numeric(14,2) — never float in DB
- UUIDs for all primary keys

## Domain Terminology

| Term             | Meaning                              |
| ---------------- | ------------------------------------ |
| Dalla/Dalal      | Agricultural middleman/broker        |
| Mandi            | Wholesale produce market             |
| Arthiya/Arhatiya | Commission agent (synonym for dalla) |
| Milna hai        | Money owed TO the dalla (receivable) |
| Dena hai         | Money the dalla OWES (payable)       |
| Khata            | Ledger/account book                  |
| Quintal          | 100 kg                               |

## Current Status (Dev)

- OTP bypassed — any 6-digit code works
- AWS S3 not configured — photo upload placeholder only
- WhatsApp integration not implemented yet
- Schema applied via schema.sql (not via alembic migrations)
