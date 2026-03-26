# NearKart

Real-time local retail discovery platform. Search products at shops near you.

## Architecture

- **Mobile**: Expo + Expo Router (file-based routing, role switching: shopper/owner)
- **Web**: Next.js (landing page + future web app)
- **API**: FastAPI + PostgreSQL/PostGIS
- **Auth**: Firebase Auth (phone OTP)

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL with PostGIS extension
- Firebase project (for auth)

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Web App

```bash
cd web
npm install
npm run dev
```

### API Server

```bash
cd api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit with your DB credentials
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

### Database Setup

```sql
CREATE DATABASE nearkart;
\c nearkart
CREATE EXTENSION postgis;
```

Then run migrations:

```bash
cd api
alembic upgrade head
```

## Project Structure

```
nearkart/
├── mobile/          # Expo app (expo-router)
│   ├── app/         # File-based routes
│   │   ├── (auth)/  # Login/OTP screens
│   │   ├── (shopper)/ # Search, map, favorites, profile
│   │   └── (owner)/   # Products, analytics, profile
│   ├── components/  # Shared components
│   └── lib/         # API client, firebase config
├── web/             # Next.js app
│   └── app/         # App router (landing page)
├── api/             # FastAPI backend
│   ├── app/
│   │   ├── core/    # Config, DB, security
│   │   ├── routers/ # Auth, shops, products, search
│   │   ├── models/  # SQLAlchemy + PostGIS models
│   │   ├── schemas/ # Pydantic schemas
│   │   └── services/ # Business logic
│   └── alembic/     # DB migrations
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP to phone |
| POST | /api/auth/verify-otp | Verify OTP code |
| POST | /api/shops/ | Create a shop |
| GET | /api/shops/{id} | Get shop details |
| PUT | /api/shops/{id} | Update shop |
| POST | /api/products/shops/{id}/products | Add product to shop |
| GET | /api/products/nearby | Search products by location |
| GET | /api/products/{id} | Get product details |
| GET | /api/search/ | Full-text + geo search |
