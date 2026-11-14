from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.models.user import User
from backend.app.models.budget import Budget
from backend.app.models.goal import Goal
from backend.app.schemas.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with isolated financial ledger and defaults."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_pwd = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        currency=user_in.currency or "$",
        monthly_income=user_in.monthly_income or 6500.0,
        risk_profile="Balanced"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed baseline budgets & goals for this new user
    sample_budgets = [
        ("Housing & Rent", user.monthly_income * 0.30),
        ("Groceries", 600.0),
        ("Utilities & Bills", 300.0),
        ("Dining & Food Delivery", 350.0),
        ("Shopping & Electronics", 300.0),
        ("Entertainment & Subscriptions", 100.0),
        ("Transportation & Fuel", 250.0),
        ("Investments & Savings", user.monthly_income * 0.15),
        ("Loans & Debt EMI", 350.0)
    ]
    for cat_name, limit in sample_budgets:
        b = Budget(
            user_id=user.id,
            category_name=cat_name,
            monthly_limit=round(limit, 2),
            period="monthly"
        )
        db.add(b)

    sample_goals = [
        Goal(
            user_id=user.id,
            title="3-Month Emergency Cushion",
            target_amount=round(user.monthly_income * 1.5, 2),
            current_amount=round(user.monthly_income * 0.5, 2),
            target_date=datetime.utcnow() + timedelta(days=120),
            category="Emergency",
            status="active"
        ),
        Goal(
            user_id=user.id,
            title="Annual Holiday Trip",
            target_amount=2500.0,
            current_amount=800.0,
            target_date=datetime.utcnow() + timedelta(days=180),
            category="Vacation",
            status="active"
        )
    ]
    for g in sample_goals:
        db.add(g)

    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    if not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return UserResponse.model_validate(user)
