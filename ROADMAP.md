# Dalla Deal Tracker — Enterprise Roadmap

> Current state: Core deal-entry → P&L → pending payments → invoice generation works end-to-end on web + mobile (~55% of product spec).

---

## Tier 1 — Must-Have (Complete the Core Loop)

These are gaps users will hit in the first week of real usage.

| # | Feature | What's Missing | Backend | Frontend |
|---|---------|---------------|---------|----------|
| 1 | **Payment Recording UI** | `POST /payments` API exists but no form anywhere to record a payment against a deal | ✅ Done | ❌ Missing |
| 2 | **Advance Management UI** | Backend CRUD exists, zero frontend — can't create, view, or recover advances | ✅ Done | ❌ Missing |
| 3 | **Delete Operations** | No soft-delete for deals, farmers, buyers, products — users stuck with bad data | ❌ Missing | ❌ Missing |
| 4 | **Deal Editing (Mobile)** | Can only "Mark Complete" — no way to fix a wrong rate or quantity after creation | Partial | ❌ Missing |
| 5 | **Farmer/Buyer Detail + Ledger** | No per-party deal history, payment ledger, or outstanding balance view | ❌ Missing | ❌ Missing |
| 6 | **Search & Filter** | Web deals/farmers/buyers have no search bar; mobile only has inventory search | N/A | ❌ Missing |
| 7 | **Pagination (Web)** | All web pages load every record at once — breaks at 500+ deals | N/A | ❌ Missing |
| 8 | **Weekly P&L (Mobile)** | Menu item exists but `onPress` is empty — just a TODO stub | ✅ Done | ❌ Missing |

---

## Tier 2 — Enterprise Essentials

Features that separate a personal tool from a business product.

| # | Feature | What's Missing | Effort |
|---|---------|---------------|--------|
| 9 | **Photo Proof / Camera** | DB table + model exist, zero API endpoints, no camera/upload UI — deal proof is a core trust feature | Medium |
| 10 | **Data Export (CSV/Excel/PDF)** | No monthly P&L export, no GST-ready report, no bulk deal download — accountants need this | Medium |
| 11 | **Real SMS OTP** | Currently any 6-digit code works — need MSG91 or Twilio for production auth | Medium |
| 12 | **WhatsApp Integration** | Completely absent — payment reminders, daily deal summaries, deal confirmations via Meta Business API | Large |
| 13 | **Role-Based Access (RBAC)** | Single-user only — no munshi/assistant accounts, no read-only viewers for partners | Large |
| 14 | **Transporter Management** | DB table exists, zero API or UI — can't assign transporters to deals or track their performance | Medium |
| 15 | **Mandi Rates** | DB table exists, zero code — no e-NAM scraping, no rate comparison to help price deals | Medium |
| 16 | **Audit Logging** | No change history — "who edited what, when" is critical for a financial app handling lakhs daily | Medium |
| 17 | **Subscription & Billing** | `plan` field exists but nothing enforced — no Razorpay integration, no feature gating, no upgrade flow | Large |

---

## Tier 3 — Scale & Reliability

Infrastructure needed before handling 50+ concurrent users or deploying to production.

| # | Feature | What's Missing | Effort |
|---|---------|---------------|--------|
| 18 | **Offline-First (SQLite Sync)** | Product spec explicitly requires this — currently app silently fails without network, zero local storage | Very Large |
| 19 | **AWS S3 File Storage** | Photos and logos save to local disk (`uploads/`) — lost on every deploy or server restart | Medium |
| 20 | **Redis + Background Jobs** | No caching layer, no job queue, no scheduled payment reminder cron — everything is synchronous | Medium |
| 21 | **Alembic Migrations** | Schema was applied via raw `schema.sql` — no migration history, risky for any future schema changes | Small |
| 22 | **Docker + CI/CD** | No Dockerfile, no docker-compose, no GitHub Actions — manual deploy only | Medium |
| 23 | **Error Tracking (Sentry)** | No crash reporting on mobile or backend — bugs in production are invisible | Small |
| 24 | **Rate Limiting & Security** | No rate limiting on OTP endpoint, no input sanitization audit, CORS is wide open (`*`) | Medium |
| 25 | **Performance Analytics** | DB views for farmer/buyer/transporter scoring exist but no API endpoint ever queries them | Medium |
| 26 | **Push Notifications (FCM)** | Zero notification infrastructure — no payment due alerts, no deal confirmation pushes | Medium |

---

## Tier 4 — Competitive Moat (Phase 3 Vision)

Features that make this THE platform for agricultural middlemen, not just another ledger app.

| # | Feature | Description |
|---|---------|-------------|
| 27 | **Dalla Network / Marketplace** | Social feed where dalals post surplus stock, find buyers across mandis — DB table exists, zero code |
| 28 | **Crop Calendar & Demand Prediction** | Seasonal crop availability + predicted demand to help time purchases |
| 29 | **Transport Marketplace** | Find and book transporters, compare rates, track deliveries |
| 30 | **ML Price Prediction** | Predict tomorrow's mandi rates using historical data + e-NAM feeds |
| 31 | **Multi-Language (Hindi/English)** | UI uses Hindi terms inline but no proper i18n system — toggle needed for different regions |
| 32 | **Multi-Mandi Support** | Operate across multiple mandis with separate P&L per location |
| 33 | **Credit Scoring** | Auto-score farmers and buyers based on payment history, reliability, volume |
| 34 | **Bank Statement Reconciliation** | Match UPI/bank transactions to recorded payments automatically |

---

## Suggested Build Order

### Sprint 1 — Complete Core Loop (2 weeks)
- [ ] Payment recording UI (web + mobile)
- [ ] Advance management UI (web + mobile)
- [ ] Soft-delete for all entities
- [ ] Deal editing on mobile
- [ ] Weekly P&L mobile screen

### Sprint 2 — Trust & Usability (2 weeks)
- [ ] Photo proof with camera integration
- [ ] Farmer/buyer detail + ledger pages
- [ ] Search and filter on all list pages
- [ ] Pagination on web
- [ ] Transporter CRUD + assignment to deals

### Sprint 3 — Production Ready (2 weeks)
- [ ] Real SMS OTP (MSG91/Twilio)
- [ ] AWS S3 for file storage
- [ ] Docker + docker-compose
- [ ] Alembic migration from current schema
- [ ] Sentry error tracking
- [ ] Rate limiting + CORS lockdown

### Sprint 4 — Revenue & Growth (3 weeks)
- [ ] Data export — CSV, Excel, GST-ready PDF
- [ ] WhatsApp reminders via Meta Business API
- [ ] Razorpay subscription + plan enforcement
- [ ] RBAC — munshi/assistant roles

### Sprint 5 — Scale (3 weeks)
- [ ] Offline-first with SQLite + sync queue
- [ ] Redis caching + background job queue
- [ ] Mandi rate scraping (e-NAM)
- [ ] Performance analytics dashboards
- [ ] Push notifications (FCM)
- [ ] Audit log table + activity trail

### Sprint 6 — Competitive Edge (ongoing)
- [ ] Dalla Network marketplace
- [ ] Multi-language support
- [ ] Crop calendar
- [ ] Credit scoring
- [ ] ML price prediction

---

## Summary

| Layer | Current | Target |
|-------|---------|--------|
| Database | 95% — all tables/views defined | Add audit_log table, migration history |
| Backend API | 60% — core CRUD works | 100% — all entities, export, analytics, notifications |
| Web Dashboard | 50% — 6 pages functional | 100% — full CRUD, analytics, export, admin |
| Mobile App | 65% — core flow works | 100% — offline-first, camera, payments, advances |
| Invoice/PDF | 85% — A4/A5/thermal, copies, labels | 90% — add HSN codes, multi-item invoices |
| Auth & Security | 30% — dev bypass only | 100% — real OTP, RBAC, rate limiting |
| Infrastructure | 10% — local only | 100% — Docker, S3, Redis, CI/CD, monitoring |
| **Overall** | **~55%** | **100%** |
