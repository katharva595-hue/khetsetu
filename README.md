# 🌾 KhetSetu (खेतसेतु)
### AI-Assisted Agricultural Marketplace & Intelligent Procurement Platform

> **"Farm to Family & Factory, Directly"**  
> Based on the Medi-Caps University Software Requirements Specification (SRS) & Smart India Hackathon (SIH Problem Statement SIH26033: *Multiple intermediaries reduce farmers' earnings and increase consumer prices*).

---

## 🌟 Executive Summary & Key Differentiator

Traditional agricultural platforms merely provide static classified ad listings. An institutional buyer (flour mill, food processor, or exporter) needing **1,000 kg of Grade-A Wheat** is forced to manually browse, call, and negotiate with dozens of individual smallholders.

**KhetSetu revolutionizes this with the Intelligent Procurement Matching System:**
1. A buyer submits a bulk demand: **Crop**, **Required Quantity**, **Quality Grade (A/B/C)**, **Max Budget Cap (₹/kg)**, **Max Radius (km)**, and **Delivery Deadline**.
2. KhetSetu's multi-criteria decision algorithm scans active verified farmer listings.
3. It computes **Haversine geo-distances**, verifies harvest readiness, and **aggregates fragmented supply from multiple nearby smallholders** into one single cohesive procurement plan.
4. It calculates weighted average pricing, estimated delivery timeline, remaining shortage (if stock is insufficient, without falsely claiming 100%), and provides an exact explanation for why each farmer was chosen.
5. With 1-click, the buyer confirms the plan and converts it into a multi-party **Order backed by Escrow protection**.

---

## 👥 Demo Login Credentials

The platform is pre-seeded with realistic Indian agricultural data centered around the Malwa/Central India agricultural belt (Indore, Sanwer, Ujjain, Dewas, Dhar).

| Role | Account Name | Email / Identifier | Password | Access Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **🌾 Farmer** | Rameshwar Patel | `farmer@khetsetu.com` | `Farmer@123` | Sanwer village; Sharbati Wheat & Chickpea lots; incoming buyer bids; weather & mandi feeds; AI agronomy diagnosis |
| **🏢 Buyer / Miller** | Vikas Agrawal (Malwa Agro Mills) | `buyer@khetsetu.com` | `Buyer@123` | Indore Central Hub; Intelligent Procurement Matching Engine; active procurement plans; order tracking & escrow |
| **⚙️ Administrator** | SuperAdmin | `admin@khetsetu.com` | `Admin@123` | Real-time analytics computed from DB; KYC verification queue; dispute arbitration; APMC benchmark rate editor |

*💡 Note: The login screen also features 1-click **Demo Login** buttons for instant role switching without typing credentials.*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (AgriTech palette: Deep Agricultural Green `#1b4332`, Leaf Green, Warm Off-White, Golden Accents)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Data Fetching & State**: TanStack Query & Axios
- **Real-Time Client**: Socket.IO Client

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database ORM**: Prisma ORM (Configured out-of-the-box with SQLite `file:./dev.db` for instant zero-dependency execution; full MySQL schema & DDL scripts provided)
- **Authentication**: JWT (JSON Web Tokens) with role-based access control + bcryptjs password hashing + OTP verification architecture
- **Real-Time Communication**: Socket.IO Server for live messaging, bidding, and alerts
- **Meteorology & Data**: Open-Meteo live meteorological satellite API (no API key required) + Agmarknet APMC mandi feeds

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Server Setup
```bash
# Navigate to the server directory
cd server

# Install dependencies (already executed)
npm install

# Push schema to local database
npx prisma db push

# Seed realistic agricultural ecosystem data
npm run seed

# Build and start server
npm run build
npm start
```
*The backend server will run on `http://localhost:5000` with WebSocket support.*

### 2. Frontend Client Setup
```bash
# In a new terminal, navigate to the client directory
cd client

# Install dependencies (already executed)
npm install

# Start Vite development server
npm run dev
```
*The frontend client will open on `http://localhost:5173`.*

---

## 📦 Database Schemas & MySQL Migration

The repository provides both:
1. **Prisma SQLite Schema**: `server/prisma/schema.prisma` (pre-configured for zero-setup execution)
2. **Prisma MySQL Schema**: `server/prisma/schema.mysql.prisma`
3. **Pure MySQL DDL Script**: `schema.mysql.sql`

### Switching to Production MySQL:
In `server/.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/khetsetu"
```
In `server/prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
Then run:
```bash
npx prisma db push
npm run seed
```

---

## 🔑 External Integrations & API Keys

| Integration | Purpose | API Key Status | Fallback / Demo Mode |
| :--- | :--- | :--- | :--- |
| **Open-Meteo Weather API** | Live coordinates-based farm weather & 7-day forecast | **No API key needed** (Open Access) | Calibrated agro-climatic database records if offline |
| **OpenWeatherMap** (Optional) | Alternate weather provider | Optional via `OPENWEATHER_API_KEY` in `.env` | Automatically defaults to Open-Meteo |
| **Agmarknet Mandi Feed** | APMC commodity modal prices | Government open data API (`GOV_DATA_API_KEY`) | Pre-loaded live APMC daily benchmark feed |
| **AI Agronomy Assistant** | Crop disease diagnosis & chemical/biological spray advice | Optional via `AI_GEMINI_API_KEY` | Rule-based Agri-Expert agronomy diagnostic engine |
| **SMS OTP Gateway** | Phone OTP verification | Optional in production | Pre-configured demo OTP mode (`123456` or response-embedded OTP) |

---

## 🧪 Comprehensive Workflow Testing Report

The platform includes an automated integration test script (`server/src/testAllWorkflows.ts`) verifying all 16 SRS workflows:

```bash
cd server
npx tsx src/testAllWorkflows.ts
```

### Test Suite Execution Output:
```text
🧪 Starting KhetSetu End-to-End Workflow Verification Test Suite...

  ✅ [PASS] 1. System Healthcheck API Online
  ✅ [PASS] 2. Farmer Login & JWT Issuance
  ✅ [PASS] 3. Buyer Login & JWT Issuance
  ✅ [PASS] 4. Admin Login & Authorization
  ✅ [PASS] 5. Farmer Create Produce Listing
  ✅ [PASS] 6. Farmer Update Listing Details
  ✅ [PASS] 7. Marketplace Filtering by Crop & Quality Grade

  🌾 Testing Flagship Feature: Multi-Farmer Procurement Aggregation Engine...
  ✅ [PASS] 8. Multi-Farmer Intelligent Procurement Matching (100% Demand Fulfilled from multiple farmers)
  ✅ [PASS] 9. Insufficient Supply Handling (Accurately calculates remaining shortage without claiming 100%)
  ✅ [PASS] 10. Confirm and Save Procurement Plan to DB
  ✅ [PASS] 11. Convert Procurement Plan into Multi-Farmer Order with Secured Escrow
  ✅ [PASS] 12. Buyer Submits Bid on Produce Listing
  ✅ [PASS] 13. Farmer Counters Bid with Custom Offer
  ✅ [PASS] 14. In-App Chat & Messaging
  ✅ [PASS] 15. Weather API Integration & 7-Day Farm Forecast
  ✅ [PASS] 16. Government/APMC Mandi Price Feeds
  ✅ [PASS] 17. AI Agronomy Disease Diagnosis & Guidance Engine
  ✅ [PASS] 18. Order Status Tracking & Escrow Payment Release
  ✅ [PASS] 19. Admin Analytics Calculated from Real DB Records
  ✅ [PASS] 20. Farmer Delete Listing

🎉 Verification Completed: 20 Passed, 0 Failed
```

---

## 📁 Project File Structure

```
khetsetu/
├── client/                     # Vite + React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, DashboardLayout
│   │   ├── context/            # AuthContext (Role-based state & tokens)
│   │   ├── pages/
│   │   │   ├── buyer/          # IntelligentProcurement, Plans, Bids, Orders, Overview
│   │   │   ├── farmer/         # AddProduce, Listings, Bids, Orders, Advisory, Overview
│   │   │   ├── admin/          # AdminOverview, Users, Verifications, Disputes
│   │   │   ├── public/         # LandingPage, Marketplace, HowItWorks, About, Login, Register
│   │   │   └── shared/         # MandiPage, WeatherPage, MessagesPage (Socket.IO)
│   │   ├── services/           # Axios API configuration & Interceptors
│   │   ├── App.tsx             # Protected Route configuration
│   │   └── index.css           # Tailwind CSS
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Active Prisma SQLite schema
│   │   └── schema.mysql.prisma # MySQL Prisma schema
│   ├── src/
│   │   ├── middleware/         # JWT Auth & Role-based Guards
│   │   ├── routes/             # Auth, Listings, Procurement, Bids, Orders, Chat, Weather, Mandi, Admin
│   │   ├── services/           # procurementMatcher.ts (Flagship Multi-Farmer Engine)
│   │   ├── utils/              # distance.ts (Haversine formula in km)
│   │   ├── index.ts            # Express App & Socket.IO WebSockets
│   │   ├── seed.ts             # Rich Indian agricultural demo data seeder
│   │   ├── testMatching.ts     # Dedicated Matching Algorithm verification
│   │   └── testAllWorkflows.ts # 20-Point automated integration test suite
│   ├── .env                    # Active environment variables
│   ├── .env.example            # Environment template
│   └── package.json
│
├── schema.mysql.sql            # Complete MySQL DDL dump script
└── README.md                   # Full documentation & run instructions
```

---

## 🌾 Developed with Pride for Indian Agriculture
**Connecting Annadata (Farmers) directly with Consumers & Enterprises.**
