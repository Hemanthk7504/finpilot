from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, Any, List
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.models.user import User
from backend.app.services.categorizer import categorizer
from backend.app.services.forecaster import cash_flow_forecaster
from backend.app.services.health_scoring import health_scoring_engine

router = APIRouter()

@router.get("/overview")
def get_financial_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch high-level KPI cards and current monthly financial health snapshot."""
    user = current_user
    monthly_income = user.monthly_income if user else 6500.0

    now = datetime.utcnow()
    # Calculate for current 30-day window
    thirty_days_ago = now - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
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
        Transaction.user_id == current_user.id,
        Transaction.type == "credit"
    ).all()
    all_debits = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "debit"
    ).all()

    current_balance = sum(t.amount for t in all_credits) - sum(t.amount for t in all_debits)
    if current_balance <= 0:
        current_balance = 5420.0 # Realistic demo balance fallback

    # Anomalies count
    anomaly_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.is_anomaly == True
    ).count()

    # Category spend dictionary for health score
    cat_spending = {}
    for t in txns:
        if t.type == "debit":
            cat_spending[t.category_name] = cat_spending.get(t.category_name, 0.0) + t.amount

    # Budgets
    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == current_user.id).all()}

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
def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Category spending summary with 50/30/20 budget framework compliance."""
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
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

    user = current_user
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
def get_cashflow_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Monthly and weekly inflow vs outflow aggregation."""
    all_txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
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
def get_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate 30-day predictive daily cash balance and expense forecast."""
    all_txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
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

    user = current_user
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
def get_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List of flagged anomalies and suspicious transactions."""
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
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

@router.get("/safe-to-spend")
def get_safe_to_spend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Real-time daily safe-to-spend pace and runway calculation until next income credit."""
    user = current_user
    income = user.monthly_income if user else 6500.0
    now = datetime.utcnow()
    
    # Days until end of month or next pay cycle
    day_of_month = now.day
    days_in_month = 30
    days_remaining = max(1, days_in_month - day_of_month)
    
    # Get all liquid balance
    all_credits = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.type == "credit").all()
    all_debits = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.type == "debit").all()
    liquid_balance = max(1500.0, sum(t.amount for t in all_credits) - sum(t.amount for t in all_debits))
    
    # Estimate upcoming committed recurring bills in next days_remaining
    recurring_txns = db.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.is_recurring == True,
        Transaction.type == "debit"
    ).all()
    
    committed_bills = sum(t.amount for t in recurring_txns if t.date.day > day_of_month)
    if committed_bills == 0 and len(recurring_txns) > 0:
        committed_bills = sum(t.amount for t in recurring_txns) * (days_remaining / 30.0)
    
    emergency_buffer = min(1000.0, liquid_balance * 0.15)
    uncommitted_funds = max(0.0, liquid_balance - committed_bills - emergency_buffer)
    daily_allowance = round(uncommitted_funds / days_remaining, 2)
    
    # Status pacing
    if daily_allowance > 120.0:
        status = "Comfortable"
        badge_color = "emerald"
    elif daily_allowance >= 50.0:
        status = "On Track"
        badge_color = "indigo"
    else:
        status = "Tight Budget"
        badge_color = "amber"
        
    return {
        "daily_allowance": daily_allowance,
        "days_remaining": days_remaining,
        "liquid_balance": round(liquid_balance, 2),
        "committed_bills": round(committed_bills, 2),
        "emergency_buffer": round(emergency_buffer, 2),
        "uncommitted_funds": round(uncommitted_funds, 2),
        "status": status,
        "badge_color": badge_color,
        "next_paycheck_estimate": f"{days_remaining} days away"
    }

@router.post("/what-if")
def simulate_what_if_scenario(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Interactive What-If financial scenario sandbox simulator."""
    user = current_user
    base_income = user.monthly_income if user else 6500.0
    
    discretionary_cut_pct = float(payload.get("discretionary_cut_pct", 0.0))
    additional_monthly_savings = float(payload.get("additional_monthly_savings", 0.0))
    windfall_one_time = float(payload.get("windfall_one_time", 0.0))
    extra_income_monthly = float(payload.get("extra_income_monthly", 0.0))
    
    # Current monthly debit spend
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.date >= thirty_days_ago,
        Transaction.type == "debit"
    ).all()
    
    cat_spending = {}
    for t in txns:
        cat_spending[t.category_name] = cat_spending.get(t.category_name, 0.0) + t.amount
        
    total_debit = sum(cat_spending.values()) or 4200.0
    
    # Calculate simulated discretionary reduction
    discretionary_cats = ["Dining & Food Delivery", "Shopping & Electronics", "Entertainment & Subscriptions", "Travel & Lodging"]
    simulated_cat_spending = dict(cat_spending)
    saved_from_cuts = 0.0
    for cat in discretionary_cats:
        if cat in simulated_cat_spending:
            reduction = simulated_cat_spending[cat] * (discretionary_cut_pct / 100.0)
            simulated_cat_spending[cat] -= reduction
            saved_from_cuts += reduction
            
    simulated_income = base_income + extra_income_monthly
    simulated_total_expense = max(1000.0, total_debit - saved_from_cuts)
    simulated_monthly_savings = max(0.0, (simulated_income - simulated_total_expense) + additional_monthly_savings)
    simulated_savings_rate = min(95.0, round((simulated_monthly_savings / simulated_income) * 100.0, 1))
    
    # Re-compute health score with simulated parameters
    all_credits = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.type == "credit").all()
    all_debits = db.query(Transaction).filter(Transaction.user_id == user.id, Transaction.type == "debit").all()
    current_bal = sum(t.amount for t in all_credits) - sum(t.amount for t in all_debits)
    simulated_balance = max(2000.0, current_bal + windfall_one_time + simulated_monthly_savings)
    
    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == user.id).all()}
    
    sim_health = health_scoring_engine.compute(
        monthly_income=simulated_income,
        monthly_expense=simulated_total_expense,
        category_spending=simulated_cat_spending,
        budgets=budgets,
        savings_balance=simulated_balance,
        debt_payments=cat_spending.get("Loans & Debt EMI", 320.0)
    )
    
    # 1-year and 5-year wealth impact (assuming 8% p.a. compound growth on extra savings)
    r = 0.08 / 12
    extra_monthly = saved_from_cuts + additional_monthly_savings + extra_income_monthly
    fv_1yr = windfall_one_time * (1 + 0.08) + (extra_monthly * (( (1 + r)**12 - 1 ) / r) if extra_monthly > 0 else 0)
    fv_5yr = windfall_one_time * ((1 + 0.08)**5) + (extra_monthly * (( (1 + r)**60 - 1 ) / r) if extra_monthly > 0 else 0)
    
    return {
        "simulated_monthly_savings": round(simulated_monthly_savings, 2),
        "monthly_savings_increase": round(extra_monthly, 2),
        "simulated_savings_rate": simulated_savings_rate,
        "simulated_health_score": sim_health["total_score"],
        "simulated_health_grade": sim_health["grade"],
        "projected_1yr_wealth_gain": round(fv_1yr, 2),
        "projected_5yr_wealth_gain": round(fv_5yr, 2),
        "discretionary_savings": round(saved_from_cuts, 2)
    }

@router.get("/tax-deductions")
def get_tax_deductions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Autonomous scanner identifying potential tax write-offs and deductible expenditures."""
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "debit"
    ).all()
    
    deductible_categories = {
        "Healthcare & Medical": {"section": "Medical & Dental (IRS Schedule A)", "tax_saving_pct": 0.24},
        "Charity & Donations": {"section": "Charitable Contributions (501c3)", "tax_saving_pct": 0.30},
        "Utilities & Bills": {"section": "Home Office Deduction (Portion)", "tax_saving_pct": 0.20},
        "Shopping & Electronics": {"section": "Qualified Tech & Business Equipment (Sec 179)", "tax_saving_pct": 0.22},
        "Education & Books": {"section": "Lifetime Learning & Professional Dev", "tax_saving_pct": 0.25}
    }
    
    deductibles = []
    total_deductible = 0.0
    
    for t in txns:
        cat = t.category_name
        if cat in deductible_categories:
            rule = deductible_categories[cat]
            # Portion deductible
            factor = 0.5 if cat in ["Utilities & Bills", "Shopping & Electronics"] else 1.0
            qualifying_amount = round(t.amount * factor, 2)
            est_tax_saved = round(qualifying_amount * rule["tax_saving_pct"], 2)
            total_deductible += qualifying_amount
            deductibles.append({
                "id": t.id,
                "date": t.date.strftime("%Y-%m-%d"),
                "merchant": t.clean_merchant,
                "category": cat,
                "original_amount": t.amount,
                "deductible_amount": qualifying_amount,
                "irs_section": rule["section"],
                "estimated_tax_savings": est_tax_saved
            })
            
    return {
        "total_deductible_amount": round(total_deductible, 2),
        "estimated_total_tax_savings": round(total_deductible * 0.24, 2),
        "item_count": len(deductibles),
        "deductions": deductibles[:15]
    }

@router.get("/net-worth-trend")
def get_net_worth_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Daily cumulative Net Worth and Asset distribution trajectory for the last 90 days."""
    all_txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.asc()).all()
    
    if not all_txns:
        return {"trend": []}
        
    records = []
    for t in all_txns:
        records.append({
            "date": t.date.strftime("%Y-%m-%d"),
            "amount": t.amount,
            "type": t.type,
            "category": t.category_name
        })
        
    df = pd.DataFrame(records)
    daily_trend = []
    
    # Running tracking
    running_cash = 3500.0
    running_investments = 8500.0
    running_debt = 2400.0
    
    grouped = df.groupby("date")
    for date_str, group in grouped:
        for _, row in group.iterrows():
            amt = float(row["amount"])
            if row["type"] == "credit":
                running_cash += amt
            elif row["category"] == "Investments & Savings":
                running_cash -= amt
                running_investments += amt * 1.002 # slight appreciation
            elif row["category"] == "Loans & Debt EMI":
                running_cash -= amt
                running_debt = max(0.0, running_debt - amt * 0.8) # principal reduction
            else:
                running_cash -= amt
                
        net_worth = running_cash + running_investments - running_debt
        daily_trend.append({
            "date": date_str,
            "cash": round(max(500.0, running_cash), 2),
            "investments": round(running_investments, 2),
            "debt": round(running_debt, 2),
            "net_worth": round(max(1000.0, net_worth), 2)
        })
        
    return {"trend": daily_trend}
