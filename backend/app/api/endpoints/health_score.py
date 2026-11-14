from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.models.user import User
from backend.app.models.health_score import HealthScore
from backend.app.schemas.schemas import HealthScoreOut
from backend.app.services.health_scoring import health_scoring_engine

router = APIRouter()

@router.get("", response_model=HealthScoreOut)
def get_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch transparent, multi-pillar Financial Health Score and actionable advice."""
    user = current_user
    monthly_income = user.monthly_income if user else 6500.0

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    # 30-day transactions
    txns_30d = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= thirty_days_ago
    ).all()

    total_expense = sum(t.amount for t in txns_30d if t.type == "debit")
    cat_spending = {}
    for t in txns_30d:
        if t.type == "debit":
            cat_spending[t.category_name] = cat_spending.get(t.category_name, 0.0) + t.amount

    # Total liquid balance
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
        current_balance = 5420.0

    # Budgets
    budgets = {b.category_name: b.monthly_limit for b in db.query(Budget).filter(Budget.user_id == current_user.id).all()}
    debt_spend = cat_spending.get("Loans & Debt EMI", 0.0)

    result = health_scoring_engine.compute(
        monthly_income=monthly_income,
        monthly_expense=total_expense,
        category_spending=cat_spending,
        budgets=budgets,
        savings_balance=current_balance,
        debt_payments=debt_spend
    )

    # Record to historical score table
    record = HealthScore(
        user_id=current_user.id,
        total_score=result["total_score"],
        grade=result["grade"],
        savings_score=result["pillars"][0]["score"],
        budget_score=result["pillars"][1]["score"],
        runway_score=result["pillars"][2]["score"],
        debt_score=result["pillars"][3]["score"],
        volatility_score=result["pillars"][4]["score"],
        insights_json=json.dumps(result["actionable_recommendations"])
    )
    db.add(record)
    db.commit()

    # Historical trend for visual charting
    history = db.query(HealthScore).filter(
        HealthScore.user_id == current_user.id
    ).order_by(HealthScore.created_at.desc()).limit(7).all()

    trend = [
        {
            "date": h.created_at.strftime("%b %d"),
            "score": h.total_score
        }
        for h in reversed(history)
    ]

    return HealthScoreOut(
        total_score=result["total_score"],
        grade=result["grade"],
        rating_title=result["rating_title"],
        summary=result["summary"],
        pillars=result["pillars"],
        actionable_recommendations=result["actionable_recommendations"],
        historical_trend=trend
    )
