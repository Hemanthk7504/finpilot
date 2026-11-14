from fastapi import APIRouter
from backend.app.api.endpoints import auth, transactions, analytics, health_score, budgets, assistant, reports

api_router = APIRouter()

@api_router.get("/health", tags=["System"])
def api_health():
    return {"status": "healthy", "service": "FinPilot MAX API v1"}


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User Management"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions & Statements"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Forecast"])
api_router.include_router(health_score.router, prefix="/health-score", tags=["Financial Health Score"])
api_router.include_router(budgets.router, prefix="/planning", tags=["Budgets & Goals"])
api_router.include_router(assistant.router, prefix="/advisor", tags=["AI Conversational Advisor"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Administration"])
