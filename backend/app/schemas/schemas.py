from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth & User Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    monthly_income: Optional[float] = 6500.0
    currency: Optional[str] = "$"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    currency: str
    monthly_income: float
    risk_profile: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    type: str # 'income', 'essential', 'discretionary', 'investment', 'debt'
    icon: Optional[str] = "Tag"
    color: Optional[str] = "#6366F1"

class CategoryOut(CategoryBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

# Transaction Schemas
class TransactionBase(BaseModel):
    date: datetime
    raw_narration: str
    clean_merchant: str
    amount: float
    type: str # 'debit' or 'credit'
    category_name: str = "Miscellaneous"
    is_anomaly: Optional[bool] = False
    anomaly_reason: Optional[str] = None
    is_recurring: Optional[bool] = False

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    category_name: Optional[str] = None
    clean_merchant: Optional[str] = None
    is_anomaly: Optional[bool] = None

class TransactionOut(TransactionBase):
    id: str
    user_id: str
    source_file: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Budget Schemas
class BudgetBase(BaseModel):
    category_name: str
    monthly_limit: float
    period: Optional[str] = "monthly"

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: str
    user_id: str
    spent_amount: float = 0.0
    percentage: float = 0.0
    status: str = "normal" # 'normal', 'warning' (>=80%), 'exceeded' (>100%)
    model_config = ConfigDict(from_attributes=True)

# Goal Schemas
class GoalBase(BaseModel):
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[datetime] = None
    category: Optional[str] = "General"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    current_amount: Optional[float] = None
    target_amount: Optional[float] = None
    status: Optional[str] = None

class GoalOut(GoalBase):
    id: str
    user_id: str
    status: str
    monthly_required: float = 0.0
    progress_percentage: float = 0.0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Health Score Schemas
class HealthScorePillar(BaseModel):
    name: str
    score: float
    weight: float
    status: str
    benchmark: str
    details: str

class HealthScoreOut(BaseModel):
    total_score: float
    grade: str
    rating_title: str
    summary: str
    pillars: List[HealthScorePillar]
    actionable_recommendations: List[Dict[str, Any]]
    historical_trend: List[Dict[str, Any]] = []

# Analytics & Forecast Schemas
class ForecastDay(BaseModel):
    date: str
    day_label: Optional[str] = None
    predicted_expense: float
    predicted_balance: float
    lower_bound: float
    upper_bound: float
    has_scheduled_bill: bool = False
    bill_name: Optional[str] = None

class ForecastOut(BaseModel):
    current_balance: float
    projected_end_of_month_balance: float
    projected_total_month_expense: float
    forecast_days: List[ForecastDay]
    detected_subscriptions: List[Dict[str, Any]]
    cashflow_health_status: str

# Alert Schemas
class AlertOut(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    type: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# AI Chat Schemas
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    relevant_metrics: Optional[Dict[str, Any]] = None

# Statement Upload Result
class UploadSummaryOut(BaseModel):
    filename: str
    total_transactions_parsed: int
    anomalies_detected: int
    total_inflow: float
    total_outflow: float
    date_range: Dict[str, str]
    message: str
