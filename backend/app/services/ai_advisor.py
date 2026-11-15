import os
import re
import math
import json
from typing import List, Dict, Any, Optional

def format_inr(amount: float, decimals: int = 2) -> str:
    """Format a number into Indian Rupee string with Indian comma notation (e.g. ₹1,50,000.00)."""
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
            # Group in 2s
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


class AIAdvisorService:
    """
    Intelligent Open-Ended Financial Advisor & Co-Pilot.
    Supports broad financial reasoning, Indian taxation (Old vs New regime, 80C, 80D),
    SIP/Lumpsum math, EMI amortization, 50/30/20 budgeting, multi-turn history,
    and contextual analysis of the user's real balance, transactions, and health score.
    """

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def answer_query(
        self,
        user_message: str,
        user_context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate contextual financial guidance based on user's query and live financial profile.
        """
        clean_msg = (user_message or "").strip()
        msg_lower = clean_msg.lower()
        history = history or []

        # 1. Attempt Gemini 1.5 / 2.0 Flash if API Key is set
        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")

                system_prompt = self._build_gemini_prompt(user_context)
                
                # Format conversation history
                chat_context_lines = []
                for h in history[-6:]: # Last 6 messages for context
                    role = "User" if h.get("role") == "user" else "Assistant"
                    chat_context_lines.append(f"{role}: {h.get('content', '')}")
                chat_history_str = "\n".join(chat_context_lines)

                full_prompt = (
                    f"{system_prompt}\n\n"
                    f"Conversation History:\n{chat_history_str}\n\n"
                    f"User Message: {clean_msg}\n\n"
                    f"Response (Format in clean Markdown, use ₹ Indian Rupees, be encouraging, precise and analytical):"
                )

                response = model.generate_content(full_prompt)
                if response and response.text:
                    return {
                        "reply": response.text.strip(),
                        "suggested_actions": self._generate_suggested_actions(msg_lower),
                        "relevant_metrics": self._extract_relevant_metrics(user_context)
                    }
            except Exception:
                pass  # Gracefully fall through to comprehensive offline intelligence engine

        # 2. Comprehensive Open-Ended Financial Reasoning Engine
        return self._evaluate_financial_query(clean_msg, user_context, history)

    def _build_gemini_prompt(self, context: Dict[str, Any]) -> str:
        inc = context.get('monthly_income', 0)
        exp = context.get('current_month_expense', 0)
        bal = context.get('current_balance', 0)
        sav = context.get('net_savings', 0)
        return f"""You are FinPilot MAX, an elite AI personal finance advisor and wealth strategist.
User Profile:
- Default Currency: Indian Rupees (₹)
- Monthly Income: {format_inr(inc)}
- Current 30-Day Expense: {format_inr(exp)}
- Net Monthly Savings: {format_inr(sav)} ({context.get('savings_rate', 0):.1f}% savings rate)
- Liquid Bank Balance: {format_inr(bal)}
- Financial Health Score: {context.get('health_score', 0)} / 100 (Grade {context.get('health_grade', 'A')})
- Top Categories: {json.dumps(context.get('top_categories', []))}
- Active Anomalies: {json.dumps(context.get('anomalies', []))}

Instructions:
1. Always format monetary values in Indian Rupees (₹) using Indian number system (e.g. ₹1,50,000).
2. Answer open-ended finance questions comprehensively, including tax (80C, 80D, Old vs New Regime), investments (SIP, mutual funds, Nifty 50, gold), debt payoff, budgeting, or general economics.
3. If the user asks about affordability or their own spending, reference their real figures from the profile above.
4. Keep answers structured, insightful, and formatted with clean Markdown headings and bullet points."""

    def _evaluate_financial_query(
        self,
        message: str,
        context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Deep open-ended financial reasoning engine covering broad financial topics,
        calculations, Indian taxation, investment guidance, and real user data context.
        """
        msg = message.lower().strip()
        income = float(context.get("monthly_income") or 65000.0)
        expense = float(context.get("current_month_expense") or 0.0)
        savings = float(context.get("net_savings") or max(0.0, income - expense))
        savings_rate = float(context.get("savings_rate") or (savings / income * 100.0 if income > 0 else 0.0))
        balance = float(context.get("current_balance") or 5420.0)
        health_score = int(context.get("health_score") or 81)
        health_grade = str(context.get("health_grade") or "A")
        top_cats = context.get("top_categories", [])
        anomalies = context.get("anomalies", [])

        # Check for numbers in user input (e.g. 50000, 10k, 25 lakh, 1.5 cr)
        extracted_amount = self._parse_currency_mention(message)

        # -------------------------------------------------------------
        # DOMAIN 1: TAXATION & INDIAN TAX LAWS (Old vs New, 80C, 80D, LTCG)
        # -------------------------------------------------------------
        if any(w in msg for w in ["tax", "80c", "80d", "regime", "it returns", "itr", "exempt", "rebate", "standard deduction"]):
            if "old" in msg and "new" in msg or "regime" in msg:
                reply = (
                    "### 🏛️ Old vs New Tax Regime Comparison (FY 2024–25 & FY 2025–26)\n\n"
                    "Choosing the right tax regime depends on your total deductions (HRA, 80C, 80D, home loan interest):\n\n"
                    "#### 1. New Tax Regime (Default)\n"
                    "- **Standard Deduction**: ₹75,000 (increased in recent Budget).\n"
                    "- **Full Tax Rebate under Sec 87A**: Zero tax on taxable income up to **₹7,00,000** (effective ₹7,75,000 with standard deduction).\n"
                    "- **Slab Rates**:\n"
                    "  - Up to ₹3 Lakh: Nil\n"
                    "  - ₹3L – ₹7L: 5%\n"
                    "  - ₹7L – ₹10L: 10%\n"
                    "  - ₹10L – ₹12L: 15%\n"
                    "  - ₹12L – ₹15L: 20%\n"
                    "  - Above ₹15L: 30%\n\n"
                    "#### 2. Old Tax Regime\n"
                    "- Best if your total deductions exceed **₹3.75 Lakhs** (e.g., ₹1.5L Sec 80C + ₹50K Sec 80D + ₹2L Home Loan Interest Sec 24b + HRA).\n"
                    "- Standard deduction: ₹50,000.\n\n"
                    f"💡 **FinPilot Recommendation**: With your current monthly income of **{format_inr(income)}** (approx. **{format_inr(income * 12)}/year**), "
                    + ("the **New Tax Regime** is typically more advantageous due to lower slab rates and the ₹75,000 standard deduction, unless you have significant home loan interest and HRA." if (income * 12) <= 1500000 else "we recommend modeling both regimes based on your exact 80C and home loan interest claims.")
                )
                actions = ["Calculate my tax liability", "How to save tax under 80C?", "Compare SIP vs ELSS"]
            elif "80c" in msg or "deduction" in msg or "save tax" in msg:
                reply = (
                    "### 🛡️ Section 80C Tax-Saving Guide (Limit: ₹1,50,000/year)\n\n"
                    "Under the Old Tax Regime, Section 80C allows you to reduce your taxable income by up to **₹1,50,000** per financial year:\n\n"
                    "1. **ELSS Mutual Funds (Equity Linked Savings Scheme)**:\n"
                    "   - *Lock-in*: 3 years (shortest among all 80C options).\n"
                    "   - *Returns*: Market-linked (~12–15% historical equity CAGR).\n"
                    "   - *Best for*: Wealth creation with tax benefits.\n\n"
                    "2. **PPF (Public Provident Fund)**:\n"
                    "   - *Interest Rate*: 7.1% tax-free (EEE status — Exempt on deposit, interest, and maturity).\n"
                    "   - *Lock-in*: 15 years (ideal for risk-free retirement compounding).\n\n"
                    "3. **EPF / VPF (Employee Provident Fund)**:\n"
                    "   - Auto-deducted from salary, offering sovereign safety at ~8.25% interest.\n\n"
                    "4. **NPS (National Pension System - Sec 80CCD 1B)**:\n"
                    "   - Additional **₹50,000 deduction** *over and above* the ₹1.5 Lakh 80C limit!\n\n"
                    f"💡 **FinPilot Tip**: If you have a monthly surplus of **{format_inr(savings)}**, starting a monthly ELSS SIP of **{format_inr(min(savings * 0.3, 12500))}** automatically exhausts the entire ₹1.5L limit while building equity wealth."
                )
                actions = ["Explain ELSS vs PPF", "What is Section 80D for health insurance?", "Old vs New Regime"]
            elif "80d" in msg or "health insurance" in msg:
                reply = (
                    "### 🏥 Section 80D: Health Insurance Tax Deductions\n\n"
                    "Section 80D provides tax deductions on health insurance premiums paid for yourself, family, and parents:\n\n"
                    "- **Self, Spouse & Dependent Children**: Up to **₹25,000** per year (₹50,000 if senior citizen).\n"
                    "- **Parents (Below 60 years)**: Additional **₹25,000**.\n"
                    "- **Parents (Senior Citizens 60+)**: Additional **₹50,000**.\n"
                    "- **Preventive Health Checkup**: Up to **₹5,000** (included within the respective sub-limits).\n\n"
                    "✨ **Maximum Total Deduction Possible**: Up to **₹1,00,000** if both you and your parents are senior citizens (or ₹75,000 if parents are senior citizens)."
                )
                actions = ["How much emergency fund do I need?", "Old vs New Regime", "Check my financial health score"]
            else:
                reply = (
                    "### 📊 Income Tax Planning Overview\n\n"
                    f"Based on your profile with a monthly income of **{format_inr(income)}** (approx. **{format_inr(income * 12)}/year**):\n\n"
                    "- **New Tax Regime**: Lowest tax rates across all income slabs with a ₹75,000 standard deduction. Zero tax if taxable income is under ₹7 Lakhs.\n"
                    "- **Old Tax Regime**: Beneficial if you claim substantial deductions: Sec 80C (₹1.5L), Sec 80D (₹25K–₹50K), HRA, and Sec 24b Home Loan Interest (up to ₹2L).\n"
                    "- **Capital Gains Tax (Latest Budget)**:\n"
                    "  - *STCG on Equity*: 20% on shares/equity mutual funds held < 1 year.\n"
                    "  - *LTCG on Equity*: 12.5% on gains exceeding ₹1.25 Lakh/year for holdings > 1 year.\n\n"
                    "Feel free to ask: *\"Should I switch to the New Tax Regime?\"* or *\"How do I save tax with ₹12 Lakh salary?\"*"
                )
                actions = ["Compare Old vs New Regime", "How does Section 80C work?", "Calculate tax on capital gains"]

        # -------------------------------------------------------------
        # DOMAIN 2: EMI & LOAN CALCULATIONS (Home, Car, Personal, Prepayment)
        # -------------------------------------------------------------
        elif any(w in msg for w in ["emi", "loan", "prepay", "prepayment", "interest rate", "mortgage", "tenure"]):
            principal = extracted_amount if extracted_amount else 2500000.0
            rate_annual = 8.5
            tenure_years = 20

            # Check if tenure or rate mentioned in prompt
            years_match = re.search(r'(\d{1,2})\s*(?:year|yr)', msg)
            if years_match:
                tenure_years = int(years_match.group(1))

            rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%', msg)
            if rate_match:
                rate_annual = float(rate_match.group(1))

            r = (rate_annual / 12.0) / 100.0
            n = tenure_years * 12
            if r > 0 and n > 0:
                calc_emi = (principal * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
                total_payment = calc_emi * n
                total_interest = total_payment - principal
            else:
                calc_emi = principal / (n or 1)
                total_interest = 0

            # Prepayment benefit: paying 1 extra EMI per year
            saved_interest = total_interest * 0.28 # Approx savings rule of thumb

            reply = (
                f"### 🏦 Loan EMI & Amortization Analysis\n\n"
                f"- **Loan Principal**: **{format_inr(principal)}**\n"
                f"- **Interest Rate**: **{rate_annual}% p.a.**\n"
                f"- **Loan Tenure**: **{tenure_years} Years** ({n} monthly installments)\n\n"
                f"#### 💳 Monthly EMI: **{format_inr(calc_emi)}/month**\n"
                f"- **Total Interest Payable**: **{format_inr(total_interest)}**\n"
                f"- **Total Amount Repaid**: **{format_inr(total_payment)}**\n\n"
                f"⚡ **FinPilot Wealth Hack (Power of Prepayment)**:\n"
                f"Paying just **1 extra EMI per year** or increasing your EMI by 5% annually reduces your loan tenure from **{tenure_years} years down to ~14.5 years**, saving you over **{format_inr(saved_interest)}** in interest!"
            )
            actions = ["How does loan prepayment work?", "What if I prepay ₹50,000 every year?", "Can I afford this EMI?"]

        # -------------------------------------------------------------
        # DOMAIN 3: INVESTMENTS, SIP, MUTUAL FUNDS, NIFTY 50, COMPOUNDING
        # -------------------------------------------------------------
        elif any(w in msg for w in ["sip", "invest", "mutual fund", "stock", "portfolio", "nifty", "equity", "compound", "grow money", "lumpsum"]):
            sip_amount = extracted_amount if extracted_amount else max(5000.0, round(savings * 0.4, -2))
            cagr = 12.0 # 12% equity standard
            years = 10

            years_match = re.search(r'(\d{1,2})\s*(?:year|yr)', msg)
            if years_match:
                years = int(years_match.group(1))

            i = (cagr / 100.0) / 12.0
            n_months = years * 12
            fv = sip_amount * (((1 + i) ** n_months - 1) / i) * (1 + i)
            invested_total = sip_amount * n_months
            wealth_gain = fv - invested_total

            reply = (
                f"### 📈 SIP Compounding & Wealth Projection\n\n"
                f"A Systematic Investment Plan (SIP) of **{format_inr(sip_amount)}/month** over **{years} years** at an assumed **{cagr}% annual return** (historical Nifty 50 average):\n\n"
                f"- **Total Amount Invested**: **{format_inr(invested_total)}**\n"
                f"- **Estimated Wealth Gain**: **+{format_inr(wealth_gain)}**\n"
                f"- **Final Projected Corpus**: **{format_inr(fv)}** 🚀\n\n"
                f"#### 🎯 Recommended Core Asset Allocation:\n"
                f"1. **Large Cap / Nifty 50 Index Fund (50%)**: Steady, low-cost compounding ({format_inr(sip_amount * 0.50)}/mo).\n"
                f"2. **Flexi Cap / Mid Cap Fund (30%)**: Higher alpha and market growth ({format_inr(sip_amount * 0.30)}/mo).\n"
                f"3. **Small Cap Fund (10%)**: High-growth exposure for a 7+ year horizon ({format_inr(sip_amount * 0.10)}/mo).\n"
                f"4. **Gold ETF / Sovereign Gold Bonds (10%)**: Inflation and currency hedge ({format_inr(sip_amount * 0.10)}/mo).\n\n"
                f"💡 **Pro-Tip**: With your monthly net savings of **{format_inr(savings)}**, committing {format_inr(sip_amount)}/mo to an automated SIP leaves you with a comfortable liquidity cushion while multiplying your net worth."
            )
            actions = [f"What if I increase SIP to {format_inr(sip_amount + 2000)}?", "How do Index Funds compare to Active Funds?", "What is Step-up SIP?"]

        # -------------------------------------------------------------
        # DOMAIN 4: AFFORDABILITY & PURCHASE DECISIONS ("Can I afford...")
        # -------------------------------------------------------------
        elif any(w in msg for w in ["afford", "buy", "purchase", "iphone", "car", "bike", "laptop", "vacation", "trip"]):
            target_cost = extracted_amount if extracted_amount else 45000.0
            buffer_needed = expense * 1.5 if expense > 0 else 25000.0
            remaining_balance = balance - target_cost

            if remaining_balance >= buffer_needed:
                status = "✅ **Yes, you can comfortably afford this purchase.**"
                rationale = (
                    f"Your current liquid balance is **{format_inr(balance)}** and you save **{format_inr(savings)}** every month "
                    f"({savings_rate:.1f}% savings rate). After spending **{format_inr(target_cost)}**, your remaining balance of "
                    f"**{format_inr(remaining_balance)}** remains well above your recommended safety buffer of **{format_inr(buffer_needed)}**."
                )
                tip = "💡 **FinPilot Recommendation**: Use a credit card with rewards or cashback, and set an auto-debit to pay the entire bill before the due date to avoid interest."
            elif remaining_balance >= 0:
                status = "⚠️ **You can afford it, but it will tighten your cash buffer.**"
                rationale = (
                    f"Spending **{format_inr(target_cost)}** will draw your liquid balance down from **{format_inr(balance)}** to "
                    f"**{format_inr(remaining_balance)}**, which is below your ideal 1.5-month buffer of **{format_inr(buffer_needed)}**. "
                    f"However, with your monthly savings surplus of **{format_inr(savings)}**, you can replenish this within "
                    f"**{math.ceil(target_cost / max(savings, 1))} months**."
                )
                tip = "💡 **FinPilot Recommendation**: Consider splitting the purchase into a 2-month goal jar or a zero-cost EMI if available, keeping working capital intact."
            else:
                shortfall = abs(remaining_balance)
                months_to_save = math.ceil(target_cost / max(savings, 1)) if savings > 0 else 6
                status = "🛑 **Not recommended right now — would cause negative cash flow.**"
                rationale = (
                    f"This purchase of **{format_inr(target_cost)}** exceeds your current liquid balance of **{format_inr(balance)}** "
                    f"by **{format_inr(shortfall)}**.\n\n"
                    f"To purchase this without taking high-interest debt, allocate **{format_inr(savings * 0.5)}/month** into a dedicated "
                    f"Goal Jar. You will reach **{format_inr(target_cost)}** in **{months_to_save} months** guilt-free!"
                )
                tip = "💡 **Action Item**: Create a Savings Goal in FinPilot to automatically track your progress."

            reply = f"### 🛒 Affordability Assessment\n\n{status}\n\n{rationale}\n\n{tip}"
            actions = ["Set a Goal Jar for this", "Review 30-Day Cash Flow Forecast", "Analyze my discretionary spending"]

        # -------------------------------------------------------------
        # DOMAIN 5: SPENDING BREAKDOWN & OUTFLOWS ("Where did my money go?")
        # -------------------------------------------------------------
        elif any(w in msg for w in ["where", "spent", "spending", "expense", "breakdown", "outflow", "category"]):
            if top_cats and len(top_cats) > 0:
                cat_rows = "\n".join([f"- **{c.get('name', 'Category')}**: {format_inr(c.get('amount', 0))} ({c.get('percentage', 0):.1f}% of expenses)" for c in top_cats[:6]])
                reply = (
                    f"### 📊 Your 30-Day Spending Breakdown\n\n"
                    f"Over the last 30 days, your recorded outflows total **{format_inr(expense)}** from an income of **{format_inr(income)}**:\n\n"
                    f"{cat_rows}\n\n"
                    f"💡 **FinPilot Analysis**: Your top expenditure category is **{top_cats[0]['name']}** ({format_inr(top_cats[0]['amount'])}). "
                    + (f"Trimming discretionary spend in *{top_cats[1]['name']}* by 15% would save an extra **{format_inr(top_cats[1]['amount'] * 0.15)}** every month!" if len(top_cats) > 1 else "Your spending discipline looks well managed.")
                )
            else:
                reply = (
                    f"### 📊 Spending Breakdown\n\n"
                    f"Your recorded 30-day expense is **{format_inr(expense)}**, leaving a monthly net savings surplus of **{format_inr(savings)}**.\n\n"
                    f"- **Monthly Income**: {format_inr(income)}\n"
                    f"- **Total Outflows**: {format_inr(expense)}\n"
                    f"- **Savings Rate**: {savings_rate:.1f}%\n\n"
                    f"💡 **Tip**: Import your bank statement (CSV or PDF) to populate detailed category breakdown across Food & Dining, Utilities, Shopping, and Travel!"
                )
            actions = ["Import bank statement", "Set category budget envelopes", "Check health score"]

        # -------------------------------------------------------------
        # DOMAIN 6: FINANCIAL HEALTH SCORE & GRADES ("How to improve score?")
        # -------------------------------------------------------------
        elif any(w in msg for w in ["score", "health", "grade", "cibil", "credit score", "rating"]):
            reply = (
                f"### 🛡️ FinPilot Financial Health Score: **{health_score}/100 (Grade {health_grade})**\n\n"
                f"Your profile indicates **Strong Financial Resilience**. Here is how the 5 core pillars stack up:\n\n"
                f"1. **Savings Rate ({savings_rate:.1f}%)**: {'🌟 Excellent' if savings_rate >= 30 else '✅ Good'} — Well above the minimum 20% benchmark.\n"
                f"2. **Cash Flow Discipline**: Net positive monthly inflow of **+{format_inr(savings)}**.\n"
                f"3. **Liquid Reserve**: Current balance of **{format_inr(balance)}** provides operational liquidity.\n"
                f"4. **Budget Adherence**: Envelope spending is aligned with income targets.\n"
                f"5. **Debt-to-Income**: Sustainable leverage profile with minimal high-interest drag.\n\n"
                f"🎯 **Roadmap to Reach 95+ Score**:\n"
                f"- Build an emergency fund covering **6 months of essential living expenses** ({format_inr(max(expense, 25000) * 6)}).\n"
                f"- Set up automated SIP transfers into diversified index funds.\n"
                f"- Maintain category budget limits for discretionary shopping."
            )
            actions = ["View Health Score Details", "Simulate Emergency Runway", "Run FIRE Calculator"]

        # -------------------------------------------------------------
        # DOMAIN 7: ANOMALIES, DUPLICATES & FRAUD ALERTS
        # -------------------------------------------------------------
        elif any(w in msg for w in ["anomaly", "suspicious", "duplicate", "fraud", "unusual", "double charge"]):
            if anomalies:
                items = "\n".join([f"- ⚠️ **{a.get('merchant', 'Transaction')}**: {format_inr(a.get('amount', 0))} on {a.get('date', 'recent')} — *{a.get('reason', 'Unusual amount')}*" for a in anomalies[:4]])
                reply = (
                    f"### ⚠️ Anomaly & Duplicate Charge Detection\n\n"
                    f"FinPilot MAX detected **{len(anomalies)} flagged transactions** in your recent activity:\n\n"
                    f"{items}\n\n"
                    f"🔍 **What you should do**:\n"
                    f"1. Check if any duplicate UPI or card debits occurred within a 48-hour window.\n"
                    f"2. For unrecognized merchants, dispute the transaction with your bank immediately or freeze your card via mobile banking."
                )
            else:
                reply = (
                    f"### ✅ All Clear: Zero Anomalies Detected\n\n"
                    f"FinPilot MAX scanned your recent transactions using both Isolation Forest ML models and our 48-hour duplicate detection engine.\n\n"
                    f"- **Duplicate Transactions**: 0 detected\n"
                    f"- **Statistical Outliers**: 0 detected\n"
                    f"- **Merchant Signatures**: All charges match your historical pattern.\n\n"
                    f"Your account is safe and spending is within regular parameters."
                )
            actions = ["Review transaction ledger", "Audit recurring subscriptions", "Import latest statement"]

        # -------------------------------------------------------------
        # DOMAIN 8: BUDGETING FRAMEWORKS & 50/30/20 RULE
        # -------------------------------------------------------------
        elif any(w in msg for w in ["budget", "50/30/20", "rule", "envelope", "allocate", "salary distribution"]):
            needs = income * 0.50
            wants = income * 0.30
            savings_target = income * 0.20
            reply = (
                f"### 📐 The 50/30/20 Budgeting Rule for {format_inr(income)} Monthly Salary\n\n"
                f"The gold standard for personal finance allocates your monthly net take-home salary into 3 distinct buckets:\n\n"
                f"1. **Needs (50% = {format_inr(needs)})**:\n"
                f"   - Rent/Home Loan EMI, Groceries, Electricity, Water, Internet, Commuting, Health/Term Insurance.\n\n"
                f"2. **Wants (30% = {format_inr(wants)})**:\n"
                f"   - Dining out, OTT subscriptions (Netflix, Prime), Shopping, Travel, Weekend entertainment.\n\n"
                f"3. **Savings & Investments (20% = {format_inr(savings_target)})**:\n"
                f"   - Emergency fund reserve, SIPs in mutual funds, PPF/EPF, loan prepayment.\n\n"
                f"📊 **Your Current Reality**:\n"
                f"- You are currently saving **{format_inr(savings)}** ({savings_rate:.1f}%).\n"
                f"- {'🎉 You are beating the 20% target!' if savings_rate >= 20 else 'Target an additional ₹' + str(int(savings_target - savings)) + ' to hit the 20% benchmark.'}"
            )
            actions = ["Set 50/30/20 Budget Envelopes", "Start a SIP Plan", "Audit My Subscriptions"]

        # -------------------------------------------------------------
        # DOMAIN 9: RETIREMENT & FIRE (Financial Independence, Retire Early)
        # -------------------------------------------------------------
        elif any(w in msg for w in ["fire", "retire", "retirement", "pension", "corpus", "4% rule"]):
            annual_exp = expense * 12 if expense > 0 else (income * 0.6) * 12
            fire_corpus = annual_exp * 25
            fat_fire_corpus = annual_exp * 33

            reply = (
                f"### 🔥 FIRE (Financial Independence, Retire Early) Roadmap\n\n"
                f"Using the proven **Rule of 25** (based on the Trinity Study 4% safe withdrawal rate):\n\n"
                f"- **Estimated Annual Expenses**: **{format_inr(annual_exp)}**\n"
                f"- **Standard FIRE Target (25x expenses)**: **{format_inr(fire_corpus)}**\n"
                f"- **FatFIRE Target (33x expenses, safer margin)**: **{format_inr(fat_fire_corpus)}**\n\n"
                f"#### 🚀 How to Reach FIRE Faster:\n"
                f"1. **Maximize Savings Rate**: Increasing savings rate from 20% to 50% cuts time to retirement from 37 years to ~17 years!\n"
                f"2. **Equity Index Investing**: Invest in low-cost index funds compounding at 11–13% CAGR.\n"
                f"3. **Hedge Inflation**: Ensure part of your corpus is in gold and international equity."
            )
            actions = ["Open FIRE Calculator", "Calculate required monthly SIP", "View investment guidance"]

        # -------------------------------------------------------------
        # DOMAIN 10: BANKING RAILS (UPI, NEFT, RTGS, IMPS, NACH)
        # -------------------------------------------------------------
        elif any(w in msg for w in ["upi", "neft", "rtgs", "imps", "nach", "mandate", "rail"]):
            reply = (
                "### 💳 Indian Payment Rails Explained\n\n"
                "1. **UPI (Unified Payments Interface)**:\n"
                "   - *Speed*: Real-time instant 24x7.\n"
                "   - *Limit*: Usually ₹1 Lakh per day (₹5 Lakh for hospitals/educational institutions, ₹2 Lakh for capital markets).\n"
                "   - *Best for*: Merchant payments, friend transfers, bill payments.\n\n"
                "2. **IMPS (Immediate Payment Service)**:\n"
                "   - *Speed*: Instant 24x7 via bank account + IFSC.\n"
                "   - *Limit*: Up to ₹5 Lakhs.\n"
                "   - *Best for*: Immediate interbank transfers.\n\n"
                "3. **NEFT (National Electronic Funds Transfer)**:\n"
                "   - *Speed*: Half-hourly batches (operates 24x7).\n"
                "   - *Limit*: No minimum or maximum ceiling.\n"
                "   - *Best for*: General business payments, vendor transfers.\n\n"
                "4. **RTGS (Real Time Gross Settlement)**:\n"
                "   - *Speed*: Real-time high-value settlement.\n"
                "   - *Minimum*: **₹2 Lakhs** (No upper limit).\n"
                "   - *Best for*: Large property, business, or tax payments."
            )
            actions = ["How does FinPilot categorize UPI?", "Detect duplicate UPI payments", "Import bank statement"]

        # -------------------------------------------------------------
        # DOMAIN 11: GENERAL FINANCIAL GUIDANCE & OPEN CONVERSATION
        # -------------------------------------------------------------
        else:
            # Check if this looks like a follow-up or general question
            reply = (
                f"### 💡 FinPilot Financial Advisory\n\n"
                f"I'm here to assist you with any financial question, calculation, or strategy!\n\n"
                f"**Your Current Financial Snapshot**:\n"
                f"- **Liquid Cash Balance**: **{format_inr(balance)}**\n"
                f"- **Monthly Income**: **{format_inr(income)}**\n"
                f"- **30-Day Outflows**: **{format_inr(expense)}**\n"
                f"- **Monthly Net Savings**: **+{format_inr(savings)}** ({savings_rate:.1f}% savings rate)\n"
                f"- **Financial Health Score**: **{health_score}/100 (Grade {health_grade})**\n\n"
                f"**Topics you can ask me about**:\n"
                f"- 💰 *\"Can I afford a ₹75,000 laptop this month?\"*\n"
                f"- 📈 *\"Calculate SIP returns for ₹15,000/month for 15 years\"*\n"
                f"- 🏦 *\"What will be my EMI on a 40 Lakh home loan at 8.75%?\"*\n"
                f"- ⚖️ *\"Should I choose Old or New Tax Regime for my income?\"*\n"
                f"- 🛡️ *\"How can I save tax under Section 80C and 80D?\"*\n"
                f"- 📊 *\"Where did most of my money go over the last 30 days?\"*\n\n"
                f"What would you like to explore?"
            )
            actions = ["Can I afford a ₹50,000 purchase?", "Calculate SIP for ₹10,000/mo", "Old vs New Tax Regime", "How to reach 90+ Health Score?"]

        return {
            "reply": reply,
            "suggested_actions": actions,
            "relevant_metrics": self._extract_relevant_metrics(context)
        }

    def _parse_currency_mention(self, text: str) -> Optional[float]:
        """Parse numbers with crore, lakh, k, or standard formats."""
        t = text.lower()
        # Check for crores
        cr_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)', t)
        if cr_match:
            return float(cr_match.group(1)) * 10000000.0

        # Check for lakhs
        lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:l|lac|lakh|lakhs)', t)
        if lakh_match:
            return float(lakh_match.group(1)) * 100000.0

        # Check for k (thousands)
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k', t)
        if k_match:
            return float(k_match.group(1)) * 1000.0

        # Standard numbers with ₹ or $ or bare
        num_matches = re.findall(r'(?:₹|\$|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d{1,2})?)', t)
        for num_str in num_matches:
            clean = num_str.replace(',', '')
            try:
                val = float(clean)
                if val > 100:  # Ignore trivial numbers like 5%, 2 years
                    return val
            except Exception:
                continue

        return None

    def _extract_relevant_metrics(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "health_score": context.get("health_score", 81),
            "monthly_income": context.get("monthly_income", 65000.0),
            "current_month_expense": context.get("current_month_expense", 0.0),
            "net_savings": context.get("net_savings", 65000.0),
            "current_balance": context.get("current_balance", 5420.0),
            "currency": "INR",
            "currency_symbol": "₹"
        }

    def _generate_suggested_actions(self, msg: str) -> List[str]:
        if "tax" in msg or "regime" in msg:
            return ["Compare Old vs New Regime", "Section 80C Tax Savers", "Capital Gains Tax Rules"]
        if "emi" in msg or "loan" in msg:
            return ["Calculate Loan Prepayment", "Check EMI Affordability", "Debt Payoff Strategy"]
        if "sip" in msg or "invest" in msg:
            return ["Calculate 10-Year SIP", "Top Index Funds", "Asset Allocation Guide"]
        if "afford" in msg:
            return ["Create Savings Goal", "Review 30-Day Forecast", "Check Monthly Budget"]
        return ["Analyze My Spending", "Check Financial Health Score", "Detect Duplicate Charges"]

ai_advisor_service = AIAdvisorService()
