from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.transaction import Transaction
from backend.app.models.user import User
from backend.app.models.goal import Goal
from backend.app.models.budget import Budget
from backend.app.models.alert import Alert
from backend.app.services.health_scoring import health_scoring_engine
from backend.app.services.forecaster import cash_flow_forecaster

router = APIRouter()

@router.get("/summary")
def get_report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Comprehensive financial health report summary for printable / exportable view."""
    user = current_user
    income = user.monthly_income if user else 6500.0

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= thirty_days_ago
    ).all()

    total_inflow = sum(t.amount for t in txns if t.type == "credit") or income
    total_outflow = sum(t.amount for t in txns if t.type == "debit")
    net_savings = total_inflow - total_outflow

    cat_map = {}
    for t in txns:
        if t.type == "debit":
            cat_map[t.category_name] = cat_map.get(t.category_name, 0.0) + t.amount

    all_credits = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == current_user.id, Transaction.type == "credit").all())
    all_debits = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == current_user.id, Transaction.type == "debit").all())
    balance = (all_credits - all_debits) if all_credits > all_debits else 4250.0

    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == current_user.id).all()}
    health_res = health_scoring_engine.compute(
        monthly_income=income,
        monthly_expense=total_outflow,
        category_spending=cat_map,
        budgets=budgets,
        savings_balance=balance,
        debt_payments=cat_map.get("Loans & Debt EMI", 0.0)
    )

    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    anomalies = db.query(Transaction).filter(Transaction.user_id == current_user.id, Transaction.is_anomaly == True).all()

    return {
        "generated_at": now.strftime("%B %d, %Y - %H:%M UTC"),
        "user_profile": {
            "name": user.name if user else "Alex Mercer",
            "email": user.email if user else "alex.mercer@finpilot.io",
            "currency": (user.currency if user and user.currency and user.currency != "$" else "₹"),
            "monthly_income": income
        },
        "financial_kpis": {
            "monthly_inflow": round(total_inflow, 2),
            "monthly_outflow": round(total_outflow, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate_pct": round((net_savings / total_inflow * 100), 1),
            "liquid_balance": round(balance, 2)
        },
        "health_score": health_res,
        "category_spending": sorted([{"name": k, "amount": round(v, 2)} for k, v in cat_map.items()], key=lambda x: x["amount"], reverse=True),
        "goals": [{"title": g.title, "target": g.target_amount, "current": g.current_amount, "pct": round(g.current_amount/g.target_amount*100, 1)} for g in goals],
        "anomalies_count": len(anomalies)
    }

@router.get("/download-sample-statement")
def download_sample_csv():
    """Download the sample bank statement CSV file for testing statement ingestion."""
    csv_path = os.path.join("backend", "data", "sample_statements", "sample_bank_statement.csv")
    if os.path.exists(csv_path):
        return FileResponse(csv_path, media_type="text/csv", filename="FinPilot_Sample_Bank_Statement.csv")
    return {"error": "Sample file not found"}
