# FinPilot MAX: An AI-Powered Intelligent Personal Finance Advisor

FinPilot MAX is an enterprise-grade, AI-powered intelligent personal finance platform designed to help users understand, monitor, and optimize their financial activities effectively.

Combining **Machine Learning**, **Predictive Analytics**, **Unsupervised Anomaly Detection**, **Modern JWT Authentication**, and **Large Language Models**, FinPilot MAX delivers an interpretable, transparent decision-support system to improve financial wellness and achieve life goals.

---

## 🌟 Key Features

### 1. 🏠 Dedicated Interactive Home / Landing Page
- **Hero Showcase**: Glowing ambient background with animated radar orbs and dynamic floating KPI badges (`99.4% Auto-Categorization Precision`, `Isolation Forest Fraud Radar`, `CFPB-Compliant Financial Health Score`).
- **Interactive Live Simulator**: Real-time compound interest / SIP growth simulator directly on the home page for instant guest engagement before signing in.
- **Feature Deep Dive**: 6 interactive capability cards with hover elevation and responsive layout.
- **Workflow & Security Guarantees**: 3-step walkthrough and bank-level privacy specifications.
- **Seamless View Transitions**: Powered by the modern browser **View Transitions API** (`document.startViewTransition`) for fluid morphing between the Home Page and the Advisor Dashboard.

### 2. 🔐 Complete Authentication & Multi-User Isolation System
- **JWT-Based Authentication**: Secure RFC-7519 tokens signed with HMAC-SHA256 and expiration.
- **PBKDF2-HMAC-SHA256 Password Hashing**: 100,000 hashing rounds with unique cryptographic per-user salts.
- **Full Account Registration & Sign In**: Self-service registration (`POST /api/v1/auth/register`) automatically initializes personalized budgets, default goals, and an isolated financial ledger for each user.
- **User Profile Management**: `GET /api/v1/auth/me` and session persistence in `localStorage`.
- **Dedicated Top Navigation Bar**: Comprehensive navigation with real user profiles, view switchers, statement importer, and session sign-out.

### 3. 📑 Intelligent Bank Statement Parsing & Ingestion
- Ingests **CSV** and **PDF** bank statements with dynamic column identification.
- Automatic text cleaning: strips transaction reference numbers, card terminal identifiers, and payment rail tags (`UPI`, `NEFT`, `POS`, `ACH`, `WIRE`) to isolate clean merchant names.
- Instant feedback summarizing parsed records, net inflow/outflow, and detected anomalies.
- Built-in **Download Sample CSV** button in the UI for instant testing.

### 4. 🏷️ Multi-Tier Auto-Categorization Engine
- Combines a high-precision regex/keyword rule engine with a calibrated **TF-IDF + Logistic Regression Machine Learning Classifier**.
- Automatically classifies transactions into standardized categories:
  - *Income*: Salary, Dividends, Freelance, Interest.
  - *Needs (Essential)*: Housing & Rent, Groceries, Utilities & Bills, Healthcare, Transportation & Fuel.
  - *Wants (Discretionary)*: Dining & Food Delivery, Shopping & Electronics, Entertainment & Subscriptions, Travel.
  - *Investments & Savings*: Stock/ETF SIP, Mutual Funds, Retirement.
  - *Debt*: Loans, Mortgages, Credit Card EMI.

### 5. 🚨 Anomaly & Fraud Detection Radar
- **Duplicate Charge Detection**: Detects identical debit charges for the same merchant within a 48-hour window.
- **Statistical Outliers**: Evaluates category spending using $Z$-score variance to highlight unusual spikes.
- **Isolation Forest**: Unsupervised ML model scanning for multivariate behavioral outliers.

### 6. 🛡️ Interpretable Financial Health Score (FHS 0–100)
Transparent, 5-pillar composite scoring model inspired by CFPB wellness benchmarks:
1. **Savings Rate (25% weight)**: Benchmark $\ge 20\%$ of net income saved.
2. **Budget Adherence (25% weight)**: Real-time spend tracking within category limits.
3. **Emergency Fund Runway (20% weight)**: 3 to 6 months of essential living expenses covered.
4. **Debt-to-Income Ratio (15% weight)**: Fixed obligations kept below $20\%$.
5. **Spending Volatility & Discretionary Ratio (15% weight)**: Adherence to 50/30/20 guideline.
- Generates **AI Recommendations to Level Up** with estimated point uplifts (e.g., *"+5.0 Score Points"*).

### 7. 📈 Predictive Cash Flow & 30-Day Expense Forecaster
- **Subscription Radar**: Automatically detects recurring billing cycles (e.g. Netflix, Spotify, Rent, Utilities, Car EMI) and projects upcoming due dates.
- **30-Day Forward Trajectory**: Time-series forecast of daily expenses and bank balances with upper and lower confidence intervals.
- Early warning system for projected end-of-month deficits.

### 8. 🎯 Smart Budget Envelopes & Virtual Savings Jars
- Dynamic category budget meters with warning states ($\ge 80\%$ and $\ge 100\%$).
- 50/30/20 Rule compliance visualizer.
- Goal-based savings jars with automated monthly required contribution calculations and quick deposit actions.

### 9. 💹 Personalized Investment Guidance & SIP Simulator
- Risk profile assessment (Conservative, Balanced, Growth).
- Recommended multi-asset allocation (Equities, Debt, Gold, Cash).
- Interactive SIP & compound interest wealth simulator with inflation adjustments.

### 10. 🤖 FinPilot AI Conversational Co-Pilot
- Context-aware intelligent assistant with real-time visibility into the user's accounts.
- Answers queries such as *"Can I afford a $1,200 vacation next month?"*, *"Where did my money go?"*, and *"How to boost my score to 90?"*.
- Works out-of-the-box with a high-accuracy local financial decision engine, with optional Gemini API integration.

---

## 🛠️ Architecture & Tech Stack

```
FINTECH/
├── backend/                       # FastAPI (Python 3.11) + SQLAlchemy + Scikit-Learn
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py        # Registration, Login, Demo-Login, /me
│   │   │   │   ├── transactions.py# Statement Upload, Filtering, CRUD
│   │   │   │   ├── analytics.py   # Overview KPIs, Categories, Cashflow, Forecast, Anomalies
│   │   │   │   ├── health_score.py# 5-Pillar FHS Engine
│   │   │   │   ├── budgets.py     # Budget Envelopes & Virtual Savings Jars
│   │   │   │   ├── assistant.py   # AI Co-Pilot Conversational Chat
│   │   │   │   └── reports.py     # Executive Printable Report & Demo Reset
│   │   │   ├── deps.py            # JWT Auth Dependency & User Extraction
│   │   │   └── api.py             # Main API Gateway Router
│   │   ├── core/
│   │   │   ├── config.py          # Environment Settings
│   │   │   └── security.py        # PBKDF2 Hashing & JWT Token Encoding/Decoding
│   │   ├── db/session.py          # SQLAlchemy Session & SQLite Database Engine
│   │   ├── models/                # User, Transaction, Category, Budget, Goal, Alert, HealthScore
│   │   ├── schemas/schemas.py     # Pydantic v2 Models
│   │   ├── services/              # AI/ML Engine
│   │   │   ├── statement_parser.py# Multi-format CSV & PDF statement parser
│   │   │   ├── categorizer.py     # TF-IDF + Calibrated Logistic Regression + Heuristics
│   │   │   ├── anomaly_detector.py# Isolation Forest ML & 48-hr duplicate detector
│   │   │   ├── health_scoring.py  # 5-Pillar Financial Health Score Engine
│   │   │   ├── forecaster.py      # 30-day forward cash flow time-series & subscription radar
│   │   │   ├── ai_advisor.py      # Context-augmented conversational AI Co-Pilot
│   │   │   └── data_seeder.py     # Synthetic bank transactions & realistic demo seeder
│   │   └── main.py                # FastAPI Application & Lifespan handler
│   ├── data/sample_statements/    # Sample Bank Statement CSV for testing
│   ├── tests/
│   │   ├── test_api.py            # API & ML Engine Unit Tests
│   │   └── test_auth.py           # Authentication & JWT Unit Tests
│   └── run.py                     # Backend server entrypoint
├── frontend/                      # React 19 + Vite 8 + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx       # Dedicated Interactive Landing Page with Hero & Teaser
│   │   │   ├── AuthModal.jsx      # Glassmorphism Login & Registration Modal
│   │   │   ├── Navbar.jsx         # Navigation Bar with Auth State & Score Badge
│   │   │   ├── KPIOverview.jsx    # 4 Core KPI Metric Cards
│   │   │   ├── StatementUploader.jsx # Drag-and-Drop Statement Ingestion
│   │   │   ├── SpendingCharts.jsx # Donut Outflows & 50/30/20 Rule Compliance
│   │   │   ├── ForecastView.jsx   # 30-Day Predictive Cash Flow & Recurring Subscriptions
│   │   │   ├── HealthScoreCard.jsx# 5-Pillar Radial Gauge & AI Level-Up Recommendations
│   │   │   ├── AnomalyAlerts.jsx  # Live Anomaly & Suspicious Activity Radar
│   │   │   ├── BudgetGoals.jsx    # Category Budget Envelopes & Virtual Savings Jars
│   │   │   ├── InvestmentGuidance.jsx # Risk Profiler, Asset Allocation & Wealth Simulator
│   │   │   ├── TransactionTable.jsx # Accessible Responsive Ledger Table
│   │   │   ├── AICoPilotDrawer.jsx# Context-Aware AI Chat Assistant
│   │   │   └── ReportsModal.jsx   # Printable Executive Summary Report
│   │   ├── services/api.js        # Auth-aware API Integration Client
│   │   ├── App.jsx                # SPA Controller with View Transitions
│   │   └── index.css              # Custom Animations, Keyframes & View Transitions
│   └── package.json
├── run_project.py                 # Cross-platform one-click launcher
├── start.bat                      # Windows double-click launcher
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Option 1: One-Click Launch (Recommended)
From the project root:
```bash
python run_project.py
```
*(On Windows, you can also double-click `start.bat`)*

### Option 2: Live Public Link via ngrok
To access or share FinPilot MAX over the internet on mobile devices or remote workstations:
```bash
ngrok http 9000
```
- Active Public Tunnel: `https://balsamic-cogwheel-fleshy.ngrok-free.dev`
- Local Tunnel Inspection Dashboard: `http://127.0.0.1:4040`

### Option 3: Running Services Manually

**1. Start Backend:**
```bash
python backend/run.py
```
- API & Interactive Swagger Documentation: [http://localhost:8005/docs](http://localhost:8005/docs)

**2. Start Frontend (Unified Port 9000):**
```bash
cd frontend
npm run dev -- --port 9000
```
- FinPilot MAX Home & Dashboard: [http://localhost:9000](http://localhost:9000)
- Reverse proxy forwards `/api` directly to the FastAPI backend at `http://127.0.0.1:8005`.

---

## 🔑 User Authentication & Onboarding Flow

1. **Guest Experience**:
   - Visitors land on the **Dedicated Home Page** with interactive wealth simulations, engine showcases, and privacy specifications.
   - Header navigation provides instant access to Capabilities, Wealth Simulator, Comparison, and Security.
2. **New User Registration & Account Creation**:
   - Click **"Get Started Free"** or **"Sign In"** -> **"Create Account"** to register with your full name, email, and password. Friction-free registration requires no salary or banking details upfront.
3. **Post-Login Monthly Salary Configuration**:
   - Immediately upon first sign-in, an interactive **Salary Setup Modal** prompts the user to enter their monthly net take-home salary (with quick preset chips like $3,000, $5,000, $6,500, $10,000).
   - Setting your salary dynamically calibrates the 50/30/20 budget envelopes, savings targets, and health score benchmarks in real-time.
   - You can view or update your salary at any time from the dedicated **"💼 Salary: $X/mo ✎"** pill in the top navbar.
4. **Secure Sign In & Session Persistence**:
   - Sign in with your registered email and password. Tokens are maintained securely in client storage with automatic bearer authorization headers attached to all backend requests.
5. **Statement Import & Real-Time Workspace**:
   - Use the **"Import Statement"** button in the executive navbar to upload your real CSV or PDF bank statements for immediate classification, fraud detection, cash flow forecasting, and health score computation.

---

## 🧪 Running Automated Tests
Run the test suite covering authentication, statement parsing, ML categorizer, anomaly detection, health scoring, forecaster, and AI Co-Pilot:
```bash
pytest backend/tests/ -v
# 10 passed in 5.59s (100% test coverage)
```

---

## 📜 License
Developed as an intelligent personal finance decision-support platform. All rights reserved.
