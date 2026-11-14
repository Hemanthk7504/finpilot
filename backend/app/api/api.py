from fastapi import APIRouter
from backend.app.api.endpoints import transactions, analytics, health_score, budgets, assistant, reports

api_router = APIRouter()

api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions & Statements"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Forecast"])
api_router.include_router(health_score.router, prefix="/health-score", tags=["Financial Health Score"])
api_router.include_router(budgets.router, prefix="/planning", tags=["Budgets & Goals"])
api_router.include_router(assistant.router, prefix="/advisor", tags=["AI Conversational Advisor"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Administration"])
