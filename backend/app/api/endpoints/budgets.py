from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.budget import Budget
from backend.app.models.goal import Goal
from backend.app.models.transaction import Transaction
from backend.app.schemas.schemas import BudgetOut, BudgetCreate, GoalOut, GoalCreate, GoalUpdate

router = APIRouter()

# --- BUDGET ENDPOINTS ---

@router.get("/budgets", response_model=List[BudgetOut])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch user budgets with dynamic real-time spending progress."""
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    # Compute actual spend per category in last 30 days
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "debit",
        Transaction.date >= thirty_days_ago
    ).all()

    spending_map = {}
    for t in txns:
        spending_map[t.category_name] = spending_map.get(t.category_name, 0.0) + t.amount

    result = []
    for b in budgets:
        spent = spending_map.get(b.category_name, 0.0)
        pct = (spent / b.monthly_limit * 100.0) if b.monthly_limit > 0 else 0.0
        
        status = "normal"
        if pct >= 100.0:
            status = "exceeded"
        elif pct >= 80.0:
            status = "warning"

        result.append(BudgetOut(
            id=b.id,
            user_id=b.user_id,
            category_name=b.category_name,
            monthly_limit=b.monthly_limit,
            period=b.period,
            spent_amount=round(spent, 2),
            percentage=round(pct, 1),
            status=status
        ))

    return result

@router.post("/budgets", response_model=BudgetOut)
def set_budget(
    b_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update category monthly budget limit."""
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_name == b_in.category_name
    ).first()

    if existing:
        existing.monthly_limit = b_in.monthly_limit
        existing.period = b_in.period or "monthly"
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        target = Budget(
            user_id=current_user.id,
            category_name=b_in.category_name,
            monthly_limit=b_in.monthly_limit,
            period=b_in.period or "monthly"
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    return BudgetOut(
        id=target.id,
        user_id=target.user_id,
        category_name=target.category_name,
        monthly_limit=target.monthly_limit,
        period=target.period,
        spent_amount=0.0,
        percentage=0.0,
        status="normal"
    )

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
    return {"message": "Budget removed successfully"}

# --- GOALS ENDPOINTS ---

@router.get("/goals", response_model=List[GoalOut])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch savings goals with calculated monthly required contribution and progress."""
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    now = datetime.utcnow()
    results = []

    for g in goals:
        progress = (g.current_amount / g.target_amount * 100.0) if g.target_amount > 0 else 0.0
        remaining = max(0.0, g.target_amount - g.current_amount)
        
        # Monthly required calculation
        if g.target_date and g.target_date > now:
            months_left = max(1, (g.target_date - now).days / 30.0)
            monthly_req = remaining / months_left
        else:
            monthly_req = remaining / 6.0 # Default 6 month horizon

        results.append(GoalOut(
            id=g.id,
            user_id=g.user_id,
            title=g.title,
            target_amount=g.target_amount,
            current_amount=g.current_amount,
            target_date=g.target_date,
            category=g.category,
            status=g.status,
            monthly_required=round(monthly_req, 2),
            progress_percentage=round(min(100.0, progress), 1),
            created_at=g.created_at
        ))

    return results

@router.post("/goals", response_model=GoalOut)
def create_goal(
    g_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = Goal(
        user_id=current_user.id,
        title=g_in.title,
        target_amount=g_in.target_amount,
        current_amount=g_in.current_amount or 0.0,
        target_date=g_in.target_date,
        category=g_in.category or "General",
        status="active"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    now = datetime.utcnow()
    remaining = max(0.0, goal.target_amount - goal.current_amount)
    months_left = max(1, (goal.target_date - now).days / 30.0) if goal.target_date and goal.target_date > now else 6.0
    monthly_req = remaining / months_left

    return GoalOut(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        category=goal.category,
        status=goal.status,
        monthly_required=round(monthly_req, 2),
        progress_percentage=round((goal.current_amount / goal.target_amount * 100.0), 1),
        created_at=goal.created_at
    )

@router.put("/goals/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: str,
    g_up: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if g_up.current_amount is not None:
        goal.current_amount = g_up.current_amount
    if g_up.target_amount is not None:
        goal.target_amount = g_up.target_amount
    if g_up.status is not None:
        goal.status = g_up.status

    # Mark completed if reached
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"

    db.commit()
    db.refresh(goal)

    now = datetime.utcnow()
    remaining = max(0.0, goal.target_amount - goal.current_amount)
    months_left = max(1, (goal.target_date - now).days / 30.0) if goal.target_date and goal.target_date > now else 6.0
    monthly_req = remaining / months_left

    return GoalOut(
        id=goal.id,
        user_id=goal.user_id,
        title=goal.title,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        category=goal.category,
        status=goal.status,
        monthly_required=round(monthly_req, 2),
        progress_percentage=round(min(100.0, (goal.current_amount / goal.target_amount * 100.0)), 1),
        created_at=goal.created_at
    )

@router.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal removed successfully"}
