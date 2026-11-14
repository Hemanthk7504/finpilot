from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.transaction import Transaction
from backend.app.models.alert import Alert
from backend.app.schemas.schemas import TransactionOut, TransactionCreate, TransactionUpdate, UploadSummaryOut
from backend.app.services.statement_parser import StatementParser
from backend.app.services.categorizer import categorizer
from backend.app.services.anomaly_detector import anomaly_detector

router = APIRouter()

@router.get("", response_model=List[TransactionOut])
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    is_anomaly: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if category:
        query = query.filter(Transaction.category_name == category)
    if type:
        query = query.filter(Transaction.type == type)
    if is_anomaly is not None:
        query = query.filter(Transaction.is_anomaly == is_anomaly)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Transaction.clean_merchant.ilike(search_fmt)) |
            (Transaction.raw_narration.ilike(search_fmt))
        )

    return query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()

@router.post("", response_model=TransactionOut)
def create_transaction(
    txn_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auto categorize if category is Miscellaneous
    cat_name = txn_in.category_name
    if not cat_name or cat_name == "Miscellaneous":
        cat_name, _ = categorizer.categorize(txn_in.raw_narration, txn_in.clean_merchant, txn_in.type)

    txn = Transaction(
        user_id=current_user.id,
        date=txn_in.date,
        raw_narration=txn_in.raw_narration,
        clean_merchant=txn_in.clean_merchant or StatementParser.clean_merchant_name(txn_in.raw_narration),
        amount=txn_in.amount,
        type=txn_in.type,
        category_name=cat_name,
        is_anomaly=txn_in.is_anomaly or False,
        anomaly_reason=txn_in.anomaly_reason,
        is_recurring=txn_in.is_recurring or False,
        source_file="manual_entry"
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(
    txn_id: str,
    txn_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.user_id == current_user.id
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn_update.category_name is not None:
        txn.category_name = txn_update.category_name
    if txn_update.clean_merchant is not None:
        txn.clean_merchant = txn_update.clean_merchant
    if txn_update.is_anomaly is not None:
        txn.is_anomaly = txn_update.is_anomaly

    db.commit()
    db.refresh(txn)
    return txn

@router.delete("/{txn_id}")
def delete_transaction(
    txn_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.user_id == current_user.id
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@router.post("/upload", response_model=UploadSummaryOut)
async def upload_bank_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload CSV or PDF bank statement, auto-parse, classify, and scan for anomalies."""
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".csv"):
        parsed = StatementParser.parse_csv(content)
    elif filename.endswith(".pdf"):
        parsed = StatementParser.parse_pdf(content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a .csv or .pdf file.")

    if not parsed:
        raise HTTPException(status_code=422, detail="No valid transactions could be parsed from the uploaded statement.")

    # 1. Auto-Categorize each transaction
    for item in parsed:
        cat_name, _ = categorizer.categorize(item["raw_narration"], item["clean_merchant"], item["type"])
        item["category_name"] = cat_name

    # 2. Run Anomaly & Fraud Detection
    analyzed = anomaly_detector.analyze_transactions(parsed)

    # 3. Save into Database
    total_inflow = 0.0
    total_outflow = 0.0
    anomaly_count = 0
    dates = []

    for item in analyzed:
        t_date = item["date"] if isinstance(item["date"], datetime) else datetime.utcnow()
        dates.append(t_date)

        if item["type"] == "credit":
            total_inflow += item["amount"]
        else:
            total_outflow += item["amount"]

        is_ano = item.get("is_anomaly", False)
        if is_ano:
            anomaly_count += 1
            alt = Alert(
                user_id=current_user.id,
                title=f"Statement Anomaly: {item['clean_merchant']}",
                message=item.get("anomaly_reason", "Suspicious charge flagged during statement import."),
                severity="warning",
                type="anomaly"
            )
            db.add(alt)

        txn = Transaction(
            user_id=current_user.id,
            date=t_date,
            raw_narration=item["raw_narration"],
            clean_merchant=item["clean_merchant"],
            amount=item["amount"],
            type=item["type"],
            category_name=item.get("category_name", "Miscellaneous"),
            is_anomaly=is_ano,
            anomaly_reason=item.get("anomaly_reason"),
            source_file=file.filename
        )
        db.add(txn)

    db.commit()

    date_min = min(dates).strftime("%Y-%m-%d") if dates else "N/A"
    date_max = max(dates).strftime("%Y-%m-%d") if dates else "N/A"

    return UploadSummaryOut(
        filename=file.filename,
        total_transactions_parsed=len(analyzed),
        anomalies_detected=anomaly_count,
        total_inflow=round(total_inflow, 2),
        total_outflow=round(total_outflow, 2),
        date_range={"from": date_min, "to": date_max},
        message=f"Successfully imported {len(analyzed)} transactions. {anomaly_count} potential anomalies flagged for review."
    )
