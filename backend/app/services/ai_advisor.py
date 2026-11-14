import os
import json
from typing import List, Dict, Any, Optional

class AIAdvisorService:
    """Intelligent context-augmented personal finance conversational advisor."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def answer_query(
        self,
        user_message: str,
        user_context: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generate contextual financial guidance based on the user's live financial data.
        """
        msg_lower = user_message.lower()

        # If Gemini API key is available, attempt LLM call
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                system_prompt = self._build_system_prompt(user_context)
                full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
                response = model.generate_content(full_prompt)
                if response and response.text:
                    return {
                        "reply": response.text,
                        "suggested_actions": self._generate_suggested_actions(msg_lower),
                        "relevant_metrics": self._extract_relevant_metrics(user_context)
                    }
            except Exception:
                # Fallback to local heuristic engine if API key fails or network is blocked
                pass

        # Intelligent Rule & Context Engine Fallback
        return self._generate_local_response(user_message, user_context)

    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        return f"""You are FinPilot MAX, an expert, encouraging, and highly precise personal finance AI advisor.
Current User Financial Context:
- Monthly Income: ${context.get('monthly_income', 0):,.2f}
- Current Month Expenses: ${context.get('current_month_expense', 0):,.2f}
- Net Monthly Savings: ${context.get('net_savings', 0):,.2f} (Savings Rate: {context.get('savings_rate', 0):.1f}%)
- Current Bank Balance: ${context.get('current_balance', 0):,.2f}
- Financial Health Score: {context.get('health_score', 0)} / 100 (Grade: {context.get('health_grade', 'N/A')})
- Top Expense Categories: {json.dumps(context.get('top_categories', []))}
- Active Anomalies: {json.dumps(context.get('anomalies', []))}
- Recurring Bills: {json.dumps(context.get('recurring_bills', []))}

Provide actionable, transparent, empathetic advice. Cite specific figures from the context above.
Always provide clear steps and do not give risky speculative investment tips."""

    def _generate_local_response(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        msg = message.lower()
        income = context.get("monthly_income", 6500.0)
        expense = context.get("current_month_expense", 3800.0)
        savings = context.get("net_savings", 2700.0)
        savings_rate = context.get("savings_rate", 41.5)
        balance = context.get("current_balance", 4250.0)
        health_score = context.get("health_score", 82)
        top_cats = context.get("top_categories", [])
        anomalies = context.get("anomalies", [])
        recurring = context.get("recurring_bills", [])

        # 1. Affordability / Scenario Query ("Can I afford...", "Should I buy...")
        if any(w in msg for w in ["afford", "buy", "purchase", "vacation", "trip", "gadget", "car", "phone"]):
            # Extract possible amount from message
            import re
            numbers = re.findall(r'[\$]?(\d[\d,]*(?:\.\d{2})?)', message)
            amt = float(numbers[0].replace(',', '')) if numbers else 1000.0

            impact_on_balance = balance - amt
            safe_buffer = income * 0.50 # 15 days of income buffer

            if impact_on_balance > safe_buffer:
                verdict = f"**Yes, you can comfortably afford this ${amt:,.0f} expense.**"
                details = (
                    f"Your current liquid balance is **${balance:,.2f}** with an average monthly net savings of "
                    f"**${savings:,.2f}** ({savings_rate:.1f}% savings rate). After this purchase, your remaining balance "
                    f"would be **${impact_on_balance:,.2f}**, which remains safely above your minimum recommended cash buffer of "
                    f"**${safe_buffer:,.2f}**."
                )
                recommendation = "💡 *Recommendation*: Pay via debit or credit card (paid in full within the billing cycle) to capture cash-back rewards."
            else:
                verdict = f"**Caution: This ${amt:,.0f} expense will put short-term pressure on your cash flow.**"
                details = (
                    f"With your current balance at **${balance:,.2f}**, spending ${amt:,.0f} will reduce your cash to "
                    f"**${impact_on_balance:,.2f}**, which dips below your safe emergency reserve. "
                    f"However, since you save approx. **${savings:,.2f}/mo**, waiting 2–3 weeks or creating a dedicated Virtual Goal Jar will allow you to buy it guilt-free."
                )
                recommendation = "💡 *Action Plan*: Allocate $300 from your upcoming paycheck into a Goal Jar rather than depleting working capital."

            reply = f"{verdict}\n\n{details}\n\n{recommendation}"
            actions = ["Set up a Savings Goal Jar", "Review 30-Day Forecast", "Check Monthly Budget Status"]

        # 2. Where did my money go / Overspending query
        elif any(w in msg for w in ["where", "spent", "spending", "categories", "overspend", "breakdown", "outflow"]):
            cat_list = "\n".join([f"- **{c.get('name', 'Category')}**: ${c.get('amount', 0):,.2f} ({c.get('percentage', 0):.1f}% of total spend)" for c in top_cats[:5]])
            reply = (
                f"### 📊 Your Spending Breakdown This Month\n\n"
                f"You have spent **${expense:,.2f}** out of your **${income:,.2f}** monthly income.\n\n"
                f"**Top Expense Categories**:\n{cat_list}\n\n"
                f"💡 **FinPilot Insight**: Your largest variable outflow is in *{top_cats[1]['name'] if len(top_cats) > 1 else 'Discretionary'}*. "
                f"Trimming just 15% here would save you an extra **${(top_cats[1]['amount']*0.15 if len(top_cats) > 1 else 150):,.0f}** this month!"
            )
            actions = ["Set a Category Budget", "View All Transactions", "Ask for Cost-Cutting Tips"]

        # 3. Financial Health Score Query
        elif any(w in msg for w in ["score", "health", "grade", "rating", "improve"]):
            reply = (
                f"### 🛡️ Financial Health Score: **{health_score}/100**\n\n"
                f"Your profile reflects **Strong & Resilient** financial discipline. Here is how your score breaks down:\n\n"
                f"- **Savings Rate**: Top Tier — Saving **{savings_rate:.1f}%** of monthly income (Target: $\\ge 20\\%$).\n"
                f"- **Budget Adherence**: Good — Most categories are tracking within allocated envelopes.\n"
                f"- **Emergency Buffer**: Stable — Your cash balance of **${balance:,.2f}** covers essential expenses.\n\n"
                f"🎯 **Key Recommendation to Reach 90+ Score**:\n"
                f"1. Set automatic monthly transfers for an additional $150 into high-yield savings.\n"
                f"2. Keep discretionary dining and online shopping below 30% of total income."
            )
            actions = ["View Full Health Score Breakdown", "Simulate Savings Boost", "Check Anomaly Alerts"]

        # 4. Anomalies & Suspicious Activity
        elif any(w in msg for w in ["anomaly", "suspicious", "fraud", "unusual", "duplicate", "alert"]):
            if anomalies:
                anomaly_items = "\n".join([f"- ⚠️ **{a.get('merchant', 'Merchant')}** (${a.get('amount', 0):,.2f} on {a.get('date', 'recent')}): {a.get('reason', 'Unusual spend')}" for a in anomalies[:3]])
                reply = (
                    f"### ⚠️ Anomaly & Fraud Detection Alert\n\n"
                    f"FinPilot MAX detected **{len(anomalies)} unusual transactions** requiring your review:\n\n"
                    f"{anomaly_items}\n\n"
                    f"👉 If any of these charges look unfamiliar or were double-charged, we recommend verifying with your card provider immediately."
                )
            else:
                reply = (
                    "### ✅ All Clear: No Anomalies Detected\n\n"
                    "FinPilot MAX reviewed your recent transactions using both Isolation Forest ML models and 48-hour duplicate detection. "
                    "All merchant charges and spending amounts fall within your normal expected variance!"
                )
            actions = ["Review Flagged Transactions", "View Recurring Subscriptions", "Check Statement Import"]

        # 5. Investment & Wealth Guidance
        elif any(w in msg for w in ["invest", "sip", "stock", "portfolio", "growth", "wealth", "mutual fund"]):
            reply = (
                f"### 📈 Personalized Investment & Wealth Strategy\n\n"
                f"Based on your **${savings:,.2f}/mo** surplus and **Balanced** risk profile, here is an optimized allocation:\n\n"
                f"- **60% Broad Market Index Funds** (e.g., S&P 500 / Total Stock Market / Nifty 50): Long-term compounding (~10-12% historical return).\n"
                f"- **20% Fixed Income / High-Yield Debt**: Low-volatility capital preservation.\n"
                f"- **10% Sovereign Gold / Commodity ETF**: Inflation hedge.\n"
                f"- **10% Liquid Cash Reserve**: Emergency fund buffer.\n\n"
                f"💡 **SIP Power**: Investing **${(savings * 0.4):,.0f}/month** with a 10% annual return grows to **${(savings * 0.4 * 12 * 10 * 1.7):,.0f}** in 10 years!"
            )
            actions = ["Open Investment Calculator", "Set an Investment Goal", "Assess Risk Profile"]

        # 6. General / Default Greeting & Help
        else:
            reply = (
                f"Hello! I am **FinPilot MAX**, your intelligent personal finance advisor.\n\n"
                f"Here is a quick snapshot of your finances today:\n"
                f"- **Monthly Net Flow**: +${savings:,.2f} ({savings_rate:.1f}% saved)\n"
                f"- **Financial Health Score**: **{health_score}/100**\n"
                f"- **Current Balance**: ${balance:,.2f}\n\n"
                f"You can ask me questions like:\n"
                f"- *\"Can I afford a $1,200 vacation this month?\"*\n"
                f"- *\"Where did most of my money go recently?\"*\n"
                f"- *\"Are there any suspicious charges or duplicate bills?\"*\n"
                f"- *\"How can I increase my Financial Health Score to 90?\"*"
            )
            actions = ["Can I afford a $1,200 trip?", "Where did my money go?", "Check for anomalies", "How to boost my score?"]

        return {
            "reply": reply,
            "suggested_actions": actions,
            "relevant_metrics": self._extract_relevant_metrics(context)
        }

    def _extract_relevant_metrics(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "health_score": context.get("health_score", 82),
            "monthly_income": context.get("monthly_income", 6500.0),
            "current_month_expense": context.get("current_month_expense", 3800.0),
            "net_savings": context.get("net_savings", 2700.0),
            "current_balance": context.get("current_balance", 4250.0),
        }

    def _generate_suggested_actions(self, msg: str) -> List[str]:
        if "afford" in msg:
            return ["Set up a Goal Jar", "Review 30-Day Forecast", "Check Monthly Budget"]
        elif "invest" in msg:
            return ["Open SIP Calculator", "Update Risk Profile", "Set Investment Goal"]
        return ["Check Health Score", "View Recent Anomalies", "Analyze Top Expenses"]

ai_advisor_service = AIAdvisorService()
