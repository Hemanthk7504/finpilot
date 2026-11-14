from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
import uuid
from backend.app.db.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: f"alt_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="warning") # 'info', 'warning', 'critical'
    type = Column(String, default="anomaly") # 'anomaly', 'budget_overrun', 'bill_due', 'milestone'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
