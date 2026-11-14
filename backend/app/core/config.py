import os

class Settings:
    PROJECT_NAME: str = "FinPilot MAX - AI Personal Finance Advisor"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finpilot_max.db")
    DEFAULT_CURRENCY: str = os.getenv("DEFAULT_CURRENCY", "$")
    DEMO_USER_ID: str = "usr_demo_finpilot"
    DEMO_USER_NAME: str = "Alex Mercer"
    DEMO_USER_EMAIL: str = "alex.mercer@finpilot.io"

settings = Settings()
