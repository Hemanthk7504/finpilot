import os
import re
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

# Enforce PyTorch backend for Transformers and suppress TF/Keras conflicts
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

logger = logging.getLogger("finpilot.hf_parser")

class HuggingFaceStatementParser:
    """
    Intelligent Statement Parsing & Semantic Fallback using Hugging Face Transformer Models.
    1. Parsing Fallback: Uses Hugging Face NER (dslim/bert-base-NER) to extract entities,
       merchants, amounts, and directions from non-standard statements.
    2. Semantic Categorization: Uses Hugging Face MiniLM embeddings (all-MiniLM-L6-v2)
       for zero-shot semantic matching of unknown or ambiguous Indian UPI merchants.
    """
    _ner_pipeline = None
    _embedder_tokenizer = None
    _embedder_model = None
    _cat_embeddings = None
    _cat_names = [
        "Salary & Income",
        "Housing & Rent",
        "Groceries",
        "Utilities & Bills",
        "Healthcare & Medical",
        "Transportation & Fuel",
        "Dining & Food Delivery",
        "Shopping & Electronics",
        "Entertainment & Subscriptions",
        "Travel & Lodging",
        "Investments & Savings",
        "Loans & Debt EMI",
        "Bank Charges & Fees",
        "Refunds & Cashback"
    ]
    _cat_descriptions = [
        "Salary paycheck wages monthly employer income bonus dividend compensation",
        "House rent landlord apartment maintenance fee lease property tax tenant",
        "Groceries supermarket daily vegetables fruits milk bread kirana food store provisions",
        "Electricity bill water board utility power broadband internet mobile recharge gas cylinder",
        "Hospital pharmacy medicine doctor chemist medical healthcare clinic test diagnostic",
        "Uber ola cabs auto fuel petrol diesel commute metro travel vehicle transportation parking",
        "Food delivery dining restaurant cafe eatery bistro coffee breakfast dinner lunch tea",
        "Online shopping clothes electronics apparel gadgets ecommerce store retail fashion",
        "Streaming movies cinema tickets netflix spotify entertainment subscriptions shows",
        "Hotel flight ticket booking travel lodging holiday vacation resort airline",
        "Mutual fund stocks trading investment sip demat shares wealth savings gold bond",
        "Loan repayment emi credit card bill debt installment mortgage finance",
        "Bank service charge amc penalty fee card fee cheque charges sms charge",
        "Cashback refund reversal promotional reward credit back return"
    ]

    @classmethod
    def get_ner_pipeline(cls):
        """Lazy-load Hugging Face NER pipeline on first call to optimize memory & startup time."""
        if cls._ner_pipeline is None:
            try:
                from transformers import pipeline
                import torch
                device = 0 if torch.cuda.is_available() else -1
                logger.info("Initializing Hugging Face NER pipeline (dslim/bert-base-NER)...")
                cls._ner_pipeline = pipeline(
                    "ner",
                    model="dslim/bert-base-NER",
                    framework="pt",
                    device=device,
                    aggregation_strategy="simple"
                )
            except Exception as e:
                logger.error(f"Failed to load Hugging Face NER model: {e}")
                cls._ner_pipeline = None
        return cls._ner_pipeline

    @classmethod
    def get_embedder(cls):
        """Lazy-load Hugging Face MiniLM Embedder for zero-shot semantic categorization."""
        if cls._embedder_model is None:
            try:
                from transformers import AutoTokenizer, AutoModel
                import torch
                import torch.nn.functional as F
                logger.info("Initializing Hugging Face MiniLM Embedder (sentence-transformers/all-MiniLM-L6-v2)...")
                cls._embedder_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
                cls._embedder_model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
                cls._embedder_model.eval()

                # Precompute normalized category embeddings
                encoded = cls._embedder_tokenizer(cls._cat_descriptions, padding=True, truncation=True, return_tensors="pt")
                with torch.no_grad():
                    out = cls._embedder_model(**encoded)
                    mask = encoded['attention_mask'].unsqueeze(-1)
                    embs = torch.sum(out.last_hidden_state * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)
                    cls._cat_embeddings = F.normalize(embs, p=2, dim=1)
            except Exception as e:
                logger.error(f"Failed to load MiniLM embedder: {e}")
                cls._embedder_model = None
        return cls._embedder_model

    @classmethod
    def semantic_categorize(cls, text: str) -> Tuple[Optional[str], float]:
        """Categorize unknown or ambiguous vendor names semantically using Hugging Face embeddings."""
        if not text or not text.strip():
            return None, 0.0

        embedder = cls.get_embedder()
        if embedder is None or cls._cat_embeddings is None:
            return None, 0.0

        try:
            import torch
            import torch.nn.functional as F
            encoded = cls._embedder_tokenizer([text], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                out = cls._embedder_model(**encoded)
                mask = encoded['attention_mask'].unsqueeze(-1)
                emb = torch.sum(out.last_hidden_state * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)
                emb_norm = F.normalize(emb, p=2, dim=1)

            sims = torch.mm(emb_norm, cls._cat_embeddings.t())[0]
            best_idx = torch.argmax(sims).item()
            best_score = sims[best_idx].item()
            best_cat = cls._cat_names[best_idx]
            return best_cat, round(float(best_score), 2)
        except Exception as e:
            logger.debug(f"HF Semantic categorize exception: {e}")
            return None, 0.0

    @classmethod
    def parse_unstructured_text(cls, text: str) -> List[Dict[str, Any]]:
        """
        Parse unstructured financial text or non-standard statements using Hugging Face NER + regex heuristics.
        Extracts Date, Payee/Merchant (PER/ORG), Direction (Debit/Credit), and Amount.
        """
        if not text or not text.strip():
            return []

        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if not lines:
            return []

        candidate_blocks = []
        current_chunk = []

        date_pattern = re.compile(
            r'(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{1,2}[-\s/]+[A-Za-z]{3,9}[-\s/]+\d{2,4}|[A-Za-z]{3,9}[-\s/]+\d{1,2},?[-\s/]+\d{4})',
            re.IGNORECASE
        )

        for line in lines:
            if "statement" in line.lower() and ("for" in line.lower() or "period" in line.lower()):
                continue
            if any(bad in line.lower() for bad in ["failed", "declined", "cancelled", "rejected"]):
                continue

            has_date = bool(date_pattern.search(line))
            if has_date and current_chunk:
                candidate_blocks.append(" ".join(current_chunk))
                current_chunk = [line]
            else:
                current_chunk.append(line)

        if current_chunk:
            candidate_blocks.append(" ".join(current_chunk))

        if not candidate_blocks:
            candidate_blocks = lines

        ner = cls.get_ner_pipeline()
        parsed_results = []

        for block_text in candidate_blocks:
            # 1. Extract Date
            date_match = date_pattern.search(block_text)
            date_str = date_match.group(1) if date_match else datetime.utcnow().strftime("%Y-%m-%d")

            # Remove date from text before searching for amounts so day/month/year aren't matched as amounts
            text_no_date = block_text
            if date_match:
                text_no_date = block_text[:date_match.start()] + " " + block_text[date_match.end():]

            # 2. Extract Amount
            amt = None
            # Priority A: with explicit currency symbol (₹, INR, Rs, $)
            m_curr = re.search(r'(?:[₹■I\$\u20b9]|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)', text_no_date, re.IGNORECASE)
            if m_curr:
                try:
                    cand = float(m_curr.group(1).replace(",", ""))
                    if 0 < cand < 50000000:
                        amt = cand
                except ValueError:
                    pass

            # Priority B: numbers with decimal points (e.g. 450.00, 1200.50)
            if amt is None:
                for m_dec in re.finditer(r'\b([\d,]+\.\d{2})\b', text_no_date):
                    raw = m_dec.group(1).replace(",", "")
                    if len(raw.split(".")[0]) <= 8:
                        try:
                            cand = float(raw)
                            if 0 < cand < 50000000:
                                amt = cand
                                break
                        except ValueError:
                            pass

            # Priority C: standalone integer numbers (1 to 6 digits)
            if amt is None:
                for m_int in re.finditer(r'\b(\d{1,6})\b', text_no_date):
                    raw = m_int.group(1)
                    if raw not in ["2023", "2024", "2025", "2026", "2027"]:
                        try:
                            cand = float(raw)
                            if 0 < cand < 50000000:
                                amt = cand
                                break
                        except ValueError:
                            pass

            if amt is None:
                continue

            # 3. Detect Direction
            text_upper = block_text.upper()
            if any(c in text_upper for c in ["CREDIT", "CR", "RECEIVED", "REFUND", "CASHBACK", "SALARY"]):
                txn_type = "credit"
            else:
                txn_type = "debit"

            # 4. Extract Merchant / Payee via Hugging Face NER
            merchant = "Unknown Merchant"
            if ner is not None:
                try:
                    entities = ner(block_text[:400])
                    named_entities = [e["word"].strip() for e in entities if e["entity_group"] in ["ORG", "PER"]]
                    if named_entities:
                        clean_name = " ".join(named_entities).replace(" ##", "").replace("##", "")
                        if len(clean_name) >= 2:
                            merchant = clean_name
                except Exception as e:
                    logger.debug(f"HF NER entity extraction note: {e}")

            # Heuristic fallback for merchant if NER found nothing
            if merchant == "Unknown Merchant":
                lead_match = re.search(r'(?:paid to|received from|payment to|transfer to|to:?)\s+([A-Za-z0-9\s\.\-]{3,35})', block_text, re.IGNORECASE)
                if lead_match:
                    merchant = lead_match.group(1).strip()
                else:
                    words = [w for w in block_text.split() if not date_pattern.search(w) and not amount_pattern.search(w) and w.lower() not in ["debit", "credit", "cr", "dr", "utr", "txn", "ref", "rs", "inr"]]
                    if words:
                        merchant = " ".join(words[:4])

            # Parse date safely
            parsed_date = datetime.utcnow()
            for fmt in ["%d-%b-%Y", "%d-%B-%Y", "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d %B %Y", "%b %d, %Y", "%b %d %Y", "%Y-%m-%d", "%d/%b/%Y"]:
                try:
                    parsed_date = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    pass

            parsed_results.append({
                "date": parsed_date,
                "raw_narration": block_text[:120],
                "clean_merchant": merchant[:40],
                "amount": round(amt, 2),
                "type": txn_type,
                "source": "huggingface_ai"
            })

        return parsed_results
