# Dalla Deal Tracker — CLAUDE.md

## Project Overview

Business tool for agricultural middlemen (dalla/dalal) in India. Tracks deals, payments, advances, photo proof, and generates P&L reports.

## Tech Stack

- **Backend**: Java 17 / Spring Boot 3.3 / Spring Data JPA / PostgreSQL 14
- **Web Dashboard**: Next.js 15 (App Router) / Tailwind CSS / TypeScript
- **Mobile App**: Expo (React Native) / expo-router / TypeScript
- **Database**: PostgreSQL (`dalla_deal_tracker`) — local, user `yash`

## Project Structure

```
nearkart/
├── backend-spring/              # Spring Boot API server (port 8080)
│   ├── pom.xml                  # Maven build
│   ├── src/main/java/com/nearkart/
│   │   ├── NearkartApplication.java  # @SpringBootApplication entry
│   │   ├── config/              # SecurityConfig, CorsConfig, JacksonConfig, GlobalExceptionHandler
│   │   ├── security/            # JwtUtil, JwtAuthFilter, OtpService, UserPrincipal
│   │   ├── entity/              # 35 JPA @Entity classes
│   │   ├── repository/          # 35 Spring Data JPA repositories
│   │   ├── dto/                 # ~88 Request/Response DTOs
│   │   └── controller/          # 31 @RestController classes
│   └── src/main/resources/
│       └── application.yml      # DB, JWT, server config
├── web/                         # Next.js web dashboard (port 3000)
│   ├── app/
│   │   ├── (auth)/login/        # Phone + OTP login page
│   │   └── dashboard/           # Dashboard pages
│   └── lib/api.ts               # Axios client with Bearer token (→ port 8080)
├── app/                         # Expo React Native mobile app
│   ├── app/
│   │   ├── (auth)/              # Login flow
│   │   └── (tabs)/              # Home, New Deal, Payments, Profile
│   └── lib/api.ts               # Fetch client with SecureStore token (→ port 8080)
├── dalla-deal-tracker.md        # Full product spec and requirements
└── dalla-deal-tracker-db-schema.md  # Complete DB schema design
```

## Running Locally

### Backend

```bash
cd backend-spring
mvn spring-boot:run  # port 8080
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
- **Tables**: users, farmers, buyers, products, transporters, deals, payments, advances, photos, mandi_rates, notifications, dalla_network_posts, companies, agents, bank_accounts, cash_entries, bank_transactions, expenses, purchase_entries, sale_entries, purchase_payments, sale_payments, farmer_entries, farmer_sales, farmer_payment_records, nave_bills, nave_bill_items, nave_bill_details, agent_commissions, stock_ledger, vehicles, delivery_places, kharidars, files, audit_logs
- **Generated columns on deals table**: buy_total, sell_total, gross_margin, total_cost, net_profit (auto-computed by PostgreSQL)

## API Design

- All routes under `/api` prefix
- Auth: Phone OTP (dev bypass code "888888")
- JWT Bearer token (HS256, 7-day expiry) in Authorization header
- `UserPrincipal.getEffectiveUserId()` scopes all data to the logged-in dalla
- JSON uses snake_case (Jackson config)

### Key Endpoints

```
POST /api/auth/otp/send       # Send OTP
POST /api/auth/otp/verify     # Verify + get JWT
GET  /api/auth/profile        # Current user profile

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

### Backend (Java/Spring Boot)

- JPA entities use `@GeneratedValue(strategy = GenerationType.UUID)` for UUID PKs
- `BigDecimal(precision=14, scale=2)` for all monetary fields — never float/double
- `OffsetDateTime` for TIMESTAMPTZ columns with `@PrePersist`/`@PreUpdate` lifecycle hooks
- Every query MUST filter by `userId` — data is tenant-scoped
- Use `@ManyToOne(fetch = LAZY)` for relationships
- Keep controllers thin — business logic in services when complex
- `ResponseStatusException(HttpStatus.NOT_FOUND)` for missing entities
- Soft deletes (`isActive = false`) for master data, hard deletes for transactions
- Deal computed columns mapped with `insertable = false, updatable = false`

### Frontend (TypeScript)

- Web: `"use client"` directive on interactive components
- Mobile: `StyleSheet.create` for styling (no NativeWind configured yet)
- API calls go through `lib/api.ts` — never call fetch/axios directly
- Token stored in localStorage (web) or expo-secure-store (mobile)
- Color theme: emerald/green (#059669 primary, #f0fdf4 light bg)

### General

- Never commit `.env` files
- Never commit `node_modules/` or `target/`
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

- OTP dev bypass code: "888888"
- AWS S3 not configured — photo upload placeholder only
- WhatsApp integration not implemented yet
- Report endpoints are stubs (return empty data)
