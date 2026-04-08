# Dalla Deal Tracker — Project Setup Plan

## Overview
Set up a monorepo with 3 packages: **backend** (FastAPI), **web** (Next.js), **app** (Expo React Native). Focus on Phase 1 MVP — "Mera Khata".

---

## Step 1: Clean up & create project structure

Remove deleted/stale git files and create:
```
nearkart/
├── backend/          # FastAPI + PostgreSQL
├── web/              # Next.js dashboard
├── app/              # Expo React Native mobile
├── dalla-deal-tracker.md
├── dalla-deal-tracker-db-schema.md
└── README.md
```

## Step 2: Backend (FastAPI)

Create the FastAPI backend with this structure:
```
backend/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── core/
│   │   ├── config.py        # Settings (DB URL, secrets, etc.)
│   │   ├── database.py      # SQLAlchemy async engine + session
│   │   └── security.py      # JWT token creation/verification
│   ├── models/               # SQLAlchemy ORM models (from DB schema doc)
│   │   ├── user.py
│   │   ├── farmer.py
│   │   ├── buyer.py
│   │   ├── product.py
│   │   ├── deal.py
│   │   ├── payment.py
│   │   ├── advance.py
│   │   ├── photo.py
│   │   └── transporter.py
│   ├── schemas/              # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── deal.py
│   │   ├── farmer.py
│   │   ├── buyer.py
│   │   ├── payment.py
│   │   ├── advance.py
│   │   └── dashboard.py
│   ├── routers/              # API route handlers
│   │   ├── auth.py           # OTP send/verify, JWT
│   │   ├── deals.py          # CRUD deals
│   │   ├── farmers.py        # CRUD farmers
│   │   ├── buyers.py         # CRUD buyers
│   │   ├── payments.py       # Record/list payments
│   │   ├── advances.py       # Advance tracking
│   │   ├── dashboard.py      # Weekly/monthly P&L, pending summary
│   │   └── sync.py           # Batch sync from mobile
│   └── services/             # Business logic
│       └── calculations.py   # Margin, P&L computations
├── alembic/                  # DB migrations
│   └── env.py
├── alembic.ini
├── requirements.txt
└── .env.example
```

**Key decisions:**
- SQLAlchemy 2.0 async with asyncpg
- Alembic for migrations
- JWT auth (phone + OTP)
- All models match the DB schema doc exactly

## Step 3: Web (Next.js)

```
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing / redirect to dashboard
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Sidebar + header
│   │   ├── page.tsx          # Overview dashboard
│   │   ├── deals/page.tsx    # Deal list + create
│   │   ├── payments/page.tsx # Payment tracker
│   │   ├── farmers/page.tsx
│   │   ├── buyers/page.tsx
│   │   └── reports/page.tsx  # P&L, export
│   └── globals.css
├── lib/
│   └── api.ts                # API client (fetch wrapper)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

**Key decisions:**
- Next.js 15 App Router
- Tailwind CSS for styling
- shadcn/ui components

## Step 4: Mobile App (Expo React Native)

```
app/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx             # Splash / auth redirect
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── otp-verify.tsx
│   └── (tabs)/
│       ├── _layout.tsx       # Bottom tab navigator
│       ├── index.tsx         # Home — today's deals + quick stats
│       ├── deals/
│       │   ├── index.tsx     # Deal list
│       │   └── new.tsx       # New deal form
│       ├── payments.tsx      # "Milna hai / Dena hai" screen
│       └── profile.tsx       # Settings
├── components/
│   └── ui/                   # Reusable components
├── lib/
│   ├── api.ts                # API client
│   └── storage.ts            # SQLite local storage
├── app.json
├── package.json
└── tsconfig.json
```

**Key decisions:**
- Expo SDK 53 with expo-router
- NativeWind (Tailwind for RN)
- expo-sqlite for offline storage

## Step 5: Implementation Order

We'll build in this order:
1. **Backend models + migrations** — set up all DB tables
2. **Backend auth routes** — OTP + JWT
3. **Backend CRUD routes** — deals, farmers, buyers, payments, advances
4. **Backend dashboard routes** — P&L, pending payments
5. **Web app scaffold** — Next.js with auth + dashboard layout
6. **Web deal management** — create/list deals, payments
7. **Mobile app scaffold** — Expo with auth flow
8. **Mobile deal entry** — the core 30-second deal form
9. **Mobile payment tracker** — milna hai / dena hai

## What gets built now (this session)

I'll set up all 3 projects with proper scaffolding:
- Backend: FastAPI app with all models, schemas, routers (fully functional)
- Web: Next.js with dashboard layout and pages (scaffold)
- App: Expo with tab navigation and auth flow (scaffold)

This gives you a working backend you can run immediately, and frontend scaffolds ready for UI work.
