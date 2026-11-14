from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.models.transaction import Transaction
from backend.app.models.user import User
from backend.app.models.budget import Budget
from backend.app.schemas.schemas import ChatRequest, ChatResponse
from backend.app.services.ai_advisor import ai_advisor_service
from backend.app.services.health_scoring import health_scoring_engine
from backend.app.services.forecaster import cash_flow_forecaster

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_with_advisor(req: ChatRequest, db: Session = Depends(get_db)):
    """Interactive conversational Co-Pilot answering user questions with live financial context."""
    user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    income = user.monthly_income if user else 6500.0

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    txns_30d = db.query(Transaction).filter(
        Transaction.user_id == settings.DEMO_USER_ID,
        Transaction.date >= thirty_days_ago
    ).all()

    total_expense = sum(t.amount for t in txns_30d if t.type == "debit")
    net_savings = max(0.0, income - total_expense)
    savings_rate = (net_savings / income * 100.0) if income > 0 else 0.0

    # Category breakdown
    cat_spending = {}
    for t in txns_30d:
        if t.type == "debit":
            cat_spending[t.category_name] = cat_spending.get(t.category_name, 0.0) + t.amount

    top_categories = [
        {"name": k, "amount": round(v, 2), "percentage": round((v / (total_expense or 1)) * 100.0, 1)}
        for k, v in sorted(cat_spending.items(), key=lambda x: x[1], reverse=True)
    ]

    # Balance
    all_credits = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == settings.DEMO_USER_ID, Transaction.type == "credit").all())
    all_debits = sum(t.amount for t in db.query(Transaction).filter(Transaction.user_id == settings.DEMO_USER_ID, Transaction.type == "debit").all())
    current_balance = (all_credits - all_debits) if all_credits > all_debits else 4250.0

    # Anomalies
    anomalies = [
        {"merchant": t.clean_merchant, "amount": t.amount, "date": t.date.strftime("%b %d"), "reason": t.anomaly_reason}
        for t in db.query(Transaction).filter(Transaction.user_id == settings.DEMO_USER_ID, Transaction.is_anomaly == True).limit(5).all()
    ]

    # Health Score
    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == settings.DEMO_USER_ID).all()}
    health_res = health_scoring_engine.compute(
        monthly_income=income,
        monthly_expense=total_expense,
        category_spending=cat_spending,
        budgets=budgets,
        savings_balance=current_balance,
        debt_payments=cat_spending.get("Loans & Debt EMI", 0.0)
    )

    # Recurring bills
    txn_records = [{"date": t.date, "clean_merchant": t.clean_merchant, "amount": t.amount, "type": t.type, "category_name": t.category_name} for t in txns_30d]
    recurring = cash_flow_forecaster.detect_recurring_bills(txn_records)

    context = {
        "monthly_income": income,
        "current_month_expense": total_expense,
        "net_savings": net_savings,
        "savings_rate": savings_rate,
        "current_balance": current_balance,
        "health_score": health_res["total_score"],
        "health_grade": health_res["grade"],
        "top_categories": top_categories,
        "anomalies": anomalies,
        "recurring_bills": recurring
    }

    history_dicts = [{"role": m.role, "content": m.content} for m in (req.history or [])]
    result = ai_advisor_service.answer_query(
        user_message=req.message,
        user_context=context,
        history=history_dicts
    )

    return ChatResponse(
        reply=result["reply"],
        suggested_actions=result.get("suggested_actions", []),
        relevant_metrics=result.get("relevant_metrics")
    )
