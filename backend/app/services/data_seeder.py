from sqlalchemy.orm import Session
from backend.app.models.category import Category
from backend.app.services.categorizer import categorizer

def seed_database_if_empty(db: Session):
    """Seed standard financial categories if empty for real-time ML classification."""
    existing_cat = db.query(Category).first()
    if not existing_cat:
        for name, meta in categorizer.CATEGORIES.items():
            cat = Category(
                name=name,
                type=meta["type"],
                icon=meta["icon"],
                color=meta["color"]
            )
            db.add(cat)
        db.commit()
