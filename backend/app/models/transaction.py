from sqlalchemy import Column, String, Float, DateTime, Boolean
from datetime import datetime
import uuid
from backend.app.db.session import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: f"txn_{uuid.uuid4().hex[:12]}")
    user_id = Column(String, nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    raw_narration = Column(String, nullable=False)
    clean_merchant = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # 'debit' or 'credit'
    category_name = Column(String, nullable=False, default="Miscellaneous", index=True)
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String, nullable=True)
    is_recurring = Column(Boolean, default=False)
    source_file = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
