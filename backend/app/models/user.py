from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
import uuid
from backend.app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    name = Column(String, nullable=False, default="Alex Mercer")
    email = Column(String, unique=True, index=True, nullable=False, default="user@finpilot.io")
    hashed_password = Column(String, nullable=True)
    currency = Column(String, default="₹")
    monthly_income = Column(Float, default=6500.0)
    risk_profile = Column(String, default="Balanced") # Conservative, Balanced, Growth, Aggressive
    created_at = Column(DateTime, default=datetime.utcnow)
