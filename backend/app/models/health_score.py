from sqlalchemy import Column, String, Float, DateTime, Text
from datetime import datetime
import uuid
from backend.app.db.session import Base

class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(String, primary_key=True, default=lambda: f"fhs_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, nullable=False, index=True)
    total_score = Column(Float, nullable=False) # 0 to 100
    grade = Column(String, nullable=False) # 'A+', 'A', 'B', 'C', 'D'
    savings_score = Column(Float, nullable=False)
    budget_score = Column(Float, nullable=False)
    runway_score = Column(Float, nullable=False)
    debt_score = Column(Float, nullable=False)
    volatility_score = Column(Float, nullable=False)
    insights_json = Column(Text, nullable=True) # JSON with recommendations & key metrics
    created_at = Column(DateTime, default=datetime.utcnow)
