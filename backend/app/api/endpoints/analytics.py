from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, Any, List
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.models.user import User
from backend.app.services.categorizer import categorizer
from backend.app.services.forecaster import cash_flow_forecaster
from backend.app.services.health_scoring import health_scoring_engine

router = APIRouter()

@router.get("/overview")
def get_financial_overview(db: Session = Depends(get_db)):
    """Fetch high-level KPI cards and current monthly financial health snapshot."""
    user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    monthly_income = user.monthly_income if user else 6500.0

    now = datetime.utcnow()
    # Calculate for current 30-day window
    thirty_days_ago = now - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.date >= thirty_days_ago
    ).all()

    total_inflow = sum(t.amount for t in txns if t.type == "credit")
    total_outflow = sum(t.amount for t in txns if t.type == "debit")

    if total_inflow == 0:
        total_inflow = monthly_income

    net_savings = total_inflow - total_outflow
    savings_rate = (net_savings / total_inflow * 100.0) if total_inflow > 0 else 0.0

    # Running total balance calculation
    all_credits = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.type == "credit"
    ).all()
    all_debits = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.type == "debit"
    ).all()

    current_balance = sum(t.amount for t in all_credits) - sum(t.amount for t in all_debits)
    if current_balance <= 0:
        current_balance = 5420.0 # Realistic demo balance fallback

    # Anomalies count
    anomaly_count = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.is_anomaly == True
    ).count()

    # Category spend dictionary for health score
    cat_spending = {}
    for t in txns:
        if t.type == "debit":
            cat_spending[t.category_name] = cat_spending.get(t.category_name, 0.0) + t.amount

    # Budgets
    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == settings.DEMO_USER_ID).all()}

    # Debt payments
    debt_spend = cat_spending.get("Loans & Debt EMI", 0.0)

    # Health score
    health_result = health_scoring_engine.compute(
        monthly_income=monthly_income,
        monthly_expense=total_outflow,
        category_spending=cat_spending,
        budgets=budgets,
        savings_balance=current_balance,
        debt_payments=debt_spend
    )

    return {
        "monthly_income": round(monthly_income, 2),
        "total_inflow_30d": round(total_inflow, 2),
        "total_outflow_30d": round(total_outflow, 2),
        "net_savings_30d": round(net_savings, 2),
        "savings_rate": round(savings_rate, 1),
        "current_balance": round(current_balance, 2),
        "health_score": health_result["total_score"],
        "health_grade": health_result["grade"],
        "health_title": health_result["rating_title"],
        "anomaly_count": anomaly_count,
        "currency": user.currency if user else "$"
    }

@router.get("/categories")
def get_category_breakdown(db: Session = Depends(get_db)):
    """Category spending summary with 50/30/20 budget framework compliance."""
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.type == "debit",
        Transaction.date >= thirty_days_ago
    ).all()

    cat_totals = {}
    for t in txns:
        cat_totals[t.category_name] = cat_totals.get(t.category_name, 0.0) + t.amount

    total_debit = sum(cat_totals.values()) or 1.0

    category_list = []
    # 50/30/20 groupings: Needs, Wants, Savings/Investments, Debt
    rule_50_30_20 = {
        "needs": 0.0,
        "wants": 0.0,
        "savings": 0.0,
        "debt": 0.0
    }

    for cat_name, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
        meta = categorizer.get_category_meta(cat_name)
        c_type = meta.get("type", "discretionary")
        category_list.append({
            "name": cat_name,
            "amount": round(amt, 2),
            "percentage": round((amt / total_debit) * 100.0, 1),
            "type": c_type,
            "icon": meta.get("icon", "Tag"),
            "color": meta.get("color", "#6366F1")
        })

        if c_type == "essential":
            rule_50_30_20["needs"] += amt
        elif c_type == "discretionary":
            rule_50_30_20["wants"] += amt
        elif c_type == "investment":
            rule_50_30_20["savings"] += amt
        elif c_type == "debt":
            rule_50_30_20["debt"] += amt

    user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    income = user.monthly_income if user else 6500.0

    return {
        "total_spend": round(total_debit, 2),
        "categories": category_list,
        "framework_50_30_20": {
            "needs_actual_percent": round((rule_50_30_20["needs"] / income) * 100.0, 1),
            "wants_actual_percent": round((rule_50_30_20["wants"] / income) * 100.0, 1),
            "savings_actual_percent": round(((rule_50_30_20["savings"] + max(0, income - total_debit)) / income) * 100.0, 1),
            "needs_target_percent": 50.0,
            "wants_target_percent": 30.0,
            "savings_target_percent": 20.0,
            "amounts": {
                "needs": round(rule_50_30_20["needs"], 2),
                "wants": round(rule_50_30_20["wants"], 2),
                "savings": round(rule_50_30_20["savings"], 2),
                "debt": round(rule_50_30_20["debt"], 2)
            }
        }
    }

@router.get("/cashflow")
def get_cashflow_trends(db: Session = Depends(get_db)):
    """Monthly and weekly inflow vs outflow aggregation."""
    all_txns = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID
    ).all()

    if not all_txns:
        return {"monthly": [], "weekly": []}

    records = [
        {
            "date": t.date,
            "amount": t.amount,
            "type": t.type
        }
        for t in all_txns
    ]
    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df["month_year"] = df["date"].dt.strftime("%Y-%m")
    df["month_label"] = df["date"].dt.strftime("%b %Y")

    monthly_summary = []
    for (m_key, m_label), group in df.groupby(["month_year", "month_label"]):
        inflow = group[group["type"] == "credit"]["amount"].sum()
        outflow = group[group["type"] == "debit"]["amount"].sum()
        monthly_summary.append({
            "period": m_key,
            "label": m_label,
            "inflow": round(float(inflow), 2),
            "outflow": round(float(outflow), 2),
            "net": round(float(inflow - outflow), 2)
        })

    monthly_summary.sort(key=lambda x: x["period"])
    return {"monthly": monthly_summary}

@router.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    """Generate 30-day predictive daily cash balance and expense forecast."""
    all_txns = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID
    ).all()

    records = [
        {
            "date": t.date,
            "clean_merchant": t.clean_merchant,
            "raw_narration": t.raw_narration,
            "amount": t.amount,
            "type": t.type,
            "category_name": t.category_name
        }
        for t in all_txns
    ]

    user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    income = user.monthly_income if user else 6500.0

    # Calculate balance
    credits_sum = sum(r["amount"] for r in records if r["type"] == "credit")
    debits_sum = sum(r["amount"] for r in records if r["type"] == "debit")
    current_balance = (credits_sum - debits_sum) if credits_sum > debits_sum else 4250.0

    return cash_flow_forecaster.generate_30day_forecast(
        transactions=records,
        current_balance=current_balance,
        monthly_income=income
    )

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    """List of flagged anomalies and suspicious transactions."""
    txns = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.is_anomaly == True
    ).order_by(Transaction.date.desc()).all()

    return [
        {
            "id": t.id,
            "date": t.date.strftime("%Y-%m-%d"),
            "merchant": t.clean_merchant,
            "raw_narration": t.raw_narration,
            "amount": t.amount,
            "category": t.category_name,
            "reason": t.anomaly_reason or "Statistical outlier detected."
        }
        for t in txns
    ]
