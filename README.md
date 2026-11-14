# FinPilot MAX: An AI-Powered Intelligent Personal Finance Advisor

FinPilot MAX is an enterprise-grade, AI-powered intelligent personal finance platform designed to help users understand, monitor, and optimize their financial activities effectively.

Combining **Machine Learning**, **Predictive Analytics**, **Unsupervised Anomaly Detection**, and **Large Language Models**, FinPilot MAX delivers an interpretable, transparent decision-support system to improve financial wellness and achieve life goals.

---

## 🌟 Key Features

### 1. 📑 Intelligent Bank Statement Parsing & Ingestion
- Ingests **CSV** and **PDF** bank statements with dynamic column identification.
- Automatic text cleaning: strips transaction reference numbers, card terminal identifiers, and payment rail tags to isolate clean merchant names.
- Instant feedback summarizing parsed records, net inflow/outflow, and detected anomalies.

### 2. 🏷️ Multi-Tier Auto-Categorization Engine
- Combines a high-precision regex/keyword rule engine with a calibrated **TF-IDF + Logistic Regression Machine Learning Classifier**.
- Automatically classifies transactions into standardized categories:
  - *Income*: Salary, Dividends, Freelance, Interest.
  - *Needs (Essential)*: Housing & Rent, Groceries, Utilities & Bills, Healthcare, Transportation & Fuel.
  - *Wants (Discretionary)*: Dining & Food Delivery, Shopping & Electronics, Entertainment & Subscriptions, Travel.
  - *Investments & Savings*: Stock/ETF SIP, Mutual Funds, Retirement.
  - *Debt*: Loans, Mortgages, Credit Card EMI.

### 3. 🚨 Anomaly & Fraud Detection Radar
- **Duplicate Charge Detection**: Detects identical debit charges for the same merchant within a 48-hour window.
- **Statistical Outliers**: Evaluates category spending using $Z$-score variance to highlight unusual spikes.
- **Isolation Forest**: Unsupervised ML model scanning for multivariate behavioral outliers.

### 4. 🛡️ Interpretable Financial Health Score (FHS 0–100)
Transparent, 5-pillar composite scoring model inspired by CFPB wellness benchmarks:
1. **Savings Rate (25% weight)**: Benchmark $\ge 20\%$ of net income saved.
2. **Budget Adherence (25% weight)**: Real-time spend tracking within category limits.
3. **Emergency Fund Runway (20% weight)**: 3 to 6 months of essential living expenses covered.
4. **Debt-to-Income Ratio (15% weight)**: Fixed obligations kept below $20\%$.
5. **Spending Volatility & Discretionary Ratio (15% weight)**: Adherence to 50/30/20 guideline.
- Generates **AI Recommendations to Level Up** with estimated point uplifts (e.g., *"+5.0 Score Points"*).

### 5. 📈 Predictive Cash Flow & 30-Day Expense Forecaster
- **Subscription Radar**: Automatically detects recurring billing cycles (e.g. Netflix, Spotify, Rent, Utilities, Car EMI) and projects upcoming due dates.
- **30-Day Forward Trajectory**: Time-series forecast of daily expenses and bank balances with upper and lower confidence intervals.
- Early warning system for projected end-of-month deficits.

### 6. 🎯 Smart Budget Envelopes & Virtual Savings Jars
- Dynamic category budget meters with warning states ($\ge 80\%$ and $\ge 100\%$).
- 50/30/20 Rule compliance visualizer.
- Goal-based savings jars with automated monthly required contribution calculations and quick deposit actions.

### 7. 💹 Personalized Investment Guidance & SIP Simulator
- Risk profile assessment (Conservative, Balanced, Growth).
- Recommended multi-asset allocation (Equities, Debt, Gold, Cash).
- Interactive SIP & compound interest wealth simulator with inflation adjustments.

### 8. 🤖 FinPilot AI Conversational Co-Pilot
- Context-aware intelligent assistant with real-time visibility into the user's accounts.
- Answers queries such as *"Can I afford a $1,200 vacation next month?"*, *"Where did my money go?"*, and *"How to boost my score to 90?"*.
- Works out-of-the-box with a high-accuracy local financial decision engine, with optional Gemini API integration.

---

## 🛠️ Architecture & Tech Stack

```
FINTECH/
├── backend/                  # FastAPI Python 3.11 Backend
│   ├── app/
│   │   ├── api/              # REST Endpoints
│   │   ├── core/             # App Config & Environment
│   │   ├── db/               # SQLAlchemy ORM Session & SQLite Engine
│   │   ├── models/           # Data Models (User, Transaction, Budget, Goal, Alert)
│   │   ├── schemas/          # Pydantic v2 Validation Schemas
│   │   ├── services/         # ML Engine (Parser, Categorizer, Anomaly, Health Score, Forecaster, AI)
│   │   └── main.py           # FastAPI Application Entry
│   ├── data/
│   │   └── sample_statements/ # Sample Bank Statement CSV
│   ├── tests/                # Automated Pytest Suite
│   └── run.py                # Backend Uvicorn Runner
├── frontend/                 # Modern React 19 + Vite 8 + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/       # UI Components (KPIs, Charts, Ledger, Forecaster, AI Drawer)
│   │   ├── services/         # API Client
│   │   └── App.jsx           # Main Dashboard Application
│   └── package.json
├── run_project.py            # Unified One-Click Launcher
└── start.bat                 # Windows Batch Launcher
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Option 1: One-Click Launch (Recommended)
From the root directory, simply run:
```bash
python run_project.py
```
*(On Windows, you can also double-click `start.bat`)*

### Option 2: Running Services Separately

**1. Start Backend:**
```bash
python backend/run.py
```
- API & Swagger Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

**2. Start Frontend:**
```bash
cd frontend
npm run dev
```
- FinPilot MAX Dashboard will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests
Run the test suite verifying statement parsing, categorization, anomaly detection, health scoring, forecasting, and API endpoints:
```bash
pytest backend/tests/test_api.py -v
```

---

## 📜 License
Developed as an intelligent personal finance decision-support platform. All rights reserved.
