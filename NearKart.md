# NearKart

> India's first real-time local retail discovery platform — find any product at any local shop near you, instantly.

---

## Problem Statement

47% of Gen Z can't find local businesses. 13M+ kirana and local shops in India have zero digital presence. Customers either waste hours walking shop-to-shop or default to online ordering with long delivery times. Small retailers lose customers daily to Amazon, Flipkart, and quick-commerce platforms — not because they don't have the product, but because nobody knows they do.

**There is no app that answers: "Which shop near me has this product, at what price, right now?"**

---

## The Aim

To build India's first real-time local retail discovery platform that connects consumers with nearby shops through live product availability and pricing — making local shopping as convenient as online, while empowering small retailers to compete in the digital age.

---

## How It Works

### For Shoppers
1. Search for a product (e.g., "wireless earbuds under ₹1500")
2. See nearby shops that have it — with prices, distance, ratings
3. Compare prices across shops
4. Get directions, call the shop, or reserve the item
5. Walk in, buy it, done in 15 minutes

### For Shop Owners
1. List products via app, WhatsApp bot, voice note, or shelf photo (AI reads it)
2. Set prices, mark items in/out of stock
3. See how many customers viewed their shop
4. Promote listings to appear on top (paid feature)

---

## Tech Stack

| Component            | Technology                                    |
|----------------------|-----------------------------------------------|
| Shopper App          | React Native (iOS + Android)                  |
| Shop Owner App       | React Native (lite version) + WhatsApp Bot    |
| Backend API          | Node.js + Express                             |
| Database             | PostgreSQL + PostGIS (geolocation queries)     |
| Cache                | Redis                                         |
| AI Layer             | Python (image recognition, voice-to-text)      |
| Maps                 | Google Maps SDK                               |
| Notifications        | Firebase Cloud Messaging                      |
| WhatsApp Bot         | Twilio / WhatsApp Business API                |

---

## Two Apps, One Backend

### App 1: Shopper App (Consumer)
- Search products by name, category, barcode
- See nearby shops on map with live prices
- Compare prices across multiple shops
- Get directions, call shop, reserve item
- Ratings and reviews
- Save favorite shops, deal alerts

### App 2: Shop Owner App (Retailer)
- Add products via photo (AI reads shelf), voice, or text
- Set/update prices, mark stock status
- View analytics (customer views, searches, leads)
- Promote listings (paid)
- Respond to customer inquiries

### WhatsApp Bot (Fallback for shop owners)
- No app download needed
- Daily nudge: "Are these items still available?"
- Voice note support in Hindi/regional languages
- AI parses product names and prices automatically

---

## Revenue Model

| Stream              | How                                                    |
|---------------------|--------------------------------------------------------|
| Promoted Listings   | Shops pay ₹10-50/day to appear on top in their area   |
| Lead Generation     | Charge ₹2-5 per customer inquiry/direction request     |
| Hyperlocal Ads      | Brands pay to promote products through nearby shops     |
| Reserve & Pickup    | 3-5% commission on reserved orders                     |

---

## Roadmap

### Phase 1 — MVP (Week 1-6)
- One city (Tier-2: Lucknow / Jaipur / Pune)
- One category (electronics / mobile accessories)
- Shopper app: search + nearby shops + prices + directions
- Shop owner app: add products + set prices
- WhatsApp bot for shop owners
- Backend API with geolocation search

### Phase 2 — Expand (Month 3-4)
- Price comparison across shops
- Reserve & pickup feature
- Ratings and reviews
- Expand to 2-3 more product categories

### Phase 3 — Monetize (Month 5-6)
- Launch promoted listings
- Brand partnership ads
- Expand to 2-3 more cities

### Phase 4 — Scale (Month 7-12)
- Pan-India expansion (top 20 cities)
- Hyperlocal marketplace: brands connect directly with local shops
- Delivery integration (optional)
- Become the distribution layer between brands and 13M+ local stores

---

## Success Metrics (6-Month Target)

| Metric                                    | Target     |
|-------------------------------------------|------------|
| Shops onboarded                           | 5,000      |
| Monthly active shoppers                   | 50,000     |
| Products listed                           | 100,000+   |
| Search-to-find success rate               | >60%       |
| Shop owner retention (active after 30d)   | >40%       |
| Revenue                                   | ₹2-5L/month|

---

## Competitive Advantage

| Existing Solution | Why It Fails                                         | NearKart's Edge                        |
|-------------------|------------------------------------------------------|----------------------------------------|
| Google Maps       | Shows shop exists, NOT products/prices               | Product-level search with live prices  |
| JustDial          | Outdated listings, spam calls                        | Real-time, no spam, AI-powered updates |
| Instagram         | Algorithm-dependent, no product search               | Direct product search by name/category |
| Swiggy/Blinkit   | Competes WITH local shops                            | Empowers local shops                   |
| ONDC              | Too complex for small shop owners                    | WhatsApp + voice + photo onboarding    |

---

## Vision

**Become the Google of local shopping** — where every nearby shop is searchable by product, price, and availability in real-time. Turn 13M+ invisible local shops into a searchable, digital-first retail network.
