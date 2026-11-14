from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
import uuid
from backend.app.db.session import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(String, primary_key=True, default=lambda: f"bdg_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, nullable=False, index=True)
    category_name = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    period = Column(String, default="monthly") # 'monthly', '2026-11'
    created_at = Column(DateTime, default=datetime.utcnow)
