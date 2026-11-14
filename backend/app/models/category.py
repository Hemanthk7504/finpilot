from sqlalchemy import Column, String
import uuid
from backend.app.db.session import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: f"cat_{uuid.uuid4().hex[:8]}")
    name = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=False) # 'income', 'essential', 'discretionary', 'investment', 'debt'
    icon = Column(String, default="Tag")
    color = Column(String, default="#6366F1")
