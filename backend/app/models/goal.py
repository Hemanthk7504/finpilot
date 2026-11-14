from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
import uuid
from backend.app.db.session import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, default=lambda: f"gol_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=True)
    category = Column(String, default="General") # Emergency, Vacation, Home, Car, Retirement
    status = Column(String, default="active") # 'active', 'completed', 'paused'
    created_at = Column(DateTime, default=datetime.utcnow)
