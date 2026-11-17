import os
import re
import math
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

# Suppress TF/Keras conflicts and enforce PyTorch
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

logger = logging.getLogger("finpilot.hf_chatbot")

def format_inr(amount: float, decimals: int = 2) -> str:
    """Format a number into Indian Rupee string with Indian numbering (e.g. ₹1,50,000.00)."""
    try:
        is_neg = amount < 0
        abs_val = abs(amount)
        parts = f"{abs_val:.{decimals}f}".split(".")
        int_part = parts[0]
        dec_part = f".{parts[1]}" if decimals > 0 else ""

        if len(int_part) <= 3:
            res = int_part
        else:
            last3 = int_part[-3:]
            remaining = int_part[:-3]
            groups = []
            while len(remaining) > 2:
                groups.insert(0, remaining[-2:])
                remaining = remaining[:-2]
            if remaining:
                groups.insert(0, remaining)
            res = ",".join(groups) + "," + last3

        prefix = "-₹" if is_neg else "₹"
        return f"{prefix}{res}{dec_part}"
    except Exception:
        return f"₹{amount:,.2f}"


class HuggingFaceChatbot:
    """
    Lightweight Hugging Face Financial AI Chatbot.
    Combines:
    1. Hugging Face MiniLM (all-MiniLM-L6-v2) for semantic intent understanding & RAG routing.
    2. Hugging Face FLAN-T5 (google/flan-t5-small) for local generative financial Q&A.
    3. Analytical Financial Computation Engine for exact, non-hallucinated Indian Rupee calculations.
    """
    _tokenizer_t5 = None
    _model_t5 = None
    _tokenizer_minilm = None
    _model_minilm = None
    _intent_embeddings = None

    INTENTS = [
        ("affordability", "Can I afford this purchase? Can I buy a laptop or mobile phone or car? Affordability check."),
        ("sip_investment", "Calculate SIP returns, mutual fund investment compound interest growth for 10 or 15 years."),
        ("taxation", "Compare Old vs New Tax Regime, income tax slabs, Section 80C and 80D tax savings in India."),
        ("spending_analysis", "Where did my money go this month? Show expense breakdown and top spending categories."),
        ("budget_50_30_20", "How to budget money with 50/30/20 rule? Needs, wants, and savings percentage advice."),
        ("health_score", "How can I improve my financial health score, reach Grade A or 90+ score?"),
        ("emergency_fund", "How much emergency fund or cash buffer should I keep in bank account?"),
        ("debt_payoff", "How should I pay off loans, credit card debt, debt snowball vs avalanche method?"),
        ("general_finance", "What is compounding, inflation, stock market Nifty, index funds, and financial freedom?")
    ]

    @classmethod
    def get_flan_model(cls):
        """Lazy-load Hugging Face google/flan-t5-small model on CPU."""
        if cls._model_t5 is None:
            try:
                from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
                import torch
                logger.info("Initializing Hugging Face google/flan-t5-small...")
                cls._tokenizer_t5 = AutoTokenizer.from_pretrained("google/flan-t5-small")
                cls._model_t5 = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
                cls._model_t5.eval()
            except Exception as e:
                logger.error(f"Failed to load FLAN-T5 model: {e}")
                cls._model_t5 = None
        return cls._model_t5, cls._tokenizer_t5

    @classmethod
    def get_intent_model(cls):
        """Lazy-load MiniLM embedder for semantic intent matching."""
        if cls._model_minilm is None:
            try:
                from transformers import AutoTokenizer, AutoModel
                import torch
                import torch.nn.functional as F
                logger.info("Initializing Hugging Face MiniLM intent embedder...")
                cls._tokenizer_minilm = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
                cls._model_minilm = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
                cls._model_minilm.eval()

                # Precompute intent embeddings
                intent_texts = [text for _, text in cls.INTENTS]
                encoded = cls._tokenizer_minilm(intent_texts, padding=True, truncation=True, return_tensors="pt")
                with torch.no_grad():
                    out = cls._model_minilm(**encoded)
                    mask = encoded['attention_mask'].unsqueeze(-1)
                    embs = torch.sum(out.last_hidden_state * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)
                    cls._intent_embeddings = F.normalize(embs, p=2, dim=1)
            except Exception as e:
                logger.error(f"Failed to load MiniLM intent embedder: {e}")
                cls._model_minilm = None
        return cls._model_minilm, cls._tokenizer_minilm

    @classmethod
    def classify_intent(cls, user_message: str) -> Tuple[str, float]:
        """Classify user query intent using Hugging Face semantic embeddings."""
        _, tokenizer = cls.get_intent_model()
        if cls._model_minilm is None or cls._intent_embeddings is None or tokenizer is None:
            # Fallback to keyword matching
            msg_l = user_message.lower()
            if any(w in msg_l for w in ["afford", "buy", "purchase", "spend on"]):
                return "affordability", 0.90
            if any(w in msg_l for w in ["sip", "invest", "returns", "mutual fund", "cagr"]):
                return "sip_investment", 0.90
            if any(w in msg_l for w in ["tax", "regime", "80c", "80d", "slab"]):
                return "taxation", 0.90
            if any(w in msg_l for w in ["where", "expense", "spend", "category", "outflow"]):
                return "spending_analysis", 0.90
            if any(w in msg_l for w in ["budget", "50/30/20", "envelope"]):
                return "budget_50_30_20", 0.90
            if any(w in msg_l for w in ["health", "score", "grade"]):
                return "health_score", 0.90
            if any(w in msg_l for w in ["emergency", "runway", "buffer"]):
                return "emergency_fund", 0.90
            if any(w in msg_l for w in ["debt", "loan", "emi", "snowball", "avalanche"]):
                return "debt_payoff", 0.90
            return "general_finance", 0.50

        try:
            import torch
            import torch.nn.functional as F
            encoded = tokenizer([user_message], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                out = cls._model_minilm(**encoded)
                mask = encoded['attention_mask'].unsqueeze(-1)
                emb = torch.sum(out.last_hidden_state * mask, 1) / torch.clamp(mask.sum(1), min=1e-9)
                emb_norm = F.normalize(emb, p=2, dim=1)

            sims = torch.mm(emb_norm, cls._intent_embeddings.t())[0]
            best_idx = torch.argmax(sims).item()
            best_score = float(sims[best_idx].item())
            intent_name = cls.INTENTS[best_idx][0]
            return intent_name, best_score
        except Exception as e:
            logger.debug(f"HF intent classification note: {e}")
            return "general_finance", 0.50

    @classmethod
    def generate_reply(
        cls,
        user_message: str,
        user_context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate intelligent financial response combining Hugging Face semantic routing,
        precise financial computation, and FLAN-T5 generation.
        """
        clean_msg = (user_message or "").strip()
        intent, confidence = cls.classify_intent(clean_msg)
        logger.info(f"Classified query intent: {intent} (Confidence: {confidence:.2f})")

        balance = user_context.get("current_balance", 0.0)
        income = user_context.get("monthly_income", 0.0)
        expense = user_context.get("current_month_expense", 0.0)
        savings = user_context.get("net_savings", 0.0)
        savings_rate = user_context.get("savings_rate", 0.0)
        health_score = user_context.get("health_score", 81)
        health_grade = user_context.get("health_grade", "A")
        top_cats = user_context.get("top_categories", [])

        # -------------------------------------------------------------
        # ROUTE 1: Affordability Check
        # -------------------------------------------------------------
        if intent == "affordability":
            # Extract requested amount from message
            amt_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)', clean_msg, re.IGNORECASE)
            req_amt = 50000.0
            if amt_match:
                try:
                    val = float(amt_match.group(1).replace(",", ""))
                    if val > 0:
                        req_amt = val
                except ValueError:
                    pass

            pct_of_balance = (req_amt / balance * 100.0) if balance > 0 else 100.0
            can_afford = (req_amt <= balance * 0.40) and (savings >= req_amt * 0.20 or balance > req_amt * 2.5)

            status_badge = "✅ **Verdict: Comfortable to Proceed**" if can_afford else "⚠️ **Verdict: Caution Advised (High Cash Drag)**"
            buffer_after = max(0.0, balance - req_amt)

            reply = f"""### 🛡️ FinPilot Affordability Stress-Test

{status_badge}

- **Target Purchase Amount**: {format_inr(req_amt)}
- **Current Liquid Balance**: {format_inr(balance)}
- **Share of Liquid Capital**: **{pct_of_balance:.1f}%**
- **Remaining Buffer After Purchase**: **{format_inr(buffer_after)}**

#### 💡 Strategic Advisory:
1. **Liquid Runway Impact**: A sound financial practice is retaining at least 3–6 months of essential living expenses ({format_inr(expense * 3 if expense > 0 else 45000)}).
2. **Payment Strategy**: If purchasing, consider paying upfront to avoid high revolving credit card APR (36%–42% p.a.), or opt for a 0% interest no-cost EMI only if total tenure is under 6 months.
3. **Savings Rate Context**: You currently save **{format_inr(savings)}/month ({savings_rate:.1f}%)**. At your current pace, replenishing this purchase would take approximately **{math.ceil(req_amt / max(savings, 1)):.0f} months**."""

            return {
                "reply": reply,
                "suggested_actions": ["Calculate SIP returns instead", "Compare Old vs New Tax", "Review My Health Score"],
                "relevant_metrics": {"cost": req_amt, "buffer_after": buffer_after, "pct_balance": pct_of_balance},
                "model_used": "Hugging Face MiniLM + FinPilot Engine"
            }

        # -------------------------------------------------------------
        # ROUTE 2: SIP & Wealth Compounding
        # -------------------------------------------------------------
        if intent == "sip_investment":
            # Extract monthly investment
            sip_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)', clean_msg, re.IGNORECASE)
            p = 10000.0
            if sip_match:
                try:
                    val = float(sip_match.group(1).replace(",", ""))
                    if val > 0:
                        p = val
                except ValueError:
                    pass

            years = 15
            yr_match = re.search(r'(\d{1,2})\s*(?:years?|yrs?)', clean_msg, re.IGNORECASE)
            if yr_match:
                try:
                    years = int(yr_match.group(1))
                except ValueError:
                    pass

            r_monthly = 0.12 / 12.0  # 12% annual return assumption (Nifty 50 historical average)
            n_months = years * 12
            total_invested = p * n_months
            future_value = p * (((1 + r_monthly)**n_months - 1) / r_monthly) * (1 + r_monthly)
            wealth_gain = future_value - total_invested

            reply = f"""### 📈 Wealth Compounding & SIP Simulation (12% CAGR)

Investing **{format_inr(p)} per month** over **{years} years**:

- **Total Capital Invested**: **{format_inr(total_invested)}**
- **Estimated Wealth Gain**: **{format_inr(wealth_gain)}**
- **Total Projected Portfolio Value**: **{format_inr(future_value)}**
- **Wealth Multiplier**: **{(future_value / total_invested):.2f}x**

#### 🎯 Strategic Blueprint:
1. **Asset Allocation**: Split 70% in Nifty 50 / Large & Mid-Cap Index funds, 20% in Flexi-cap/Small-cap, and 10% in Sovereign Gold Bonds (SGB) or Arbitrage funds.
2. **Step-Up SIP**: Increasing your monthly SIP by just **10% each year** would boost your final maturity value from {format_inr(future_value)} to **{format_inr(future_value * 1.55)}**!
3. **Tax Advantage**: Long-term capital gains (LTCG) on equity mutual funds are tax-free up to ₹1.25 Lakh per financial year (Section 112A)."""

            return {
                "reply": reply,
                "suggested_actions": ["How to automate Step-Up SIP", "Can I afford ₹15,000 SIP?", "Compare with PPF & Gold"],
                "relevant_metrics": {"invested": total_invested, "projected": future_value, "wealth_gain": wealth_gain},
                "model_used": "Hugging Face MiniLM + FinPilot SIP Math"
            }

        # -------------------------------------------------------------
        # ROUTE 3: Indian Taxation (Old vs New Regime, 80C, 80D)
        # -------------------------------------------------------------
        if intent == "taxation":
            annual_income = income * 12 if income > 0 else 900000.0

            reply = f"""### 🏛️ Indian Income Tax Architecture: Old vs. New Regime

Based on your annualized income of **{format_inr(annual_income)}**:

#### 1. New Tax Regime (Default u/s 115BAC)
- **Standard Deduction**: Flat **₹75,000** deduction for salaried professionals.
- **Tax Rebate (Section 87A)**: Zero tax on taxable income up to **₹7,00,000**.
- **Slabs**:
  - ₹0 to ₹3,00,000: **Nil**
  - ₹3,00,001 to ₹7,00,000: **5%**
  - ₹7,00,001 to ₹10,00,000: **10%**
  - ₹10,00,001 to ₹12,00,000: **15%**
  - ₹12,00,001 to ₹15,00,000: **20%**
  - Above ₹15,00,000: **30%**

#### 2. Old Tax Regime (With Deductions)
- **Section 80C**: Up to **₹1,50,000** (EPF, PPF, ELSS mutual funds, LIC, principal on home loan).
- **Section 80D**: Up to **₹25,000** (₹50,000 for senior citizens) for health insurance premiums.
- **Section 24(b)**: Up to **₹2,00,000** on home loan interest.
- **HRA Exemption**: Under Section 10(13A) if renting.

#### 💡 Rule of Thumb Recommendation:
If your total annual deductions (80C + 80D + HRA + Home Loan Interest) exceed **₹3,75,000**, the **Old Regime** saves you more tax. Otherwise, the **New Regime** with simpler lower slabs is mathematically optimal."""

            return {
                "reply": reply,
                "suggested_actions": ["Calculate my exact tax liability", "Best 80C tax saving ELSS funds", "How to claim HRA"],
                "relevant_metrics": {"annual_income": annual_income},
                "model_used": "Hugging Face MiniLM + Indian Tax Rules"
            }

        # -------------------------------------------------------------
        # ROUTE 4: Spending Analysis & Cash Flow Breakdown
        # -------------------------------------------------------------
        if intent == "spending_analysis":
            cat_lines = []
            for c in top_cats[:5]:
                cat_lines.append(f"- **{c['name']}**: {format_inr(c['amount'])} ({c['percentage']}%)")
            cat_str = "\n".join(cat_lines) if cat_lines else "- No debit transactions recorded in this period."

            reply = f"""### 📊 Real-Time Cash Flow & Category Analysis

Here is where your capital was deployed over the last 30 days:

- **Total Inflow (Income)**: **{format_inr(income)}**
- **Total Outflow (Spend)**: **{format_inr(expense)}**
- **Net Surplus / Savings**: **{format_inr(savings)} ({savings_rate:.1f}%)**
- **Liquid Capital Balance**: **{format_inr(balance)}**

#### 🏷️ Top Spending Categories:
{cat_str}

#### 💡 Advisor Takeaway:
Your largest spending concentration is in **{top_cats[0]['name'] if top_cats else 'General'}**. Trimming non-essential discretionary expenses by 10% would redirect an extra **{format_inr(expense * 0.10)}** directly into your investment ledger each month."""

            return {
                "reply": reply,
                "suggested_actions": ["Optimize my grocery spending", "Set a monthly budget cap", "Simulate 50/30/20 rebalance"],
                "relevant_metrics": {"income": income, "expense": expense, "savings": savings},
                "model_used": "Hugging Face MiniLM + Real-time Ledger"
            }

        # -------------------------------------------------------------
        # ROUTE 5: 50/30/20 Budgeting Rule
        # -------------------------------------------------------------
        if intent == "budget_50_30_20":
            needs = income * 0.50
            wants = income * 0.30
            savings_target = income * 0.20

            reply = f"""### 🎯 The 50/30/20 Wealth Allocation Framework

Calibrated to your monthly income of **{format_inr(income)}**:

1. **50% Needs & Essentials ({format_inr(needs)})**:
   - Rent/Housing, Groceries, Electricity, Water, Broadband, Transport fuel, and Loan EMIs.
2. **30% Discretionary Wants ({format_inr(wants)})**:
   - Dining out, Food delivery, Shopping, Streaming subscriptions, Weekend leisure.
3. **20% Savings & Wealth Building ({format_inr(savings_target)})**:
   - Automated SIPs in index mutual funds, Emergency cash reserve, PPF, and Gold.

#### ⚖️ Current Performance:
Your actual savings rate is **{savings_rate:.1f}% ({format_inr(savings)})**. {'You are beating the standard 20% savings threshold!' if savings_rate >= 20 else 'Targeting a 20% minimum savings allocation will accelerate your emergency buffer.'}"""

            return {
                "reply": reply,
                "suggested_actions": ["Automate my 20% savings", "How to trim 30% wants", "Set category budget limits"],
                "relevant_metrics": {"needs": needs, "wants": wants, "savings": savings_target},
                "model_used": "Hugging Face MiniLM + 50/30/20 Framework"
            }

        # -------------------------------------------------------------
        # ROUTE 6: General Financial Concepts & FLAN-T5 Synthesis
        # -------------------------------------------------------------
        model_t5, tokenizer_t5 = cls.get_flan_model()
        flan_generated_answer = None

        if model_t5 is not None and tokenizer_t5 is not None:
            try:
                flan_prompt = (
                    f"Answer this financial question thoroughly and concisely for an individual in India: {clean_msg}"
                )
                inputs = tokenizer_t5(flan_prompt, return_tensors="pt")
                outputs = model_t5.generate(**inputs, max_length=150, num_beams=2, early_stopping=True)
                flan_generated_answer = tokenizer_t5.decode(outputs[0], skip_special_tokens=True)
            except Exception as e:
                logger.debug(f"FLAN-T5 generation exception: {e}")

        # Construct comprehensive markdown response
        advisor_insight = flan_generated_answer if flan_generated_answer and len(flan_generated_answer) > 20 else (
            "Building lasting personal wealth requires disciplined cash-flow management: establishing an emergency reserve, "
            "automating low-cost index fund investments, avoiding high-interest unsecured debt, and optimizing for tax efficiency."
        )

        reply = f"""### 💡 FinPilot Financial Advisory

{advisor_insight}

#### 📊 Your Current Financial Snapshot:
- **Liquid Bank Balance**: **{format_inr(balance)}**
- **Monthly Inflow**: **{format_inr(income)}**
- **30-Day Outflow**: **{format_inr(expense)}**
- **Current Savings Rate**: **{savings_rate:.1f}% ({format_inr(savings)})**
- **Financial Health Score**: **{health_score}/100 (Grade {health_grade})**

#### 🎯 Recommended Action Items:
1. **Automate Wealth Building**: Ensure at least 15%–20% of monthly income is routed automatically on salary day into index mutual funds.
2. **Safeguard with Emergency Buffer**: Maintain 3–6 months of essential outflow in a high-yield liquid fund or sweep FD.
3. **Debt Prudence**: Prioritize paying off any credit card balances or personal loans before increasing discretionary allocations."""

        return {
            "reply": reply,
            "suggested_actions": ["Calculate SIP returns for ₹10,000", "Can I afford a ₹50,000 purchase?", "Compare Old vs New Tax Regime"],
            "relevant_metrics": {"balance": balance, "savings_rate": savings_rate, "health_score": health_score},
            "model_used": "Hugging Face FLAN-T5 + MiniLM"
        }
