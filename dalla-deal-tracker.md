# Dallal Deal Tracker — Complete Project Breakdown

## The One-Line Pitch

**"Khata, payment, proof — sab ek jagah. Dalla ka apna business tool."**

---

# PART 1: THE PROBLEM (IN DETAIL)

## Who is a Dalla?

A dalla (also called dalal, broker, commission agent, arthiya, arhatiya) is a middleman in India's agricultural supply chain. He:

- Buys produce from farmers (onion, tomato, fruits, grains — anything)
- Sells it to companies, wholesalers, retailers, or other mandis
- Takes a commission/margin on every deal (usually 2-10% depending on produce and relationship)
- Handles logistics — arranging transport from farm to buyer
- Sometimes gives advances to farmers before harvest
- Manages 20-100+ farmer relationships and 5-20+ buyer relationships simultaneously

**India has an estimated 25-30 lakh commission agents/middlemen** operating across 7,246 mandis and countless informal markets.

---

## THE 12 PROBLEMS A DALLA FACES DAILY

### PROBLEM 1: Transaction Chaos

**Severity: 10/10**

A dalla does 5-15 deals per day. Each deal involves:

- Which farmer sold what
- What quantity (in kg/quintal)
- At what buying rate
- Which company/buyer it went to
- At what selling rate
- Transport cost
- Loading/unloading cost
- His margin

That's 8+ data points per deal × 10 deals/day × 30 days = **2,400+ data points per month.**

Where does he track this? **A paper diary. Or his head.**

By the end of the month, he has NO IDEA:

- How many deals he did
- What his total revenue was
- What his actual profit was (after costs)
- Which buyers are most profitable
- Which farmers give the best produce

### PROBLEM 2: Payment Tracking Nightmare

**Severity: 10/10**

The dalla's money flows in 3 directions:

```
FARMERS → (owe them money) → DALLA → (owed money by) → COMPANIES/BUYERS
                                ↕
                        (his own expenses)
```

At any given time:

- 5 companies owe him ₹3-10 lakh (some pay in 2 days, some take 30-90 days)
- He owes 15 farmers ₹1-5 lakh (farmers need money urgently)
- He's given advances to 3 farmers (₹50,000 total) against next harvest

**He has NO real-time view of:**

- Total money owed TO him
- Total money he OWES
- His net cash position
- Which payments are overdue

Result: He often pays farmers from his own pocket while companies haven't paid him yet. Cash flow crunch is constant.

**Real data:** Commission agents are expected to pay farmers within 48 hours, but buyers often pay after 30-90 days. This gap kills dalals financially.

### PROBLEM 3: Quality Disputes

**Severity: 9/10**

The dalla buys 1000kg tomatoes from a farmer. Sends it to Company X. Company X says:

> "200kg maal kharab tha. We're deducting ₹6,000."

Now the dalla is stuck:

- Was the produce actually bad? Or is the company lying to squeeze his margin?
- The farmer says "maine toh accha maal diya tha"
- There's NO photo proof of what was sent or received
- No quality grade was documented
- The dalla absorbs the loss because he has no evidence

**This happens on 20-30% of deals.** Companies regularly over-report damage to negotiate better prices after the fact.

### PROBLEM 4: Rate Confusion & Price Disputes

**Severity: 8/10**

Mandi rates change DAILY. Sometimes multiple times a day.

- Dalla quotes ₹22/kg to buyer on Monday
- By Wednesday when produce arrives, mandi rate dropped to ₹18/kg
- Buyer says "market rate hai ₹18, hum ₹22 nahi denge"
- There's no written contract, no WhatsApp confirmation saved properly
- Dalla loses ₹4/kg × 1000kg = ₹4,000 on one deal

**Data:** Farmers receive an average of ₹2.15/kg while mandi price is ₹4.77/kg — a 55% gap caused by information asymmetry and lack of documented pricing.

### PROBLEM 5: No Profit/Loss Visibility

**Severity: 9/10**

Ask any dalla: "Kitna kamate ho mahine mein?"

Answer: "₹50,000-1,00,000 hoga" (vague guess)

Reality check — does he account for:

- Transport costs? (₹500-2000 per trip)
- Loading/unloading labour? (₹200-500 per consignment)
- Spoilage during transit? (5-15% of perishable produce)
- Phone/travel expenses?
- Advances that were never recovered?
- Deals where he got paid less than expected?

**Most dalals overestimate their profit by 30-50%.** They think they're making ₹80,000 but actually making ₹45,000.

### PROBLEM 6: Advance Recovery Problem

**Severity: 8/10**

Dalals often give advances to farmers before harvest:

- "Bhai ₹20,000 de do, bacche ki fees deni hai"
- The dalla gives the money against future produce
- Harvest comes — farmer sells to ANOTHER dalla who offered ₹1/kg more
- The ₹20,000 advance is stuck
- No written agreement, no legal recourse

Or:

- Farmer delivers produce worth ₹15,000
- Dalla deducts ₹20,000 advance but only ₹15,000 came in
- Remaining ₹5,000 — farmer says "next time adjust karunga"
- "Next time" never comes

### PROBLEM 7: Post-Harvest Spoilage During Transit

**Severity: 8/10**

**India loses 25-30% of total agricultural output post-harvest.** For fruits and vegetables specifically:

- Guava: 15.05% loss
- Tomato: 11.62% loss
- Overall vegetables: 4.87-11.61% loss

This translates to **₹1.28 lakh crore ($17.7 billion) in annual food loss.**

For a dalla, this means:

- He buys 1000kg tomatoes
- By the time it reaches the buyer (12-48 hours), 100-150kg are damaged
- 10-15% loss on EVERY perishable deal
- No insurance, no documentation of transit damage
- Who bears the cost? Usually the dalla.

### PROBLEM 8: GST & Tax Compliance

**Severity: 7/10**

Government is cracking down on agricultural traders:

- If turnover exceeds ₹20 lakh (₹10 lakh in some states), GST registration is mandatory
- Commission agents need to file GSTR-1 and GSTR-3B
- Income Tax Department uses AI to match GST returns with ITR filings
- Mismatch = notice = penalty

**The problem:** The dalla's records are in a torn diary. His CA guesses the numbers. ITR shows ₹40 lakh, GST shows ₹60 lakh. Notice comes.

If he had proper digital transaction records, his CA could file accurate returns in 1 hour instead of guessing for 3 days.

### PROBLEM 9: Farmer Relationship Management

**Severity: 7/10**

A dalla works with 30-100 farmers. He needs to remember:

- Which farmer grows what (and when it's harvest season)
- Quality history (does Ramesh always give Grade A onions?)
- Payment history (does he always want cash on delivery or can he wait 3 days?)
- Advance history (how much has been given, how much recovered)
- Personal details (wife's name, kid's exam — relationships matter in this business)

This is all in his HEAD. When a new company asks "give me 5000kg Grade A onion next month" — the dalla mentally goes through his farmer list. He might forget the best supplier.

### PROBLEM 10: Transport Coordination Chaos

**Severity: 7/10**

For every deal, the dalla arranges:

- Truck/tempo from farm to mandi or directly to buyer
- Loading labour at farm
- Unloading labour at destination
- Sometimes cold storage in between

He coordinates all this on phone calls and WhatsApp. There's no record of:

- Which transporter was used
- How much was charged
- Was the delivery on time?
- Did the driver handle the produce properly?
- Which transporter is cheapest/most reliable?

### PROBLEM 11: Seasonal Cash Flow Crisis

**Severity: 8/10**

Agricultural trading is SEASONAL:

- Onion season (Nov-Feb): dalla is swimming in deals
- Off-season: fewer deals, but fixed costs remain
- Festival seasons: sudden demand spikes
- Monsoon: transport disruptions, spoilage increases

The dalla has NO way to:

- Plan for lean months
- Save from peak months
- Predict when cash flow will be tight

He lives month-to-month, even if annual income is ₹10-15 lakh.

### PROBLEM 12: Trust & Reputation (No Track Record)

**Severity: 6/10**

A dalla's business runs on trust. But:

- New companies don't know if he's reliable
- New farmers don't know if he'll pay on time
- There's no "rating" or "track record" system
- Word of mouth is the only reputation mechanism

If a dalla could show: "I've done 500 deals, ₹2 crore volume, 98% on-time payment" — he'd get better buyers and better rates.

---

# PART 2: THE SOLUTION

## Product: Dalla Deal Tracker

### Core Principle:

**"Dalla ka khata, dalla ki bhasha mein, dalla ke phone pe."**

Not a complex ERP. Not a dashboard with graphs. A tool that speaks the dalla's language and solves his daily headaches.

---

## FEATURE SET (Phased)

### PHASE 1: MVP (Week 1-3) — "Mera Khata"

**1. Deal Entry (30 seconds per deal)**

Dalla opens app. Taps "New Deal." Fills:

```
Farmer: Ramesh (auto-suggest from contacts)
Product: Tomato
Quantity: 500 kg
Buying rate: ₹15/kg
Buyer: Company X (auto-suggest)
Selling rate: ₹22/kg
Transport cost: ₹800
Date: Today

[Take Photo of Produce] 📸

→ SAVE
```

App automatically calculates:

- Gross margin: ₹3,500
- Net margin (after transport): ₹2,700

**2. Payment Tracker**

Two simple screens:

**"Mujhe milna hai" (Money owed TO me):**

```
Company X: ₹45,000 (5 days overdue) 🔴
Company Y: ₹22,000 (due tomorrow) 🟡
Company Z: ₹15,000 (paid) ✅

Total pending: ₹67,000
```

**"Mujhe dena hai" (Money I OWE):**

```
Ramesh: ₹15,000 (2 days overdue) 🔴
Sunil: ₹8,000 (due in 3 days) 🟡
Mahesh: ₹12,000 (paid) ✅

Total pending: ₹23,000
```

**Net position: +₹44,000 (companies owe me more than I owe farmers)**

**3. WhatsApp Payment Reminders**

Dalla taps "Remind" next to Company X.

Company X gets WhatsApp message:

```
"Sir, ₹45,000 payment pending since March 18 for 500kg Tomato delivery.
Kindly process at earliest. 🙏

— Yash Lohade, Dalla Deal Tracker"
```

Professional. Polite. The dalla doesn't have to make an awkward phone call.

**4. Daily/Weekly Summary on WhatsApp**

Every Sunday at 8 AM:

```
📊 YOUR WEEK (March 17-23):

Deals: 8
Total bought: ₹1,80,000
Total sold: ₹2,35,000
Gross margin: ₹55,000
Transport costs: ₹8,500
Net profit: ₹46,500

⚠️ Pending payments: ₹67,000
⚠️ You owe farmers: ₹23,000
💰 Net cash position: +₹44,000

Top buyer this week: Company X (₹95,000)
Top farmer this week: Ramesh (₹60,000)
```

**5. Photo Proof System**

- Take photo of produce at loading (farm) → timestamped + GPS
- Take photo at delivery (buyer) → timestamped + GPS
- Both photos stored against the deal
- If buyer says "maal kharab tha" → dalla shows photos
- If farmer says "maine accha diya tha" → dalla shows photos

---

### PHASE 2: Intelligence (Month 2-3) — "Mera Advisor"

**6. Advance Tracking**

```
ADVANCES GIVEN:

Ramesh: ₹20,000 (given Feb 15)
  → Recovered: ₹15,000 (from 3 deliveries)
  → Remaining: ₹5,000
  → Next delivery expected: March 28

Sunil: ₹10,000 (given March 1)
  → Recovered: ₹0
  → ⚠️ No delivery in 22 days. Follow up.
```

**7. Spoilage Tracker**

For every deal, dalla records: "How much was rejected/spoiled?"

After 30 days, app shows:

```
🚨 SPOILAGE REPORT:

Tomato: 12% average loss (industry avg: 11.6%)
  → Worst route: Nashik → Mumbai (18% loss)
  → Best route: Pune → Hyderabad (6% loss)
  → Worst transporter: Raju Tempo (15% loss)
  → Best transporter: Singh Transport (5% loss)

💡 Switch to Singh Transport for Nashik-Mumbai route.
   Estimated saving: ₹4,200/month
```

**8. Mandi Rate Integration**

Daily alert:

```
🟢 TODAY'S RATES (March 23):

Tomato:
  Hyderabad mandi: ₹18/kg
  Pune mandi: ₹24/kg ← BEST
  Mumbai mandi: ₹21/kg

Onion:
  Nashik: ₹11/kg
  Delhi: ₹19/kg ← BEST

💡 You sold tomato at ₹22/kg yesterday.
   Pune mandi is giving ₹24/kg today.
   Consider redirecting next batch to Pune.
```

**9. Buyer & Farmer Scoring**

After 3 months of data:

```
🏆 YOUR BEST BUYERS:

1. Company X
   - 45 deals | ₹12 lakh total
   - Avg payment time: 3 days ✅
   - Quality disputes: 2%
   - Rating: ⭐⭐⭐⭐⭐

2. Company Z
   - 20 deals | ₹4 lakh total
   - Avg payment time: 18 days ⚠️
   - Quality disputes: 25% 🔴
   - Rating: ⭐⭐

💡 Company Z disputes too often. Consider
   dropping or requiring advance payment.
```

```
🌾 YOUR BEST FARMERS:

1. Ramesh
   - Supplies: Tomato, Onion
   - Quality: Consistently Grade A ✅
   - Reliability: 95% on-time delivery
   - Advance outstanding: ₹5,000

2. Sunil
   - Supplies: Potato
   - Quality: Mixed (Grade A 60%, Grade B 40%)
   - Reliability: 70% on-time ⚠️
   - Advance outstanding: ₹10,000
```

---

### PHASE 3: Scale (Month 4-6) — "Mera Network"

**10. GST-Ready Export**

One tap → export all transactions as:

- Excel sheet (for CA)
- GST-ready format (GSTR-1 compatible)
- Monthly P&L statement
- Yearly summary for ITR filing

Dalla's CA goes from "bhai records do" → "sir yeh raha Excel, sab hai isme"

No more ITR-GST mismatch notices. No more penalties.

**11. Dalla-to-Dalla Network**

Post a deal:

```
HAVE: 2000kg Grade A Onion, Nashik
WANT: ₹16/kg minimum
Available: March 25-27
```

A dalla in Delhi sees it:

```
NEED: 2000kg Onion for Hotel Chain
Budget: ₹22/kg
Delivery: Delhi by March 27
```

Match. Both dalals earn. Supply chain expands without anyone leaving the app.

**12. Transport Marketplace**

Instead of calling 5 transporters to find who's available:

```
NEED TRANSPORT:
From: Nashik farm
To: Mumbai APMC Mandi
Load: 2000kg Onion
Date: March 25

Available transporters:
1. Singh Transport — ₹2,800 — Rating: 4.5⭐ — Available ✅
2. Raju Tempo — ₹2,200 — Rating: 3.2⭐ — Available ✅
3. Sharma Logistics — ₹3,100 — Rating: 4.8⭐ — Busy ❌

→ Book Singh Transport
```

**13. Crop Calendar + Demand Prediction**

Based on historical data:

```
📅 UPCOMING (Next 30 days):

- Tomato harvest starting in Nashik region (April 5-20)
  → Expected: High supply, prices may drop 15-20%
  → Your action: Lock in buyer rates NOW before price drops

- Mango season approaching (April 15+)
  → Demand increasing, fewer suppliers yet
  → Your action: Contact Alphonso farmers in Ratnagiri early

- Ramadan ending April 10
  → Dates/dry fruit demand dropping after Eid
  → Your action: Clear existing stock before April 8
```

---

# PART 3: WHO EXACTLY WILL PAY AND WHY

## Customer Segments:

### Segment 1: Small Dalla (handles ₹2-10 lakh/month)

- Currently uses: Paper diary + memory
- Pain level: HIGH (loses ₹5,000-15,000/month to poor tracking)
- Willingness to pay: ₹299-499/month
- Estimated market: 15-20 lakh dalals across India

### Segment 2: Medium Dalla (handles ₹10-50 lakh/month)

- Currently uses: Paper diary + part-time munshi
- Pain level: VERY HIGH (loses ₹15,000-50,000/month)
- Willingness to pay: ₹999-1,999/month
- Estimated market: 5-8 lakh dalals

### Segment 3: Large Commission Agent (handles ₹50 lakh-5 crore/month)

- Currently uses: Full-time accountant + Tally
- Pain level: HIGH (compliance risk, dispute management)
- Willingness to pay: ₹2,999-4,999/month
- Estimated market: 1-2 lakh agents

### Revenue projection (conservative):

```
Year 1 target: 500 paying users

Small (300 × ₹399/mo)    = ₹1,19,700/mo
Medium (150 × ₹1,499/mo) = ₹2,24,850/mo
Large (50 × ₹3,999/mo)   = ₹1,99,950/mo

Total MRR: ₹5,44,500/month
Annual: ₹65+ lakh
```

---

# PART 4: COMPETITIVE LANDSCAPE

| Existing Solution | What it does            | Why it DOESN'T work for dalals                                         |
| ----------------- | ----------------------- | ---------------------------------------------------------------------- |
| Khatabook         | Digital ledger          | Generic. No deal-level tracking. No margin calc. No photo proof.       |
| OkCredit          | Credit tracking         | Only tracks "X owes me ₹5000." No produce details, no rate tracking.  |
| Tally             | Accounting software     | ₹18,000/year. Too complex. Needs accountant to operate. Desktop only. |
| e-NAM             | Govt mandi platform     | Only for mandi auctions. Clunky. Doesn't help informal deals.          |
| AgriBazaar        | Online agri marketplace | Tries to REMOVE middlemen. A dalla would never use it.                 |
| Vyapar            | Billing/invoicing       | Built for shopkeepers. No concept of buy-sell-margin workflow.         |
| Excel/Diary       | Manual tracking         | Tears, gets wet, no calculations, no reminders, no proof.              |

**Gap:** NOBODY builds tools FOR the middleman. Every agri-tech startup positions against them. This tool HELPS them run their business better.

---

# PART 5: TECH ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│                  CLIENTS                     │
├──────────┬──────────────┬───────────────────┤
│  React   │  React Native│  WhatsApp Bot     │
│  Native  │  (Expo)      │  (Meta Business   │
│  App     │  Offline-    │   API / Twilio)   │
│  (Main)  │  first       │                   │
├──────────┴──────────────┴───────────────────┤
│                                             │
│              FastAPI Backend                 │
│         (Python, async, REST API)           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │PostgreSQL│ │  Redis   │ │ AWS S3      │ │
│  │(deals,   │ │(caching, │ │(photo proof │ │
│  │payments, │ │job queue,│ │ storage)    │ │
│  │farmers,  │ │rate      │ │             │ │
│  │buyers)   │ │cache)    │ │             │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│                                             │
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │ Cron Jobs        │ │ ML Models        │  │
│  │ - Payment remind │ │ - Price predict  │  │
│  │ - Weekly summary │ │ - Spoilage risk  │  │
│  │ - Rate alerts    │ │ - Buyer scoring  │  │
│  └──────────────────┘ └──────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ External APIs                        │   │
│  │ - e-NAM / Mandi board (rate data)   │   │
│  │ - WhatsApp Business API             │   │
│  │ - Weather API (spoilage prediction) │   │
│  │ - Google Maps (transport routes)    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Tech Stack:

- **App:** React Native (Expo) — offline-first with SQLite local DB, syncs when online
- **Backend:** FastAPI (Python) — async, fast, easy to extend with ML
- **Database:** PostgreSQL — deals, payments, farmers, buyers, advances
- **Cache/Queue:** Redis — mandi rate caching, reminder job queue
- **Storage:** AWS S3 — photo proof images
- **WhatsApp:** Meta Business API or Twilio — reminders, summaries, alerts
- **ML (later):** scikit-learn — buyer scoring, price prediction, spoilage risk
- **Web Dashboard:** Next.js — monthly P&L, GST export (for medium/large dalals)
- **Deployment:** Docker + AWS (EC2 + RDS) or GCP Cloud Run

### Why offline-first matters:

Dalals work in:

- Rural farms (no internet)
- Mandi yards (patchy network)
- Loading/transport areas

App MUST work without internet. Save locally → sync when online.

---

# PART 6: BUILD PLAN

### Week 1-2: Core MVP

- Deal entry screen (farmer, product, qty, rate, buyer, transport cost)
- Auto margin calculation
- Payment tracker (who owes me / who I owe)
- Photo capture with timestamp
- Local SQLite storage (offline)
- Basic FastAPI backend + PostgreSQL
- User auth (phone number OTP)

### Week 3: WhatsApp Integration

- Payment reminder messages
- Weekly summary message
- Deal confirmation to both parties

### Week 4: Polish + Launch

- Advance tracking
- Search/filter deals by date, farmer, buyer, product
- Monthly P&L screen
- Hindi language support
- Deploy on AWS
- Give to 5-10 dalals for testing (starting with YOU)

### Month 2-3: Intelligence Layer

- Mandi rate integration (scrape e-NAM)
- Buyer/farmer scoring
- Spoilage tracking
- Transport cost analytics
- GST export

### Month 4-6: Network Features

- Dalla-to-dalla marketplace
- Transport booking
- Crop calendar + demand prediction

---

# PART 7: YOUR UNFAIR ADVANTAGES

| Advantage                                  | Why it matters                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| **You ARE a dalla**                  | You know every pain point because you live it. No Bangalore startup founder has this.  |
| **Your first user is yourself**      | Day 1, the app has a real user with real data.                                         |
| **Your network IS the distribution** | Every dalla you know = potential user. Word of mouth in mandi = fastest growth.        |
| **Nobody is building FOR dalals**    | Every agri-tech tries to remove middlemen. You're the first to empower them.           |
| **You're a software developer**      | Most dalals can't build tech. Most tech people don't know dalla business. You're BOTH. |
| **Low competition = fast growth**    | No incumbent to fight. You just need to be 10x better than paper diary.                |

---

# PART 8: PROBLEMS THIS SOLVES (SUMMARY)

| #  | Problem           | How Dalla Deal Tracker Solves It                       |
| -- | ----------------- | ------------------------------------------------------ |
| 1  | Transaction chaos | Digital deal entry with auto calculations              |
| 2  | Payment tracking  | Real-time "who owes me / who I owe" with reminders     |
| 3  | Quality disputes  | Photo proof with timestamp + GPS at loading & delivery |
| 4  | Rate confusion    | Mandi rate alerts + deal-level rate documentation      |
| 5  | No P&L visibility | Auto-calculated weekly/monthly profit reports          |
| 6  | Advance recovery  | Advance ledger with auto-deduction tracking            |
| 7  | Spoilage losses   | Spoilage tracking per route, transporter, product      |
| 8  | GST compliance    | One-tap export for CA in GST-ready format              |
| 9  | Farmer management | Contact book with quality history, reliability score   |
| 10 | Transport chaos   | Cost tracking per transporter with performance rating  |
| 11 | Cash flow crisis  | Seasonal income visualization + pending payment alerts |
| 12 | No reputation     | Deal history and stats as a portable trust profile     |

---

# PART 9: RESEARCH & DATA BACKING

## Market Size

- India has **7,246 functioning mandis** with 25-30 lakh commission agents
- Agricultural produce market in India: **₹40+ lakh crore annually**
- Commission agents handle estimated **60-70% of all farm produce** movement

## Loss Statistics

- Post-harvest losses: **25-30% of total agricultural output** ($17.7 billion/year)
- Tomato spoilage: **11.62%** per consignment
- Guava spoilage: **15.05%** per consignment
- Fruits & vegetables: **30-40% lost** between harvest and consumption

## Payment & Pricing Issues

- Farmer receives **₹2.15/kg** while mandi price is **₹4.77/kg** (55% gap)
- Commission agents must pay farmers within **48 hours** but buyers pay in **30-90 days**
- Middlemen cuts comprise up to **75% of agricultural price spread**

## Tax Compliance

- GST registration mandatory if turnover exceeds **₹20 lakh**
- IT Department using **AI-powered reconciliation** to catch ITR-GST mismatches
- Penalty for non-compliance: **₹10,000 minimum** per instance

## Sources

- [Post-Harvest Losses in India - StarAgri](https://www.staragri.com/why-india-loses-crops-after-harvest-and-how-technology-can-prevent-it/)
- [India&#39;s Highest Post-Harvest Losses - Global Agriculture](https://www.global-agriculture.com/india-region/indias-highest-post-harvest-losses-guava-and-tomato-among-the-worst-hit/)
- [Post-Harvest Losses 4-8% grains, 5-15% fruits - Down To Earth](https://www.downtoearth.org.in/governance/as-told-to-parliament-august-6-2024-4-8-grains-5-15-fruits-vegetables-lost-after-harvest)
- [Food Loss $17.7 Billion - National Economic Forum](https://nationaleconomicforum.org/nef_articles/addressing-post-harvest-losses-in-india-a-silent-crisis-in-agriculture/)
- [Middlemen in Indian Agriculture - DRKB](https://www.drkb.in/middlemen-in-indian-agriculture/)
- [Commission Agent System - ResearchGate](https://www.researchgate.net/publication/294521228_The_status_of_commission_agent_system_in_Punjab_agriculture)
- [Punjab Arhatiyas Payment System - ThePrint](https://theprint.in/india/easy-money-cycle-of-debt-why-punjabs-farmers-cant-get-out-of-the-clutches-of-arhatiyas/584102/)
- [ITR Filing Guide for Mandi Traders 2025 - SSCO India](https://www.sscoindia.com/blog/itr-filing-fruit-wholesalers-mandi-traders-2025)
- [GST Impact on Agriculture - ClearTax](https://cleartax.in/s/impact-of-gst-on-agricultural-sector)
- [Agri Supply Chain Challenges - Pazago](https://blog.pazago.com/post/agriculture-supply-chain-management-challenges-opportunities)
- [Information Asymmetry and Middleman Margins - IGC Working Paper](https://www.theigc.org/sites/default/files/2015/02/Mitra-Et-Al-2012-Working-Paper.pdf)
