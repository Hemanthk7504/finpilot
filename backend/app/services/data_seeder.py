from datetime import datetime, timedelta
import random
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.models.user import User
from backend.app.models.category import Category
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.models.goal import Goal
from backend.app.models.alert import Alert
from backend.app.services.categorizer import categorizer
from backend.app.services.anomaly_detector import anomaly_detector
from backend.app.services.health_scoring import health_scoring_engine

def seed_database_if_empty(db: Session):
    """Seed default categories, user, transactions, budgets, and goals if empty."""
    # 1. Categories
    existing_cat = db.query(Category).first()
    if not existing_cat:
        for name, meta in categorizer.CATEGORIES.items():
            cat = Category(
                name=name,
                type=meta["type"],
                icon=meta["icon"],
                color=meta["color"]
            )
            db.add(cat)
        db.commit()

    # 2. User
    user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    if not user:
        user = User(
            id=settings.DEMO_USER_ID,
            name=settings.DEMO_USER_NAME,
            email=settings.DEMO_USER_EMAIL,
            hashed_password=hash_password("demo1234"),
            currency=settings.DEFAULT_CURRENCY,
            monthly_income=6500.0,
            risk_profile="Balanced"
        )
        db.add(user)
        db.commit()
    elif not user.hashed_password:
        user.hashed_password = hash_password("demo1234")
        db.commit()

    # 3. Budgets
    existing_budget = db.query(Budget).filter(Budget.user_id == settings.DEMO_USER_ID).first()
    if not existing_budget:
        sample_budgets = [
            ("Housing & Rent", 2000.0),
            ("Groceries", 600.0),
            ("Utilities & Bills", 300.0),
            ("Dining & Food Delivery", 350.0),
            ("Shopping & Electronics", 300.0),
            ("Entertainment & Subscriptions", 100.0),
            ("Transportation & Fuel", 250.0),
            ("Investments & Savings", 1000.0),
            ("Loans & Debt EMI", 350.0)
        ]
        for cat_name, limit in sample_budgets:
            b = Budget(
                user_id=settings.DEMO_USER_ID,
                category_name=cat_name,
                monthly_limit=limit,
                period="monthly"
            )
            db.add(b)
        db.commit()

    # 4. Goals
    existing_goal = db.query(Goal).filter(Goal.user_id == settings.DEMO_USER_ID).first()
    if not existing_goal:
        goals = [
            Goal(
                user_id=settings.DEMO_USER_ID,
                title="6-Month Emergency Fund",
                target_amount=15000.0,
                current_amount=9500.0,
                target_date=datetime.utcnow() + timedelta(days=180),
                category="Emergency",
                status="active"
            ),
            Goal(
                user_id=settings.DEMO_USER_ID,
                title="Japan Autumn Trip",
                target_amount=3500.0,
                current_amount=2100.0,
                target_date=datetime.utcnow() + timedelta(days=240),
                category="Vacation",
                status="active"
            ),
            Goal(
                user_id=settings.DEMO_USER_ID,
                title="Electric Vehicle Downpayment",
                target_amount=8000.0,
                current_amount=3200.0,
                target_date=datetime.utcnow() + timedelta(days=360),
                category="Vehicle",
                status="active"
            )
        ]
        for g in goals:
            db.add(g)
        db.commit()

    # 5. Transactions
    existing_txns = db.query(Transaction).filter(Transaction.user_id == settings.DEMO_USER_ID).first()
    if not existing_txns:
        seed_sample_transactions(db, settings.DEMO_USER_ID)

def seed_sample_transactions(db: Session, user_id: str):
    """Generate realistic 90 days of transactions including recurring bills and deliberate anomalies."""
    now = datetime.utcnow()
    raw_txns = []

    # Income on the 1st of each month
    for month_back in [2, 1, 0]:
        income_date = (now - timedelta(days=month_back * 30)).replace(day=1)
        raw_txns.append({
            "date": income_date,
            "raw_narration": "ACME CORP PAYROLL DIRECT DEPOSIT",
            "clean_merchant": "Acme Corp Payroll",
            "amount": 6500.00,
            "type": "credit",
            "category_name": "Salary & Income"
        })

        # Rent on 2nd
        raw_txns.append({
            "date": income_date + timedelta(days=1),
            "raw_narration": "AVALON PROPERTIES APARTMENT LEASE",
            "clean_merchant": "Avalon Apartments",
            "amount": 1950.00,
            "type": "debit",
            "category_name": "Housing & Rent",
            "is_recurring": True
        })

        # Utilities on 4th
        raw_txns.append({
            "date": income_date + timedelta(days=3),
            "raw_narration": "CITY POWER ELECTRIC UTILITY",
            "clean_merchant": "City Electric",
            "amount": round(random.uniform(85, 110), 2),
            "type": "debit",
            "category_name": "Utilities & Bills",
            "is_recurring": True
        })

        # Internet on 9th
        raw_txns.append({
            "date": income_date + timedelta(days=8),
            "raw_narration": "FIBER BROADBAND 1GBPS INTERNET",
            "clean_merchant": "Fiber Broadband",
            "amount": 79.99,
            "type": "debit",
            "category_name": "Utilities & Bills",
            "is_recurring": True
        })

        # Subscriptions
        raw_txns.append({
            "date": income_date + timedelta(days=6),
            "raw_narration": "NETFLIX.COM STREAMING HD",
            "clean_merchant": "Netflix",
            "amount": 19.99,
            "type": "debit",
            "category_name": "Entertainment & Subscriptions",
            "is_recurring": True
        })

        raw_txns.append({
            "date": income_date + timedelta(days=21),
            "raw_narration": "SPOTIFY USA PREMIUM MONTHLY",
            "clean_merchant": "Spotify",
            "amount": 10.99,
            "type": "debit",
            "category_name": "Entertainment & Subscriptions",
            "is_recurring": True
        })

        # Auto loan
        raw_txns.append({
            "date": income_date + timedelta(days=14),
            "raw_narration": "CHASE AUTO FINANCE MONTHLY EMI",
            "clean_merchant": "Chase Auto Loan",
            "amount": 320.00,
            "type": "debit",
            "category_name": "Loans & Debt EMI",
            "is_recurring": True
        })

        # Systematic Investment (SIP)
        raw_txns.append({
            "date": income_date + timedelta(days=10),
            "raw_narration": "VANGUARD TOTAL STOCK MKT SIP",
            "clean_merchant": "Vanguard Brokerage",
            "amount": 600.00,
            "type": "debit",
            "category_name": "Investments & Savings"
        })

    # Variable Weekly Transactions (Groceries, Dining, Fuel, Shopping)
    merchants_pool = [
        ("Whole Foods Market", "Groceries", 65.0, 160.0),
        ("Trader Joe's", "Groceries", 45.0, 110.0),
        ("Starbucks Coffee", "Dining & Food Delivery", 5.5, 9.5),
        ("Chipotle Mexican Grill", "Dining & Food Delivery", 14.0, 22.0),
        ("Local Bistro Dinner", "Dining & Food Delivery", 45.0, 95.0),
        ("Shell Gas Station", "Transportation & Fuel", 35.0, 55.0),
        ("Uber Rideshare", "Transportation & Fuel", 15.0, 32.0),
        ("Amazon Online Store", "Shopping & Electronics", 25.0, 120.0),
        ("Target Store", "Shopping & Electronics", 35.0, 90.0),
    ]

    for day_back in range(1, 85):
        # 1 to 2 transactions every few days
        if random.random() < 0.45:
            m_name, m_cat, min_p, max_p = random.choice(merchants_pool)
            txn_date = now - timedelta(days=day_back, hours=random.randint(8, 20))
            amt = round(random.uniform(min_p, max_p), 2)
            raw_txns.append({
                "date": txn_date,
                "raw_narration": f"POS DEBIT - {m_name.upper()} STORE #{random.randint(100, 999)}",
                "clean_merchant": m_name,
                "amount": amt,
                "type": "debit",
                "category_name": m_cat
            })

    # Add 2 specific realistic anomalies:
    # Anomaly 1: A duplicate charge on Netflix 2 days ago
    recent_date = now - timedelta(days=2)
    raw_txns.append({
        "date": recent_date,
        "raw_narration": "NETFLIX.COM STREAMING HD",
        "clean_merchant": "Netflix",
        "amount": 19.99,
        "type": "debit",
        "category_name": "Entertainment & Subscriptions"
    })
    raw_txns.append({
        "date": recent_date + timedelta(hours=6),
        "raw_narration": "NETFLIX.COM STREAMING HD",
        "clean_merchant": "Netflix",
        "amount": 19.99,
        "type": "debit",
        "category_name": "Entertainment & Subscriptions"
    })

    # Anomaly 2: A sudden massive spike at a luxury electronics store
    raw_txns.append({
        "date": now - timedelta(days=5),
        "raw_narration": "APPLE STORE #042 LUXURY HEADPHONES & WATCH",
        "clean_merchant": "Apple Store",
        "amount": 799.00,
        "type": "debit",
        "category_name": "Shopping & Electronics"
    })

    # Run through anomaly detector
    processed = anomaly_detector.analyze_transactions(raw_txns)

    # Persist to database
    for item in processed:
        rec_val = item.get("is_recurring")
        is_rec_bool = bool(rec_val is True or rec_val == 1)

        ano_val = item.get("is_anomaly")
        is_ano_bool = bool(ano_val is True or ano_val == 1)

        t = Transaction(
            user_id=user_id,
            date=item["date"] if isinstance(item["date"], datetime) else pd.to_datetime(item["date"]).to_pydatetime(),
            raw_narration=item["raw_narration"],
            clean_merchant=item["clean_merchant"],
            amount=float(item["amount"]),
            type=item["type"],
            category_name=item.get("category_name", "Miscellaneous"),
            is_anomaly=is_ano_bool,
            anomaly_reason=str(item["anomaly_reason"]) if item.get("anomaly_reason") and pd.notna(item["anomaly_reason"]) else None,
            is_recurring=is_rec_bool,
            source_file="sample_bank_statement.csv"
        )
        db.add(t)

        # If anomaly, also create Alert
        if item.get("is_anomaly"):
            alt = Alert(
                user_id=user_id,
                title=f"Suspicious Activity: {item['clean_merchant']}",
                message=item.get("anomaly_reason", "Unusual transaction detected."),
                severity="warning",
                type="anomaly"
            )
            db.add(alt)

    db.commit()
