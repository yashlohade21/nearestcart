-- Dalla Deal Tracker — Full PostgreSQL Schema
-- Run: psql -U yash -d dalla_deal_tracker -f schema.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS (dalals who use the app)
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    business_name   VARCHAR(150),
    city            VARCHAR(100),
    state           VARCHAR(50),
    mandi_name      VARCHAR(150),
    language        VARCHAR(10) DEFAULT 'hi',
    gst_number      VARCHAR(20),
    address         TEXT,
    logo_url        VARCHAR(500),
    plan            VARCHAR(20) DEFAULT 'free',
    plan_expires_at TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);

-- ============================================
-- 2. FARMERS (people dalla buys FROM)
-- ============================================
CREATE TABLE farmers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    village         VARCHAR(100),
    district        VARCHAR(100),
    state           VARCHAR(50),
    primary_crops   TEXT[],
    quality_rating  DECIMAL(2,1),
    reliability     DECIMAL(5,2),
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

-- ============================================
-- 3. BUYERS (companies/wholesalers dalla sells TO)
-- ============================================
CREATE TABLE buyers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    contact_person      VARCHAR(100),
    phone               VARCHAR(15),
    company_type        VARCHAR(30),
    city                VARCHAR(100),
    state               VARCHAR(50),
    gst_number          VARCHAR(20),
    avg_payment_days    DECIMAL(5,1),
    dispute_rate        DECIMAL(5,2),
    payment_rating      DECIMAL(2,1),
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

-- ============================================
-- 4. PRODUCTS (master product catalog)
-- ============================================
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    name_local      VARCHAR(100),
    category        VARCHAR(50),
    unit            VARCHAR(20) DEFAULT 'kg',
    is_perishable   BOOLEAN DEFAULT true,
    avg_spoilage_pct DECIMAL(5,2),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE UNIQUE INDEX idx_products_user_name ON products(user_id, name);

-- ============================================
-- 5. TRANSPORTERS
-- ============================================
CREATE TABLE transporters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15),
    vehicle_type    VARCHAR(50),
    vehicle_number  VARCHAR(20),
    base_city       VARCHAR(100),
    avg_cost_per_km DECIMAL(8,2),
    avg_spoilage_pct DECIMAL(5,2),
    on_time_pct     DECIMAL(5,2),
    total_trips     INTEGER DEFAULT 0,
    rating          DECIMAL(2,1),
    is_active       BOOLEAN DEFAULT true,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transporters_user ON transporters(user_id);
CREATE INDEX idx_transporters_city ON transporters(base_city);

-- ============================================
-- 6. DEALS (CORE TABLE — every buy-sell transaction)
-- ============================================
CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmers(id),
    buyer_id        UUID NOT NULL REFERENCES buyers(id),
    product_id      UUID NOT NULL REFERENCES products(id),

    -- Quantities
    quantity        DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(20) DEFAULT 'kg',

    -- Pricing
    buy_rate        DECIMAL(10,2) NOT NULL,
    sell_rate       DECIMAL(10,2) NOT NULL,
    buy_total       DECIMAL(14,2) GENERATED ALWAYS AS (quantity * buy_rate) STORED,
    sell_total      DECIMAL(14,2) GENERATED ALWAYS AS (quantity * sell_rate) STORED,
    gross_margin    DECIMAL(14,2) GENERATED ALWAYS AS (quantity * (sell_rate - buy_rate)) STORED,

    -- Costs
    transport_cost  DECIMAL(10,2) DEFAULT 0,
    labour_cost     DECIMAL(10,2) DEFAULT 0,
    other_cost      DECIMAL(10,2) DEFAULT 0,
    total_cost      DECIMAL(10,2) GENERATED ALWAYS AS (transport_cost + labour_cost + other_cost) STORED,
    net_profit      DECIMAL(14,2) GENERATED ALWAYS AS (
                        (quantity * (sell_rate - buy_rate)) - transport_cost - labour_cost - other_cost
                    ) STORED,

    -- Status
    status          VARCHAR(20) DEFAULT 'pending',

    -- Payment status
    farmer_payment_status VARCHAR(20) DEFAULT 'unpaid',
    buyer_payment_status  VARCHAR(20) DEFAULT 'unpaid',
    farmer_paid_amount    DECIMAL(14,2) DEFAULT 0,
    buyer_received_amount DECIMAL(14,2) DEFAULT 0,

    -- Spoilage
    spoilage_qty    DECIMAL(10,2) DEFAULT 0,
    spoilage_reason VARCHAR(100),

    -- Transport
    transporter_id  UUID REFERENCES transporters(id),

    -- Dates
    deal_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date   DATE,
    payment_due_date DATE,

    -- Quality
    quality_grade   VARCHAR(10),
    has_dispute     BOOLEAN DEFAULT false,
    dispute_notes   TEXT,

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deals_user ON deals(user_id);
CREATE INDEX idx_deals_user_date ON deals(user_id, deal_date DESC);
CREATE INDEX idx_deals_farmer ON deals(farmer_id);
CREATE INDEX idx_deals_buyer ON deals(buyer_id);
CREATE INDEX idx_deals_product ON deals(product_id);
CREATE INDEX idx_deals_status ON deals(user_id, status);
CREATE INDEX idx_deals_farmer_payment ON deals(user_id, farmer_payment_status) WHERE farmer_payment_status != 'paid';
CREATE INDEX idx_deals_buyer_payment ON deals(user_id, buyer_payment_status) WHERE buyer_payment_status != 'paid';
CREATE INDEX idx_deals_transporter ON deals(transporter_id);

-- ============================================
-- 7. ADVANCES (money given to farmers before harvest)
-- ============================================
CREATE TABLE advances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id       UUID NOT NULL REFERENCES farmers(id),

    amount          DECIMAL(14,2) NOT NULL,
    recovered       DECIMAL(14,2) DEFAULT 0,
    balance         DECIMAL(14,2) GENERATED ALWAYS AS (amount - recovered) STORED,

    purpose         VARCHAR(100),
    given_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_recovery_date DATE,

    status          VARCHAR(20) DEFAULT 'active',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_advances_user ON advances(user_id);
CREATE INDEX idx_advances_farmer ON advances(farmer_id);
CREATE INDEX idx_advances_status ON advances(user_id, status) WHERE status = 'active';

-- ============================================
-- 8. PAYMENTS (every money movement)
-- ============================================
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id         UUID REFERENCES deals(id),
    advance_id      UUID REFERENCES advances(id),

    direction       VARCHAR(10) NOT NULL,
    farmer_id       UUID REFERENCES farmers(id),
    buyer_id        UUID REFERENCES buyers(id),

    amount          DECIMAL(14,2) NOT NULL,
    payment_mode    VARCHAR(20),
    reference_no    VARCHAR(100),

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

-- ============================================
-- 9. PHOTOS (proof photos for deals)
-- ============================================
CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deal_id         UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

    photo_type      VARCHAR(20) NOT NULL,
    s3_key          VARCHAR(500) NOT NULL,
    s3_url          VARCHAR(500),

    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_deal ON photos(deal_id);
CREATE INDEX idx_photos_user ON photos(user_id);

-- ============================================
-- 10. MANDI RATES (Phase 2)
-- ============================================
CREATE TABLE mandi_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name    VARCHAR(100) NOT NULL,
    mandi_name      VARCHAR(150) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50) NOT NULL,

    min_price       DECIMAL(10,2),
    max_price       DECIMAL(10,2),
    modal_price     DECIMAL(10,2),
    unit            VARCHAR(20) DEFAULT 'quintal',

    rate_date       DATE NOT NULL,
    source          VARCHAR(50) DEFAULT 'enam',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mandi_rates_product_date ON mandi_rates(product_name, rate_date DESC);
CREATE INDEX idx_mandi_rates_city ON mandi_rates(city, rate_date DESC);
CREATE UNIQUE INDEX idx_mandi_rates_unique ON mandi_rates(product_name, mandi_name, rate_date);

-- ============================================
-- 11. NOTIFICATIONS (WhatsApp messages sent)
-- ============================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type            VARCHAR(30) NOT NULL,
    recipient_phone VARCHAR(15) NOT NULL,
    recipient_name  VARCHAR(100),
    message_body    TEXT NOT NULL,
    channel         VARCHAR(20) DEFAULT 'whatsapp',

    deal_id         UUID REFERENCES deals(id),
    payment_id      UUID REFERENCES payments(id),
    advance_id      UUID REFERENCES advances(id),

    status          VARCHAR(20) DEFAULT 'pending',
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending';
CREATE INDEX idx_notifications_date ON notifications(user_id, created_at DESC);

-- ============================================
-- 12. DALLA NETWORK POSTS (Phase 3)
-- ============================================
CREATE TABLE dalla_network_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    post_type       VARCHAR(10) NOT NULL,
    product_name    VARCHAR(100) NOT NULL,
    quantity        DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(20) DEFAULT 'kg',
    quality_grade   VARCHAR(10),

    min_price       DECIMAL(10,2),
    max_price       DECIMAL(10,2),

    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50),
    available_from  DATE NOT NULL,
    available_until DATE NOT NULL,

    status          VARCHAR(20) DEFAULT 'active',
    matched_with    UUID REFERENCES dalla_network_posts(id),

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_network_posts_active ON dalla_network_posts(post_type, status, city) WHERE status = 'active';
CREATE INDEX idx_network_posts_product ON dalla_network_posts(product_name, status) WHERE status = 'active';
CREATE INDEX idx_network_posts_user ON dalla_network_posts(user_id);

-- ============================================
-- VIEWS
-- ============================================

-- Pending from buyers (mujhe milna hai)
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

-- Pending to farmers (mujhe dena hai)
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

-- Weekly P&L
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

-- Farmer performance
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

-- Buyer performance
CREATE VIEW v_buyer_performance AS
SELECT
    d.user_id,
    d.buyer_id,
    b.name AS buyer_name,
    COUNT(*) AS total_deals,
    SUM(d.quantity) AS total_quantity_kg,
    SUM(d.sell_total) AS total_business,
    SUM(d.net_profit) AS total_profit_from_buyer,
    SUM(CASE WHEN d.has_dispute THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100 AS dispute_pct
FROM deals d
JOIN buyers b ON b.id = d.buyer_id
GROUP BY d.user_id, d.buyer_id, b.name;

-- Transporter performance
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
