import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.services.data_seeder import seed_database_if_empty

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database_if_empty(db)
    db.close()

def test_demo_login():
    with TestClient(app) as client:
        res = client.post("/api/v1/auth/demo-login")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "alex.mercer@finpilot.io"

def test_register_and_login_user():
    with TestClient(app) as client:
        # Register unique user
        import uuid
        test_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
        reg_payload = {
            "name": "Jordan Bell",
            "email": test_email,
            "password": "Password123!",
            "monthly_income": 8000.0,
            "currency": "$"
        }
        res_reg = client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 200
        token_data = res_reg.json()
        assert "access_token" in token_data
        assert token_data["user"]["name"] == "Jordan Bell"

        # Login with same credentials
        login_payload = {
            "email": test_email,
            "password": "Password123!"
        }
        res_login = client.post("/api/v1/auth/login", json=login_payload)
        assert res_login.status_code == 200
        assert "access_token" in res_login.json()

        # Access /me with token
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        res_me = client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == test_email
