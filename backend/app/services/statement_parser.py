import io
import re
import csv
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
from pypdf import PdfReader

class StatementParser:
    """
    Intelligent multi-format bank and payment statement parser.
    Supports PhonePe, Google Pay (GPay), Paytm, BHIM, CRED,
    and all Indian Bank Statements (SBI, HDFC, ICICI, Axis, Kotak, etc.) in CSV and PDF.
    """

    DATE_PATTERNS = [
        "%d-%m-%Y", "%d/%m/%Y", "%d-%b-%Y", "%d %b %Y",
        "%d/%m/%y", "%d-%m-%y", "%Y-%m-%d", "%d %B %Y",
        "%b %d, %Y", "%m/%d/%Y", "%Y/%m/%d", "%b %d %Y",
        "%d/%b/%Y", "%Y-%m-%dT%H:%M:%S"
    ]

    UPI_BANK_PATTERNS = [
        # UPI/DR/431789234125/Swiggy/HDFC/swiggy@okhdfcbank/Order -> Swiggy
        re.compile(r'UPI/(?:DR|CR|P2M|P2A|REV)/\d+/([^/]+)', re.IGNORECASE),
        # UPI-ZOMATO-PAYTMQR28100505@PAYTM-431567890123 -> ZOMATO
        re.compile(r'UPI-([A-Za-z0-9\s]+?)-(?:PAYTMQR|BHIM|UPI|[a-zA-Z0-9]+@)', re.IGNORECASE),
        # UPI/431789234125/Swiggy/...
        re.compile(r'UPI/\d+/([^/]+)', re.IGNORECASE),
        # UPI/Swiggy/...
        re.compile(r'UPI/([A-Za-z0-9\s]+?)/', re.IGNORECASE),
        # IMPS-P2A-41234-RAVI KUMAR
        re.compile(r'IMPS-(?:P2A|P2P)-\d+-([^-/]+)', re.IGNORECASE),
    ]

    PHONE_APP_PATTERNS = [
        # Paid to Swiggy -> Swiggy
        re.compile(r'^(?:Paid to|Payment to|Transfer to|Sent to|Money sent to|Paid for|Debited for|Bill payment (?:to|for)|AutoPay to|Subscription to)\s+(.+)', re.IGNORECASE),
        # Received from Ramesh Kumar -> Ramesh Kumar
        re.compile(r'^(?:Received from|Refund from|Cashback from|Money received from|Added from|Deposit from|Credit from)\s+(.+)', re.IGNORECASE),
        # Recharge of Jio -> Jio Recharge
        re.compile(r'^(?:Recharge for|Mobile recharge for|Recharge of)\s+(.+)', re.IGNORECASE),
    ]

    @classmethod
    def clean_merchant_name(cls, raw: str) -> str:
        """Strip transaction noise, card auth numbers, and payment rails to isolate merchant name."""
        if not raw:
            return "Unknown"
        text = str(raw).strip()

        # Handle specific cases first
        lower = text.lower()
        if "cashback from phonepe" in lower or "phonepe cashback" in lower:
            return "PhonePe Cashback"
        if "cashback from paytm" in lower or "paytm cashback" in lower:
            return "Paytm Cashback"
        if "cred cashback" in lower:
            return "CRED Cashback"

        # 1. Check Bank UPI pattern
        for pat in cls.UPI_BANK_PATTERNS:
            m = pat.search(text)
            if m:
                text = m.group(1).strip()
                break

        # 2. Check PhonePe / GPay / Paytm prefix pattern
        for pat in cls.PHONE_APP_PATTERNS:
            m = pat.search(text)
            if m:
                text = m.group(1).strip()
                break

        # 3. Strip UPI handles (@okhdfcbank, @paytm, @ybl, etc.)
        text = re.sub(r'[-_\s]?[a-zA-Z0-9\.\-_]+@(okhdfcbank|oksbi|okaxis|okicici|paytm|ybl|ibl|axl|upi|apl|ikwik|freecharge|idfcbank|kotak|barodampay|postbank)\b', '', text, flags=re.IGNORECASE)
        text = re.sub(r'@[a-zA-Z0-9\.\-_]+', '', text) # Any remaining @handle

        # 4. Strip payment rail prefixes (NEFT, RTGS, IMPS, POS, ACH, ATM)
        text = re.sub(r'^(?:ACH\s*(?:CR|DR)?|NEFT|RTGS|IMPS|POS|ATM|WIRE|NACH|DEBIT CARD|CREDIT CARD|AUTO DEBIT|DIRECT DEBIT)[-/\s:]+', '', text, flags=re.IGNORECASE)

        # 5. Strip UTR, Reference IDs, Auth codes, Account numbers, leading digits
        text = re.sub(r'\b(?:UTR|TXN|REF|ID|AUTH|SEQ|TRF|RRR|CRN)[:\s]*\w+\b', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\b\d{8,}\b', '', text)
        text = re.sub(r'^\d+\s+', '', text) # leading auth numbers e.g. "4321 Dominos"

        # 6. Strip corporate entity suffixes
        text = re.sub(r'\b(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|Ltd\.?|LLP|Inc\.?|Corp\.?|Commerce\s+Pvt\s+Ltd|Retail\s+Store|Store)\b', '', text, flags=re.IGNORECASE)

        # 7. Strip trailing symbols and extra whitespace
        text = text.strip(" -_/,.*#@:;")
        text = re.sub(r'\s{2,}', ' ', text)

        if not text:
            text = str(raw).strip()[:30]

        # Proper casing
        words = text.split()
        cleaned_words = []
        for w in words[:4]:
            if w.upper() in ["UPI", "POS", "ATM", "GST", "SIP", "EMI", "FD", "RD", "TCS", "HCL", "IBM", "LIC", "IOCL", "BPCL", "HPCL", "IRCTC", "BBPS", "BESCOM"]:
                cleaned_words.append(w.upper())
            else:
                cleaned_words.append(w.capitalize())

        cleaned = " ".join(cleaned_words)
        return cleaned or "Merchant"

    @classmethod
    def parse_date(cls, val: Any) -> datetime:
        """Robustly parse string or timestamp into a datetime object."""
        if isinstance(val, (datetime, pd.Timestamp)):
            return val.to_pydatetime() if hasattr(val, "to_pydatetime") else val
        
        val_str = str(val).strip()
        # Clean timestamps like "12-Nov-2026, 04:30 PM" -> "12-Nov-2026"
        val_clean = val_str.split(",")[0].strip() if "," in val_str and any(m in val_str for m in ["AM", "PM", "am", "pm"]) else val_str
        
        for fmt in cls.DATE_PATTERNS:
            try:
                return datetime.strptime(val_clean, fmt)
            except ValueError:
                continue
        
        # Fallback using dateutil or default today
        try:
            return pd.to_datetime(val_str).to_pydatetime()
        except Exception:
            return datetime.utcnow()

    @classmethod
    def parse_csv(cls, content: bytes) -> List[Dict[str, Any]]:
        """
        Parse bank and payment statement CSV with dynamic column identification.
        Accurately handles PhonePe, GPay, Paytm, and standard bank formats.
        """
        text = content.decode("utf-8", errors="replace")
        lines = [line for line in text.splitlines() if line.strip()]
        if not lines:
            return []

        # Find the header row
        header_idx = 0
        for i, line in enumerate(lines[:20]):
            lower = line.lower()
            if any(k in lower for k in ["date", "txn", "trans"]) and any(k in lower for k in ["desc", "particular", "narration", "detail", "amount", "debit", "activity", "paid to"]):
                header_idx = i
                break

        csv_reader = csv.reader(lines[header_idx:])
        rows = list(csv_reader)
        if len(rows) < 2:
            return []

        raw_headers = [h.strip().lower() for h in rows[0]]

        # Map standard and app-specific columns
        col_date = cls._find_col(raw_headers, ["date", "txn date", "posting date", "transaction date", "value date", "date & time", "timestamp"])
        col_desc = cls._find_col(raw_headers, ["transaction details", "details", "paid to / received from", "narration", "description", "particulars", "activity", "merchant", "payee", "remarks", "payment details", "beneficiary"])
        col_status = cls._find_col(raw_headers, ["status", "txn status", "transaction status", "payment status", "state"])
        col_debit = cls._find_col(raw_headers, ["debit", "withdrawal", "dr", "debit amount", "spent", "paid out", "withdrawal amt"])
        col_credit = cls._find_col(raw_headers, ["credit", "deposit", "cr", "credit amount", "received", "paid in", "deposit amt"])
        col_amount = cls._find_col(raw_headers, ["amount (inr)", "amount(inr)", "amount (rs)", "amount(rs)", "amount (₹)", "amount", "txn amount", "transaction amount", "total"])
        col_type = cls._find_col(raw_headers, ["type", "payment type", "txn type", "cr/dr", "dr/cr", "direction"])

        parsed_transactions = []

        for row in rows[1:]:
            if not row or len(row) <= max(filter(lambda x: x is not None, [col_date, col_desc])):
                continue

            # Check transaction status if available: ignore failed / declined
            if col_status is not None and col_status < len(row):
                status_val = row[col_status].strip().lower()
                if any(bad in status_val for bad in ["failed", "declined", "cancelled", "pending", "rejected", "bounce"]):
                    continue

            date_val = row[col_date].strip() if col_date is not None and col_date < len(row) else ""
            desc_val = row[col_desc].strip() if col_desc is not None and col_desc < len(row) else "Transaction"
            if not date_val or not desc_val:
                continue

            parsed_dt = cls.parse_date(date_val)
            amount = 0.0
            txn_type = "debit"

            desc_lower = desc_val.lower()

            # Case A: Separate Debit and Credit columns
            if col_debit is not None and col_credit is not None:
                deb_str = cls._clean_num(row[col_debit]) if col_debit < len(row) else ""
                crd_str = cls._clean_num(row[col_credit]) if col_credit < len(row) else ""

                if deb_str and float(deb_str) > 0:
                    amount = float(deb_str)
                    txn_type = "debit"
                elif crd_str and float(crd_str) > 0:
                    amount = float(crd_str)
                    txn_type = "credit"
                else:
                    continue

            # Case B: Single Amount column with Type or Sign
            elif col_amount is not None and col_amount < len(row):
                amt_str = cls._clean_num(row[col_amount])
                if not amt_str:
                    continue
                raw_amt = float(amt_str)
                
                # Check explicit Type column first (e.g. PhonePe DEBIT/CREDIT)
                if col_type is not None and col_type < len(row):
                    type_str = row[col_type].strip().lower()
                    if any(c in type_str for c in ["cr", "credit", "dep", "received"]):
                        txn_type = "credit"
                    else:
                        txn_type = "debit"
                    amount = abs(raw_amt)
                else:
                    if raw_amt < 0:
                        txn_type = "debit"
                        amount = abs(raw_amt)
                    else:
                        # Determine by narration direction
                        if any(desc_lower.startswith(prefix) for prefix in [
                            "received from", "refund from", "cashback from", "money received",
                            "added from", "credit from", "salary from", "deposit from", "interest"
                        ]) or any(k in desc_lower for k in ["salary", "interest", "dividend", "cashback", "refund"]):
                            txn_type = "credit"
                        else:
                            txn_type = "debit"
                        amount = abs(raw_amt)
            else:
                continue

            if amount <= 0:
                continue

            clean_merchant = cls.clean_merchant_name(desc_val)

            parsed_transactions.append({
                "date": parsed_dt,
                "raw_narration": desc_val,
                "clean_merchant": clean_merchant,
                "amount": round(amount, 2),
                "type": txn_type,
            })

        return parsed_transactions

    @classmethod
    def parse_pdf(cls, content: bytes) -> List[Dict[str, Any]]:
        """
        Extract bank and payment statement tables and line items from PDF.
        Supports PhonePe, GPay, Paytm, and Indian bank PDF statement formats.
        """
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        full_text = []

        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                full_text.extend(extracted.splitlines())

        parsed_transactions = []

        # Pattern 1: Standard Bank Line: DATE | DESCRIPTION | AMOUNT | [DR/CR]
        # Example: 15-11-2026 Swiggy Bangalore ₹ 450.00 Dr
        # Example: 12/11/2026 UPI/DR/431789234125/Swiggy/HDFC 450.00
        line_regex = re.compile(
            r'(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+([₹\$€£]?\s*[\d,]+\.\d{2})\s*(cr|dr|credit|debit|success|completed|successful)?',
            re.IGNORECASE
        )

        # Pattern 2: PhonePe transaction card format in PDF:
        # "12 Nov 2026 Paid to Swiggy ₹ 450.00"
        phonepe_regex = re.compile(
            r'(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(Paid to\s+.+?|Received from\s+.+?|Cashback from\s+.+?)\s+[₹Rs\.\s]*([\d,]+\.\d{2})',
            re.IGNORECASE
        )

        for line in full_text:
            line_str = line.strip()
            if not line_str:
                continue

            # Skip failed transactions in PDF
            if any(bad in line_str.lower() for bad in ["failed", "declined", "cancelled", "rejected"]):
                continue

            match = phonepe_regex.search(line_str)
            if match:
                date_str, desc, amt_str = match.groups()
                clean_amt = cls._clean_num(amt_str)
                if not clean_amt:
                    continue
                amount = float(clean_amt)
                desc_lower = desc.lower()
                txn_type = "credit" if any(k in desc_lower for k in ["received", "refund", "cashback", "credit"]) else "debit"
                parsed_transactions.append({
                    "date": cls.parse_date(date_str),
                    "raw_narration": desc.strip(),
                    "clean_merchant": cls.clean_merchant_name(desc),
                    "amount": round(amount, 2),
                    "type": txn_type
                })
                continue

            match = line_regex.search(line_str)
            if match:
                date_str, desc, amt_str, flag = match.groups()
                clean_amt = cls._clean_num(amt_str)
                if not clean_amt:
                    continue
                amount = float(clean_amt)
                flag_str = (flag or "").lower()
                desc_lower = desc.lower()

                if "cr" in flag_str or "credit" in flag_str or any(k in desc_lower for k in ["salary", "refund", "deposit", "interest", "cashback", "received from"]):
                    txn_type = "credit"
                else:
                    txn_type = "debit"

                clean_merchant = cls.clean_merchant_name(desc)
                parsed_transactions.append({
                    "date": cls.parse_date(date_str),
                    "raw_narration": desc.strip(),
                    "clean_merchant": clean_merchant,
                    "amount": round(amount, 2),
                    "type": txn_type
                })

        return parsed_transactions

    @staticmethod
    def _find_col(headers: List[str], keywords: List[str]) -> Optional[int]:
        for i, h in enumerate(headers):
            for kw in keywords:
                if kw in h:
                    return i
        return None

    @staticmethod
    def _clean_num(val: str) -> str:
        if not val:
            return ""
        # Remove currency symbols (₹, $, €, £), Rs., commas, spaces
        cleaned = re.sub(r'[^\d\.\-]', '', str(val).strip())
        return cleaned if cleaned and cleaned != '-' else ""
