from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.models.user import User

security = HTTPBearer(auto_error=False)

def get_current_user(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Validate JWT token and return active user. Falls back to demo user if unauthenticated."""
    if cred and cred.credentials:
        payload = decode_access_token(cred.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == payload["sub"]).first()
            if user:
                return user

    # Fallback to default demo user
    demo_user = db.query(User).filter(User.id == settings.DEMO_USER_ID).first()
    if demo_user:
        return demo_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
