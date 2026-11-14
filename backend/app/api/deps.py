from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.db.session import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.user import User

security = HTTPBearer(auto_error=False)

def get_current_user(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Validate JWT token and return active user. Real authentication required."""
    if cred and cred.credentials:
        payload = decode_access_token(cred.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == payload["sub"]).first()
            if user:
                return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please sign in or create an account.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_user_optional(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Return user if token is provided, otherwise return None."""
    if cred and cred.credentials:
        payload = decode_access_token(cred.credentials)
        if payload and "sub" in payload:
            return db.query(User).filter(User.id == payload["sub"]).first()
    return None
