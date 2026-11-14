import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.services.data_seeder import seed_database_if_empty
from backend.app.services.statement_parser import StatementParser
from backend.app.services.categorizer import categorizer
from backend.app.services.anomaly_detector import anomaly_detector
from backend.app.services.health_scoring import health_scoring_engine
from backend.app.services.forecaster import cash_flow_forecaster

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database_if_empty(db)
    db.close()

def test_api_root():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "FinPilot MAX" in data["service"]
        assert data["status"] == "operational"

def test_statement_parser_csv():
    sample_csv = b"""Date,Description,Amount,Type
2026-11-01,EMPLOYER PAYROLL SALARY,5000.00,CR
2026-11-02,WHOLE FOODS MARKET GROCERY,120.50,DR
2026-11-03,NETFLIX STREAMING,19.99,DR
"""
    txns = StatementParser.parse_csv(sample_csv)
    assert len(txns) == 3
    assert txns[0]["type"] == "credit"
    assert txns[0]["amount"] == 5000.00
    assert txns[1]["type"] == "debit"
    assert txns[1]["amount"] == 120.50

def test_categorizer():
    cat1, conf1 = categorizer.categorize("WHOLE FOODS MARKET GROCERY #421", "Whole Foods Market", "debit")
    assert cat1 == "Groceries"
    assert conf1 > 0.8

    cat2, conf2 = categorizer.categorize("NETFLIX STREAMING SERVICE", "Netflix", "debit")
    assert cat2 == "Entertainment & Subscriptions"

    cat3, conf3 = categorizer.categorize("ACME CORP PAYROLL DIRECT DEPOSIT", "Acme Payroll", "credit")
    assert cat3 == "Salary & Income"

def test_anomaly_detector_duplicate():
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    txns = [
        {"date": now, "raw_narration": "NETFLIX", "clean_merchant": "Netflix", "amount": 19.99, "type": "debit", "category_name": "Entertainment & Subscriptions"},
        {"date": now + timedelta(hours=5), "raw_narration": "NETFLIX", "clean_merchant": "Netflix", "amount": 19.99, "type": "debit", "category_name": "Entertainment & Subscriptions"}
    ]
    analyzed = anomaly_detector.analyze_transactions(txns)
    assert any(t["is_anomaly"] for t in analyzed)

def test_health_scoring_engine():
    res = health_scoring_engine.compute(
        monthly_income=6500.0,
        monthly_expense=3500.0,
        category_spending={"Housing & Rent": 1950.0, "Groceries": 500.0, "Utilities & Bills": 200.0},
        budgets={"Housing & Rent": 2000.0},
        savings_balance=8000.0,
        debt_payments=300.0
    )
    assert 0 <= res["total_score"] <= 100
    assert res["grade"] in ["A+", "A", "B", "C", "D"]
    assert len(res["pillars"]) == 5

def test_get_overview_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/v1/analytics/overview")
        assert res.status_code == 200
        data = res.json()
        assert "health_score" in data
        assert "current_balance" in data

def test_get_forecast_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/v1/analytics/forecast")
        assert res.status_code == 200
        data = res.json()
        assert len(data["forecast_days"]) == 30
        assert "projected_end_of_month_balance" in data

def test_chat_advisor_endpoint():
    with TestClient(app) as client:
        payload = {"message": "Can I afford a $500 laptop next month?"}
        res = client.post("/api/v1/advisor/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        assert len(data["reply"]) > 50
        assert len(data["suggested_actions"]) > 0
