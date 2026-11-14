import io
import re
import csv
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
from pypdf import PdfReader

class StatementParser:
    """Intelligent multi-format bank statement parser for CSV and PDF."""

    DATE_PATTERNS = [
        "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y",
        "%Y/%m/%d", "%d-%b-%Y", "%d %b %Y", "%b %d, %Y",
        "%d/%m/%y", "%m/%d/%y"
    ]

    CLEAN_RULES = [
        (r'^(UPI|NEFT|RTGS|IMPS|POS|ACH|ATM|DIRECT DEBIT|WIRE|DEBIT CARD)\s*[-/:]?\s*', ''),
        (r'[-/]\d{6,}@\w+', ''),
        (r'\b\d{10,}\b', ''),
        (r'\b(TXN|REF|ID|AUTH|SEQ|TRF)[:\s]*\w+\b', ''),
        (r'[*#]\w+', ''),
        (r'\s{2,}', ' ')
    ]

    @classmethod
    def clean_merchant_name(cls, raw: str) -> str:
        """Strip transaction noise, card auth numbers, and payment rails to isolate merchant name."""
        if not raw:
            return "Unknown"
        
        text = str(raw).strip()
        for pattern, replacement in cls.CLEAN_RULES:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE).strip()
        
        # Additional trimming
        text = text.strip(" -_/,.*#@")
        if not text:
            text = str(raw).strip()[:30]
        
        # Capitalize words nicely
        words = [w.capitalize() if not w.isupper() or len(w) > 4 else w for w in text.split()]
        cleaned = " ".join(words[:4])
        return cleaned or "Merchant"

    @classmethod
    def parse_date(cls, val: Any) -> datetime:
        """Robustly parse string or timestamp into a datetime object."""
        if isinstance(val, (datetime, pd.Timestamp)):
            return val.to_pydatetime() if hasattr(val, "to_pydatetime") else val
        
        val_str = str(val).strip()
        for fmt in cls.DATE_PATTERNS:
            try:
                return datetime.strptime(val_str, fmt)
            except ValueError:
                continue
        
        # Fallback using dateutil or default today
        try:
            return pd.to_datetime(val_str).to_pydatetime()
        except Exception:
            return datetime.utcnow()

    @classmethod
    def parse_csv(cls, content: bytes) -> List[Dict[str, Any]]:
        """Parse bank statement CSV with dynamic column identification."""
        text = content.decode("utf-8", errors="replace")
        lines = [line for line in text.splitlines() if line.strip()]
        if not lines:
            return []

        # Find the header row
        header_idx = 0
        for i, line in enumerate(lines[:15]):
            lower = line.lower()
            if any(k in lower for k in ["date", "txn", "trans"]) and any(k in lower for k in ["desc", "particular", "narration", "detail", "amount", "debit"]):
                header_idx = i
                break

        csv_reader = csv.reader(lines[header_idx:])
        rows = list(csv_reader)
        if len(rows) < 2:
            return []

        raw_headers = [h.strip().lower() for h in rows[0]]

        # Map standard columns
        col_date = cls._find_col(raw_headers, ["date", "txn date", "posting date", "transaction date", "value date"])
        col_desc = cls._find_col(raw_headers, ["narration", "description", "particulars", "details", "merchant", "payee", "remarks"])
        col_debit = cls._find_col(raw_headers, ["debit", "withdrawal", "dr", "debit amount"])
        col_credit = cls._find_col(raw_headers, ["credit", "deposit", "cr", "credit amount"])
        col_amount = cls._find_col(raw_headers, ["amount", "txn amount", "transaction amount"])
        col_type = cls._find_col(raw_headers, ["type", "cr/dr", "transaction type"])

        parsed_transactions = []

        for row in rows[1:]:
            if not row or len(row) <= max(filter(lambda x: x is not None, [col_date, col_desc])):
                continue

            date_val = row[col_date].strip() if col_date is not None and col_date < len(row) else ""
            desc_val = row[col_desc].strip() if col_desc is not None and col_desc < len(row) else "Transaction"
            if not date_val or not desc_val:
                continue

            parsed_dt = cls.parse_date(date_val)
            amount = 0.0
            txn_type = "debit"

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
                if col_type is not None and col_type < len(row):
                    type_str = row[col_type].strip().lower()
                    if "cr" in type_str or "credit" in type_str or "dep" in type_str:
                        txn_type = "credit"
                        amount = abs(raw_amt)
                    else:
                        txn_type = "debit"
                        amount = abs(raw_amt)
                else:
                    if raw_amt < 0:
                        txn_type = "debit"
                        amount = abs(raw_amt)
                    else:
                        # If signed positive, check narration for clues
                        lower_desc = desc_val.lower()
                        if any(w in lower_desc for w in ["salary", "interest", "dividend", "refund", "credit", "cashback"]):
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
        """Extract bank statement tables and line items from PDF."""
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)
        full_text = []

        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                full_text.extend(extracted.splitlines())

        parsed_transactions = []
        # Common regex matching: DATE | DESCRIPTION | [OPTIONAL REF] | DEBIT/CREDIT/AMOUNT
        # Example pattern: 15-10-2026 Amazon Marketplace $45.20 Dr
        line_regex = re.compile(
            r'(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{2,4})\s+(.+?)\s+([\$₹€£]?\s*[\d,]+\.\d{2})\s*(cr|dr|credit|debit)?',
            re.IGNORECASE
        )

        for line in full_text:
            line_str = line.strip()
            match = line_regex.search(line_str)
            if match:
                date_str, desc, amt_str, flag = match.groups()
                clean_amt = cls._clean_num(amt_str)
                if not clean_amt:
                    continue
                amount = float(clean_amt)
                flag_str = (flag or "").lower()
                desc_lower = desc.lower()

                if "cr" in flag_str or "credit" in flag_str or any(k in desc_lower for k in ["salary", "refund", "deposit", "interest"]):
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
        # Remove currency symbols, commas, spaces
        cleaned = re.sub(r'[^\d\.\-]', '', str(val).strip())
        return cleaned if cleaned and cleaned != '-' else ""
