import io
import re
import csv
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import fitz
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
        "%b %d, %Y", "%b %d %Y", "%B %d, %Y", "%B %d %Y",
        "%m/%d/%Y", "%Y/%m/%d", "%d/%b/%Y", "%Y-%m-%dT%H:%M:%S"
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
        """Strip transaction noise, card auth numbers, and payment rails to isolate merchant/payee name."""
        if not raw:
            return "Unknown"
        text = str(raw).strip()

        # Handle specific cashback cases first
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

        # Proper casing up to 6 words
        words = text.split()
        cleaned_words = []
        for w in words[:6]:
            if w.upper() in ["UPI", "POS", "ATM", "GST", "SIP", "EMI", "FD", "RD", "TCS", "HCL", "IBM", "LIC", "IOCL", "BPCL", "HPCL", "IRCTC", "BBPS", "BESCOM", "D/O", "S/O", "W/O"]:
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
        # Clean timestamps like "Nov 14, 2026, 02:32 pm" or "12-Nov-2026, 04:30 PM"
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
        Uses PyMuPDF (fitz) with fallback to pypdf for maximum text extraction accuracy.
        """
        full_text = ""
        # 1. Try PyMuPDF first
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            for page in doc:
                full_text += page.get_text("text") + "\n"
        except Exception:
            full_text = ""

        # 2. Fallback to pypdf if PyMuPDF extracted nothing
        if not full_text.strip():
            try:
                reader = PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        full_text += extracted + "\n"
            except Exception:
                pass

        if not full_text.strip():
            return []

        lines = [l.strip() for l in full_text.splitlines() if l.strip()]
        parsed_transactions = []

        # -----------------------------------------------------------------
        # STRATEGY 1: PhonePe / Multi-line Mobile Payment Block Parser
        # Handles PhonePe, GPay, and Paytm PDF statements where each entry
        # spans multiple lines: Date, Time, Payee/Payer, UTR, Type, Amount
        # -----------------------------------------------------------------
        date_line_regex = re.compile(
            r'^(?:[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{4}|\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{1,2}[-/\.][A-Za-z]{3,9}[-/\.]\d{2,4})',
            re.IGNORECASE
        )

        date_indices = []
        for idx, line in enumerate(lines):
            # Skip header range like "15 Oct, 2026 - 14 Nov, 2026"
            if " - " in line or " to " in line.lower() or "statement" in line.lower():
                continue
            if date_line_regex.match(line):
                date_indices.append(idx)

        if len(date_indices) >= 1:
            for k in range(len(date_indices)):
                start_idx = date_indices[k]
                end_idx = date_indices[k + 1] if k + 1 < len(date_indices) else len(lines)
                block = lines[start_idx:end_idx]
                date_val = block[0]

                narration = ""
                txn_type = None
                amount = None

                for b_i, bl in enumerate(block[1:], 1):
                    bl_clean = bl.strip()
                    bl_lower = bl_clean.lower()
                    bl_upper = bl_clean.upper()

                    # Ignore failed or declined transactions
                    if any(bad in bl_lower for bad in ["failed", "declined", "cancelled", "rejected"]):
                        amount = None
                        break

                    # Detect CREDIT vs DEBIT
                    if not txn_type:
                        if re.search(r'(?:^|[\s/_])(?:CREDIT|CR|RECEIVED|DEPOSIT)(?:$|[\s/_])', bl_upper):
                            txn_type = "credit"
                        elif re.search(r'(?:^|[\s/_])(?:DEBIT|DR|WITHDRAWAL|PAID)(?:$|[\s/_])', bl_upper):
                            txn_type = "debit"

                    # Detect Narration / Payee / Payer
                    if not narration:
                        if re.search(r'^(?:Paid to|Payment to|Received from|Refund from|Cashback from|AutoPay to|Subscription to|Transfer to)', bl_clean, re.IGNORECASE):
                            if bl_clean.lower() in ["paid to", "payment to", "received from", "transfer to"] and b_i + 1 < len(block):
                                # Multi-line recipient name
                                narration = f"{bl_clean} {block[b_i + 1].strip()}"
                            else:
                                narration = bl_clean
                        elif any(k in bl_lower for k in ["salary", "upi/", "upi-", "ach ", "imps", "neft", "pos "]):
                            narration = bl_clean

                    # Detect Amount: ignore UTR, Txn ID, and Account masking
                    if amount is None:
                        # Skip lines starting with metadata keywords, timestamps, or account masking
                        if not any(bl_lower.startswith(p) for p in ["utr", "transaction", "txn", "ref", "credited to", "paid by", "chq", "account", "a/c"]) and "xxxx" not in bl_lower and not re.search(r'^\d{1,2}:\d{2}', bl_clean):
                            # Matches amount lines like ₹500, ■500, I500, 450.00, Rs. 1,200.50
                            m = re.match(r'^(?:[₹■I\$\u20b9]|Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)$', bl_clean, re.IGNORECASE)
                            if m:
                                raw_num = m.group(1).replace(",", "")
                                # Disregard long reference / UTR integers without decimals
                                if "." not in raw_num and len(raw_num) >= 9:
                                    continue
                                try:
                                    val = float(raw_num)
                                    if 0 < val < 10000000:
                                        amount = val
                                except ValueError:
                                    pass

                # Fallback narration from block lines if still empty
                if not narration and len(block) > 1:
                    for candidate in block[1:]:
                        cand_l = candidate.lower()
                        if not re.search(r'^\d{1,2}:\d{2}', candidate) and not any(cand_l.startswith(p) for p in ["utr", "transaction", "txn", "ref", "chq", "xxxx", "balance"]) and candidate.upper() not in ["DEBIT", "CREDIT", "DR", "CR"]:
                            if not re.match(r'^(?:[₹■I\$\u20b9]|Rs\.?|INR)?\s*[\d,]+(?:\.\d{1,2})?$', candidate):
                                narration = candidate
                                break

                # Fallback direction from narration
                if not txn_type and narration:
                    n_lower = narration.lower()
                    if any(k in n_lower for k in ["received", "refund", "cashback", "credit", "cr", "salary"]):
                        txn_type = "credit"
                    else:
                        txn_type = "debit"

                if narration and amount is not None and amount > 0:
                    if narration.lower() in ["date", "transaction details", "type", "amount", "details", "particulars", "description", "statement"]:
                        continue
                    parsed_transactions.append({
                        "date": cls.parse_date(date_val),
                        "raw_narration": narration,
                        "clean_merchant": cls.clean_merchant_name(narration),
                        "amount": round(amount, 2),
                        "type": txn_type or "debit"
                    })

        if parsed_transactions:
            return parsed_transactions

        # -----------------------------------------------------------------
        # STRATEGY 2: Single-Line Row Parser (Bank Statement lines)
        # -----------------------------------------------------------------
        line_regex = re.compile(
            r'(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s+(.+?)\s+([₹■I\$€£]?\s*[\d,]+(?:\.\d{1,2})?)\s*(cr|dr|credit|debit|success|completed|successful)?',
            re.IGNORECASE
        )

        for line in lines:
            line_str = line.strip()
            if not line_str or any(bad in line_str.lower() for bad in ["failed", "declined", "cancelled", "rejected"]):
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

                parsed_transactions.append({
                    "date": cls.parse_date(date_str),
                    "raw_narration": desc.strip(),
                    "clean_merchant": cls.clean_merchant_name(desc),
                    "amount": round(amount, 2),
                    "type": txn_type
                })

        if parsed_transactions:
            return parsed_transactions

        # -----------------------------------------------------------------
        # STRATEGY 3: Hugging Face AI Fallback Parser
        # Handles non-standard, free-form, or unstructured statements using
        # Hugging Face Transformer NER and pattern recognition.
        # -----------------------------------------------------------------
        try:
            from backend.app.services.hf_statement_parser import HuggingFaceStatementParser
            hf_txns = HuggingFaceStatementParser.parse_unstructured_text(full_text)
            if hf_txns:
                for t in hf_txns:
                    t["clean_merchant"] = cls.clean_merchant_name(t.get("clean_merchant", "Unknown"))
                return hf_txns
        except Exception:
            pass

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
        # Remove currency symbols (₹, ■, I, $, €, £), Rs., commas, spaces
        cleaned = re.sub(r'[^\d\.\-]', '', str(val).strip())
        return cleaned if cleaned and cleaned != '-' else ""
