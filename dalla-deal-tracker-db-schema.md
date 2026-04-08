# Dalla Deal Tracker — Database Schema Design

## Entity Relationship Overview

```
                    ┌──────────┐
                    │  USERS   │ (dalals)
                    │ (dalla)  │
                    └────┬─────┘
                         │ owns everything
         ┌───────────────┼───────────────────────────┐
         │               │                           │
    ┌────▼────┐    ┌─────▼─────┐              ┌──────▼──────┐
    │ FARMERS │    │  BUYERS   │              │ TRANSPORTERS│
    └────┬────┘    └─────┬─────┘              └──────┬──────┘
         │               │                           │
         │    ┌──────────▼──────────┐                │
         └────►       DEALS        ◄────────────────┘
              │ (core transaction)  │
              └──┬───┬───┬───┬─────┘
                 │   │   │   │
           ┌─────┘   │   │   └──────┐
           │         │   │          │
      ┌────▼──┐ ┌───▼───▼──┐ ┌────▼─────┐
      │PHOTOS │ │ PAYMENTS │ │ SPOILAGE │
      └───────┘ └──────────┘ └──────────┘

    ┌──────────┐    ┌─────────────┐
    │ ADVANCES │    │ MANDI_RATES │
    │(farmer ↔ │    │ (Phase 2)   │
    │  dalla)  │    └─────────────┘
    └──────────┘

    ┌──────────────┐
    │ PRODUCTS     │ (master list: tomato, onion, etc.)
    └──────────────┘
```

---

## Tables

### 1. users (dalals who use the app)

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    business_name   VARCHAR(150),
    city            VARCHAR(100),
    state           VARCHAR(50),
    mandi_name      VARCHAR(150),
    language        VARCHAR(10) DEFAULT 'hi',  -- hi, en, mr, te, etc.
    gst_number      VARCHAR(20),
    plan            VARCHAR(20) DEFAULT 'free', -- free, basic, pro
    plan_expires_at TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
```

---

### 2. farmers (people dalla buys FROM)

```sql
CREATE TABLE farmers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    village         VARCHAR(100),
    district        VARCHAR(100),
    state           VARCHAR(50),
    primary_crops   TEXT[],          -- ['tomato', 'onion', 'potato']
    quality_rating  DECIMAL(2,1),    -- 1.0 to 5.0 (auto-calculated)
    reliability     DECIMAL(5,2),    -- % on-time delivery (auto-calculated)
    total_deals     INTEGER DEFAULT 0,
    total_volume_kg DECIMAL(12,2) DEFAULT 0,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_farmers_user ON farmers(user_id);
CREATE INDEX idx_farmers_name ON farmers(user_id, name);
CREATE INDEX idx_farmers_crops ON farmers USING GIN(primary_crops);
```

---

### 3. buyers (companies/wholesalers dalla sells TO)

```sql
CREATE TABLE buyers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    contact_person      VARCHAR(100),
    phone               VARCHAR(15),
    company_type        VARCHAR(30),  -- 'company', 'wholesaler', 'retailer', 'mandi_trader', 'exporter'
    city                VARCHAR(100),
    state               VARCHAR(50),
    gst_number          VARCHAR(20),
    avg_payment_days    DECIMAL(5,1), -- auto-calculated from payment history
    dispute_rate        DECIMAL(5,2), -- % of deals with quality disputes (auto-calculated)
    payment_rating      DECIMAL(2,1), -- 1.0 to 5.0 (auto-calculated)
    total_deals         INTEGER DEFAULT 0,
    total_volume_kg     DECIMAL(12,2) DEFAULT 0,
    total_business_amt  DECIMAL(14,2) DEFAULT 0,
    notes               TEXT,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_buyers_user ON buyers(user_id);
CREATE INDEX idx_buyers_name ON buyers(user_id, name);
CREATE INDEX idx_buyers_city ON buyers(city);
```

---

### 4. products (master product catalog)

```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,   -- 'Tomato', 'Onion', 'Potato'
    name_local      VARCHAR(100),            -- 'Tamatar', 'Pyaaz', 'Aloo'
    category        VARCHAR(50),             -- 'vegetable', 'fruit', 'grain', 'spice', 'dairy'
    unit            VARCHAR(20) DEFAULT 'kg', -- 'kg', 'quintal', 'tonne', 'crate', 'dozen'
    is_perishable   BOOLEAN DEFAULT true,
    avg_spoilage_pct DECIMAL(5,2),           -- auto-calculated average spoilage %
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE UNIQUE INDEX idx_products_user_name ON products(user_id, name);
```

---

### 5. deals (CORE TABLE — every buy-sell transaction)

```sql
CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmers(id),
    buyer_id        UUID NOT NULL REFERENCES buyers(id),
    product_id      UUID NOT NULL REFERENCES products(id),

    -- Quantities
    quantity        DECIMAL(10,2) NOT NULL,   -- in product's unit (kg/quintal)
    unit            VARCHAR(20) DEFAULT 'kg',

    -- Pricing
    buy_rate        DECIMAL(10,2) NOT NULL,   -- price per unit paid to farmer
    sell_rate       DECIMAL(10,2) NOT NULL,   -- price per unit charged to buyer
    buy_total       DECIMAL(14,2) GENERATED ALWAYS AS (quantity * buy_rate) STORED,
    sell_total      DECIMAL(14,2) GENERATED ALWAYS AS (quantity * sell_rate) STORED,
    gross_margin    DECIMAL(14,2) GENERATED ALWAYS AS (quantity * (sell_rate - buy_rate)) STORED,

    -- Costs
    transport_cost  DECIMAL(10,2) DEFAULT 0,
    labour_cost     DECIMAL(10,2) DEFAULT 0,  -- loading/unloading
    other_cost      DECIMAL(10,2) DEFAULT 0,
    total_cost      DECIMAL(10,2) GENERATED ALWAYS AS (transport_cost + labour_cost + other_cost) STORED,
    net_profit      DECIMAL(14,2) GENERATED ALWAYS AS (
                        (quantity * (sell_rate - buy_rate)) - transport_cost - labour_cost - other_cost
                    ) STORED,

    -- Status
    status          VARCHAR(20) DEFAULT 'pending',
                    -- 'pending' → deal agreed, not yet delivered
                    -- 'in_transit' → produce picked up, on the way
                    -- 'delivered' → reached buyer
                    -- 'completed' → fully paid
                    -- 'disputed' → quality/payment dispute
                    -- 'cancelled'

    -- Payment status
    farmer_payment_status VARCHAR(20) DEFAULT 'unpaid',  -- 'unpaid', 'partial', 'paid'
    buyer_payment_status  VARCHAR(20) DEFAULT 'unpaid',  -- 'unpaid', 'partial', 'paid'
    farmer_paid_amount    DECIMAL(14,2) DEFAULT 0,
    buyer_received_amount DECIMAL(14,2) DEFAULT 0,

    -- Spoilage
    spoilage_qty    DECIMAL(10,2) DEFAULT 0,  -- quantity rejected/spoiled
    spoilage_reason VARCHAR(100),              -- 'transit_damage', 'overripe', 'quality_below_grade'

    -- Transport
    transporter_id  UUID REFERENCES transporters(id),

    -- Dates
    deal_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date   DATE,
    payment_due_date DATE,

    -- Quality
    quality_grade   VARCHAR(10),  -- 'A', 'B', 'C', 'mixed'
    has_dispute     BOOLEAN DEFAULT false,
    dispute_notes   TEXT,

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Critical indexes for daily queries
CREATE INDEX idx_deals_user ON deals(user_id);
CREATE INDEX idx_deals_user_date ON deals(user_id, deal_date DESC);
CREATE INDEX idx_deals_farmer ON deals(farmer_id);
CREATE INDEX idx_deals_buyer ON deals(buyer_id);
CREATE INDEX idx_deals_product ON deals(product_id);
CREATE INDEX idx_deals_status ON deals(user_id, status);
CREATE INDEX idx_deals_farmer_payment ON deals(user_id, farmer_payment_status) WHERE farmer_payment_status != 'paid';
CREATE INDEX idx_deals_buyer_payment ON deals(user_id, buyer_payment_status) WHERE buyer_payment_status != 'paid';
CREATE INDEX idx_deals_transporter ON deals(transporter_id);
```

---

### 6. payments (every money movement — incoming or outgoing)

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id         UUID REFERENCES deals(id),           -- NULL if advance or general payment
    advance_id      UUID REFERENCES advances(id),        -- NULL if deal payment

    -- Direction
    direction       VARCHAR(10) NOT NULL,  -- 'incoming' (from buyer) or 'outgoing' (to farmer)

    -- Who
    farmer_id       UUID REFERENCES farmers(id),  -- set if direction = 'outgoing'
    buyer_id        UUID REFERENCES buyers(id),   -- set if direction = 'incoming'

    amount          DECIMAL(14,2) NOT NULL,
    payment_mode    VARCHAR(20),  -- 'cash', 'upi', 'bank_transfer', 'cheque'
    reference_no    VARCHAR(100), -- UPI ref, cheque no, etc.

    payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_deal ON payments(deal_id);
CREATE INDEX idx_payments_farmer ON payments(farmer_id);
CREATE INDEX idx_payments_buyer ON payments(buyer_id);
CREATE INDEX idx_payments_date ON payments(user_id, payment_date DESC);
CREATE INDEX idx_payments_direction ON payments(user_id, direction);
```

---

### 7. advances (money given to farmers before harvest)

```sql
CREATE TABLE advances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmers(id),

    amount          DECIMAL(14,2) NOT NULL,       -- total advance given
    recovered       DECIMAL(14,2) DEFAULT 0,      -- how much recovered so far
    balance         DECIMAL(14,2) GENERATED ALWAYS AS (amount - recovered) STORED,

    purpose         VARCHAR(100),                  -- 'harvest_advance', 'personal_loan', 'seed_money'
    given_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_recovery_date DATE,                   -- when farmer's harvest is expected

    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'recovered', 'partial', 'written_off'
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_advances_user ON advances(user_id);
CREATE INDEX idx_advances_farmer ON advances(farmer_id);
CREATE INDEX idx_advances_status ON advances(user_id, status) WHERE status = 'active';
```

---

### 8. photos (proof photos for deals)

```sql
CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

    photo_type      VARCHAR(20) NOT NULL,  -- 'loading', 'delivery', 'quality', 'weighing'
    s3_key          VARCHAR(500) NOT NULL, -- AWS S3 object key
    s3_url          VARCHAR(500),          -- pre-signed URL (generated on demand)

    -- Metadata captured at time of photo
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_deal ON photos(deal_id);
CREATE INDEX idx_photos_user ON photos(user_id);
```

---

### 9. transporters

```sql
CREATE TABLE transporters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    vehicle_type    VARCHAR(50),   -- 'tempo', 'truck', 'pickup', 'cold_storage_truck'
    vehicle_number  VARCHAR(20),
    base_city       VARCHAR(100),

    -- Auto-calculated stats
    avg_cost_per_km DECIMAL(8,2),
    avg_spoilage_pct DECIMAL(5,2),  -- avg spoilage when this transporter is used
    on_time_pct     DECIMAL(5,2),   -- % deliveries on time
    total_trips     INTEGER DEFAULT 0,
    rating          DECIMAL(2,1),   -- 1.0 to 5.0

    is_active       BOOLEAN DEFAULT true,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transporters_user ON transporters(user_id);
CREATE INDEX idx_transporters_city ON transporters(base_city);
```

---

### 10. mandi_rates (Phase 2 — daily mandi price data)

```sql
CREATE TABLE mandi_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name    VARCHAR(100) NOT NULL,  -- 'Tomato', 'Onion'
    mandi_name      VARCHAR(150) NOT NULL,  -- 'Hyderabad APMC', 'Nashik Mandi'
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50) NOT NULL,

    min_price       DECIMAL(10,2),  -- per kg/quintal
    max_price       DECIMAL(10,2),
    modal_price     DECIMAL(10,2),  -- most common trading price
    unit            VARCHAR(20) DEFAULT 'quintal',

    rate_date       DATE NOT NULL,
    source          VARCHAR(50) DEFAULT 'enam',  -- 'enam', 'manual', 'scraper'
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mandi_rates_product_date ON mandi_rates(product_name, rate_date DESC);
CREATE INDEX idx_mandi_rates_city ON mandi_rates(city, rate_date DESC);
CREATE UNIQUE INDEX idx_mandi_rates_unique ON mandi_rates(product_name, mandi_name, rate_date);
```

---

### 11. notifications (WhatsApp messages sent)

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type            VARCHAR(30) NOT NULL,
                    -- 'payment_reminder', 'weekly_summary', 'daily_summary',
                    -- 'rate_alert', 'advance_followup', 'deal_confirmation'

    recipient_phone VARCHAR(15) NOT NULL,
    recipient_name  VARCHAR(100),
    message_body    TEXT NOT NULL,
    channel         VARCHAR(20) DEFAULT 'whatsapp',  -- 'whatsapp', 'sms'

    -- Linked entities (optional)
    deal_id         UUID REFERENCES deals(id),
    payment_id      UUID REFERENCES payments(id),
    advance_id      UUID REFERENCES advances(id),

    status          VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'failed'
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending';
CREATE INDEX idx_notifications_date ON notifications(user_id, created_at DESC);
```

---

### 12. dalla_network_posts (Phase 3 — dalla-to-dalla marketplace)

```sql
CREATE TABLE dalla_network_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    post_type       VARCHAR(10) NOT NULL,  -- 'have' (selling) or 'need' (buying)
    product_name    VARCHAR(100) NOT NULL,
    quantity        DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(20) DEFAULT 'kg',
    quality_grade   VARCHAR(10),           -- 'A', 'B', 'C'

    -- Pricing
    min_price       DECIMAL(10,2),  -- seller's minimum / buyer's budget
    max_price       DECIMAL(10,2),

    -- Location & timing
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50),
    available_from  DATE NOT NULL,
    available_until DATE NOT NULL,

    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'matched', 'expired', 'cancelled'
    matched_with    UUID REFERENCES dalla_network_posts(id),  -- the post it got matched with

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_network_posts_active ON dalla_network_posts(post_type, status, city)
    WHERE status = 'active';
CREATE INDEX idx_network_posts_product ON dalla_network_posts(product_name, status)
    WHERE status = 'active';
CREATE INDEX idx_network_posts_user ON dalla_network_posts(user_id);
```

---

## Key Relationships Summary

```
users (dalla)
  ├── farmers[]          -- dalla's farmer contacts
  ├── buyers[]           -- dalla's buyer contacts
  ├── products[]         -- dalla's product catalog
  ├── transporters[]     -- dalla's transporter contacts
  ├── deals[]            -- all transactions
  │     ├── farmer_id    → farmers
  │     ├── buyer_id     → buyers
  │     ├── product_id   → products
  │     ├── transporter_id → transporters
  │     ├── photos[]     -- proof images
  │     └── payments[]   -- money movements for this deal
  ├── advances[]         -- money lent to farmers
  │     ├── farmer_id    → farmers
  │     └── payments[]   -- recovery payments
  ├── notifications[]    -- WhatsApp messages sent
  └── dalla_network_posts[] -- marketplace listings (Phase 3)
```

---

## Computed Views (for dashboard queries)

### Pending payments summary

```sql
CREATE VIEW v_pending_from_buyers AS
SELECT
    d.user_id,
    d.buyer_id,
    b.name AS buyer_name,
    b.phone AS buyer_phone,
    SUM(d.sell_total - d.buyer_received_amount) AS pending_amount,
    COUNT(*) AS pending_deals,
    MIN(d.deal_date) AS oldest_deal_date,
    CURRENT_DATE - MIN(d.deal_date) AS max_overdue_days
FROM deals d
JOIN buyers b ON b.id = d.buyer_id
WHERE d.buyer_payment_status != 'paid'
GROUP BY d.user_id, d.buyer_id, b.name, b.phone;
```

```sql
CREATE VIEW v_pending_to_farmers AS
SELECT
    d.user_id,
    d.farmer_id,
    f.name AS farmer_name,
    f.phone AS farmer_phone,
    SUM(d.buy_total - d.farmer_paid_amount) AS pending_amount,
    COUNT(*) AS pending_deals,
    MIN(d.deal_date) AS oldest_deal_date,
    CURRENT_DATE - MIN(d.deal_date) AS max_overdue_days
FROM deals d
JOIN farmers f ON f.id = d.farmer_id
WHERE d.farmer_payment_status != 'paid'
GROUP BY d.user_id, d.farmer_id, f.name, f.phone;
```

### Weekly P&L

```sql
CREATE VIEW v_weekly_pnl AS
SELECT
    d.user_id,
    DATE_TRUNC('week', d.deal_date) AS week_start,
    COUNT(*) AS total_deals,
    SUM(d.buy_total) AS total_bought,
    SUM(d.sell_total) AS total_sold,
    SUM(d.gross_margin) AS gross_margin,
    SUM(d.total_cost) AS total_costs,
    SUM(d.net_profit) AS net_profit,
    SUM(d.spoilage_qty) AS total_spoilage_qty,
    AVG(d.spoilage_qty / NULLIF(d.quantity, 0) * 100) AS avg_spoilage_pct
FROM deals d
GROUP BY d.user_id, DATE_TRUNC('week', d.deal_date);
```

### Farmer performance

```sql
CREATE VIEW v_farmer_performance AS
SELECT
    d.user_id,
    d.farmer_id,
    f.name AS farmer_name,
    COUNT(*) AS total_deals,
    SUM(d.quantity) AS total_quantity_kg,
    SUM(d.buy_total) AS total_business,
    AVG(d.spoilage_qty / NULLIF(d.quantity, 0) * 100) AS avg_spoilage_pct,
    SUM(CASE WHEN d.has_dispute THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100 AS dispute_pct,
    (SELECT COALESCE(SUM(a.balance), 0)
     FROM advances a
     WHERE a.farmer_id = d.farmer_id AND a.status = 'active') AS outstanding_advance
FROM deals d
JOIN farmers f ON f.id = d.farmer_id
GROUP BY d.user_id, d.farmer_id, f.name;
```

### Buyer performance

```sql
CREATE VIEW v_buyer_performance AS
SELECT
    d.user_id,
    d.buyer_id,
    b.name AS buyer_name,
    COUNT(*) AS total_deals,
    SUM(d.quantity) AS total_quantity_kg,
    SUM(d.sell_total) AS total_business,
    SUM(d.net_profit) AS total_profit_from_buyer,
    AVG(p.avg_payment_days) AS avg_payment_days,
    SUM(CASE WHEN d.has_dispute THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100 AS dispute_pct
FROM deals d
JOIN buyers b ON b.id = d.buyer_id
LEFT JOIN LATERAL (
    SELECT AVG(pay.payment_date - d2.deal_date) AS avg_payment_days
    FROM payments pay
    JOIN deals d2 ON d2.id = pay.deal_id
    WHERE pay.buyer_id = d.buyer_id AND pay.direction = 'incoming'
) p ON true
GROUP BY d.user_id, d.buyer_id, b.name;
```

### Transporter performance

```sql
CREATE VIEW v_transporter_performance AS
SELECT
    d.user_id,
    d.transporter_id,
    t.name AS transporter_name,
    t.vehicle_type,
    COUNT(*) AS total_trips,
    AVG(d.transport_cost) AS avg_trip_cost,
    AVG(d.spoilage_qty / NULLIF(d.quantity, 0) * 100) AS avg_spoilage_pct,
    SUM(d.transport_cost) AS total_transport_spend
FROM deals d
JOIN transporters t ON t.id = d.transporter_id
WHERE d.transporter_id IS NOT NULL
GROUP BY d.user_id, d.transporter_id, t.name, t.vehicle_type;
```

---

## SQLite Schema (for offline-first mobile app)

The React Native app stores deals locally in SQLite, then syncs to PostgreSQL when online.

```sql
-- Simplified local schema (mirrors key tables)
CREATE TABLE local_deals (
    id              TEXT PRIMARY KEY,  -- UUID generated on device
    farmer_name     TEXT NOT NULL,
    buyer_name      TEXT NOT NULL,
    product_name    TEXT NOT NULL,
    quantity        REAL NOT NULL,
    buy_rate        REAL NOT NULL,
    sell_rate       REAL NOT NULL,
    transport_cost  REAL DEFAULT 0,
    labour_cost     REAL DEFAULT 0,
    spoilage_qty    REAL DEFAULT 0,
    deal_date       TEXT NOT NULL,     -- ISO date string
    status          TEXT DEFAULT 'pending',
    notes           TEXT,
    synced          INTEGER DEFAULT 0, -- 0 = not synced, 1 = synced
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE local_photos (
    id              TEXT PRIMARY KEY,
    deal_id         TEXT NOT NULL,
    photo_type      TEXT NOT NULL,
    local_uri       TEXT NOT NULL,     -- file:// path on device
    latitude        REAL,
    longitude       REAL,
    captured_at     TEXT,
    synced          INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE local_payments (
    id              TEXT PRIMARY KEY,
    deal_id         TEXT,
    direction       TEXT NOT NULL,
    party_name      TEXT NOT NULL,
    amount          REAL NOT NULL,
    payment_mode    TEXT,
    payment_date    TEXT NOT NULL,
    synced          INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sync_queue (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name      TEXT NOT NULL,
    record_id       TEXT NOT NULL,
    action          TEXT NOT NULL,     -- 'insert', 'update', 'delete'
    payload         TEXT NOT NULL,     -- JSON of the record
    created_at      TEXT DEFAULT (datetime('now'))
);
```

---

## Sync Strategy

```
MOBILE (SQLite)                    SERVER (PostgreSQL)
─────────────────                  ──────────────────
1. Dalla creates deal offline
2. Saved to local_deals
3. Added to sync_queue
         │
         ▼ (when internet available)
4. POST /api/sync
   sends all unsynced records ───────► 5. Server processes batch
                                        6. Inserts into PostgreSQL
                                        7. Returns server IDs + timestamps
         │
         ◄────────────────────────────  8. Response with confirmations
9. Mark records as synced=1
10. Pull any new data from server
    (mandi rates, notifications)
```

---

## API Endpoints (maps to this schema)

```
POST   /api/auth/otp/send          → send OTP to phone
POST   /api/auth/otp/verify        → verify OTP, return JWT

POST   /api/sync                   → batch sync from mobile

GET    /api/deals                  → list deals (filters: date, farmer, buyer, status)
POST   /api/deals                  → create deal
PATCH  /api/deals/:id             → update deal status/payment
GET    /api/deals/:id             → deal detail with photos & payments

GET    /api/farmers               → list farmers
POST   /api/farmers               → add farmer
GET    /api/farmers/:id/stats     → farmer performance view

GET    /api/buyers                → list buyers
POST   /api/buyers                → add buyer
GET    /api/buyers/:id/stats      → buyer performance view

POST   /api/payments              → record payment (incoming/outgoing)
GET    /api/payments/pending      → all pending payments summary

POST   /api/advances              → give advance
PATCH  /api/advances/:id          → update recovery
GET    /api/advances/active       → all active advances

POST   /api/photos/upload         → upload photo to S3
GET    /api/photos/:deal_id       → get photos for a deal

GET    /api/transporters          → list transporters
POST   /api/transporters          → add transporter
GET    /api/transporters/:id/stats → transporter performance

GET    /api/dashboard/weekly      → weekly P&L summary
GET    /api/dashboard/monthly     → monthly P&L summary
GET    /api/dashboard/pending     → pending payments both sides
GET    /api/dashboard/overview    → today's quick stats

GET    /api/mandi-rates           → today's mandi rates (Phase 2)
GET    /api/mandi-rates/trends    → price trends for a product

POST   /api/notifications/remind  → send payment reminder via WhatsApp
GET    /api/notifications         → notification history

GET    /api/export/gst            → GST-ready transaction export (Phase 3)
GET    /api/export/pnl            → P&L report export

POST   /api/network/posts         → create buy/sell post (Phase 3)
GET    /api/network/posts         → browse marketplace
```
