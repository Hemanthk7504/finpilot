from typing import List, Dict, Any
import numpy as np

def format_inr_score(amount: float) -> str:
    try:
        is_neg = amount < 0
        abs_val = abs(amount)
        parts = f"{abs_val:.0f}".split(".")
        int_part = parts[0]
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
        return f"{prefix}{res}"
    except Exception:
        return f"₹{amount:,.0f}"

class HealthScoringEngine:
    """Computes transparent, multi-pillar Financial Health Score (0-100) and actionable advice."""

    @classmethod
    def compute(
        cls,
        monthly_income: float,
        monthly_expense: float,
        category_spending: Dict[str, float],
        budgets: Dict[str, float] = None,
        savings_balance: float = 0.0,
        debt_payments: float = 0.0
    ) -> Dict[str, Any]:
        """
        Compute holistic Financial Health Score.
        """
        if monthly_income <= 0:
            monthly_income = max(1000.0, monthly_expense * 1.1)

        budgets = budgets or {}
        net_savings = max(0.0, monthly_income - monthly_expense)
        savings_rate = net_savings / monthly_income if monthly_income > 0 else 0.0

        # Pillar 1: Savings Rate (Weight: 25%)
        # Target: >= 20% savings rate for 100 points
        s_rate_score = min(100.0, max(0.0, (savings_rate / 0.20) * 100.0))

        # Pillar 2: Budget Adherence (Weight: 25%)
        if budgets:
            adherence_scores = []
            for cat, limit in budgets.items():
                spent = category_spending.get(cat, 0.0)
                if limit > 0:
                    ratio = spent / limit
                    if ratio <= 0.85:
                        cat_score = 100.0
                    elif ratio <= 1.0:
                        cat_score = 90.0
                    elif ratio <= 1.15:
                        cat_score = 65.0
                    elif ratio <= 1.30:
                        cat_score = 40.0
                    else:
                        cat_score = 15.0
                    adherence_scores.append(cat_score)
            budget_score = float(np.mean(adherence_scores)) if adherence_scores else 85.0
        else:
            # Baseline based on overall cash flow surplus
            surplus_ratio = net_savings / monthly_income
            budget_score = min(100.0, max(30.0, 60.0 + surplus_ratio * 100.0))

        # Pillar 3: Emergency Fund Runway (Weight: 20%)
        # Months of essential living expenses covered
        # Target: 3 to 6 months
        essential_spend = (
            category_spending.get("Housing & Rent", 0.0) +
            category_spending.get("Groceries", 0.0) +
            category_spending.get("Utilities & Bills", 0.0) +
            category_spending.get("Healthcare & Medical", 0.0) +
            category_spending.get("Transportation & Fuel", 0.0)
        )
        if essential_spend <= 0:
            essential_spend = monthly_expense * 0.60

        runway_months = (savings_balance / essential_spend) if essential_spend > 0 else 0.0
        if runway_months >= 6.0:
            runway_score = 100.0
        elif runway_months >= 3.0:
            runway_score = 75.0 + ((runway_months - 3.0) / 3.0) * 25.0
        elif runway_months >= 1.0:
            runway_score = 40.0 + ((runway_months - 1.0) / 2.0) * 35.0
        else:
            runway_score = max(10.0, runway_months * 40.0)

        # Pillar 4: Debt-to-Income / EMI Burden (Weight: 15%)
        # Target: Debt < 15% of income = 100 pts. Over 40% = < 30 pts.
        debt_ratio = debt_payments / monthly_income if monthly_income > 0 else 0.0
        if debt_ratio <= 0.15:
            debt_score = 100.0 - (debt_ratio / 0.15) * 10.0 # 90 - 100
        elif debt_ratio <= 0.30:
            debt_score = 90.0 - ((debt_ratio - 0.15) / 0.15) * 25.0 # 65 - 90
        elif debt_ratio <= 0.45:
            debt_score = 65.0 - ((debt_ratio - 0.30) / 0.15) * 35.0 # 30 - 65
        else:
            debt_score = max(5.0, 30.0 - ((debt_ratio - 0.45) / 0.20) * 25.0)

        # Pillar 5: Spending Volatility & Discretionary Ratio (Weight: 15%)
        discretionary_spend = (
            category_spending.get("Dining & Food Delivery", 0.0) +
            category_spending.get("Shopping & Electronics", 0.0) +
            category_spending.get("Entertainment & Subscriptions", 0.0) +
            category_spending.get("Travel & Lodging", 0.0) +
            category_spending.get("Miscellaneous", 0.0)
        )
        discretionary_ratio = discretionary_spend / monthly_income if monthly_income > 0 else 0.0
        # Benchmark: 50/30/20 guideline says Wants should be <= 30%
        if discretionary_ratio <= 0.30:
            volatility_score = 95.0
        elif discretionary_ratio <= 0.40:
            volatility_score = 75.0
        elif discretionary_ratio <= 0.50:
            volatility_score = 55.0
        else:
            volatility_score = max(20.0, 55.0 - (discretionary_ratio - 0.50) * 100.0)

        # Total Weighted Score
        total_score = (
            s_rate_score * 0.25 +
            budget_score * 0.25 +
            runway_score * 0.20 +
            debt_score * 0.15 +
            volatility_score * 0.15
        )
        total_score = round(float(total_score), 1)

        # Rating Title & Grade
        if total_score >= 88:
            grade = "A+"
            rating_title = "Exceptional Financial Wellness"
            summary = "Your financial habits are outstanding! You have strong savings discipline, high budget control, and safe reserves."
        elif total_score >= 78:
            grade = "A"
            rating_title = "Strong & Financially Resilient"
            summary = "Great financial health! You consistently live below your means and are well positioned to reach your long-term wealth goals."
        elif total_score >= 65:
            grade = "B"
            rating_title = "Stable with Optimization Opportunities"
            summary = "Good steady baseline. Trimming discretionary lifestyle creep and expanding your liquid buffer will elevate you to top tier."
        elif total_score >= 50:
            grade = "C"
            rating_title = "Moderate Strain / Vulnerable"
            summary = "Your cash flow is tight. Watch out for recurring discretionary expenses and prioritize building an emergency cushion."
        else:
            grade = "D"
            rating_title = "High Financial Stress"
            summary = "Expenses are outpacing income. Immediate structural budget adjustments and debt optimization are advised."

        pillars = [
            {
                "name": "Savings Rate",
                "score": round(s_rate_score, 1),
                "weight": 25.0,
                "status": "Optimal" if s_rate_score >= 80 else ("Fair" if s_rate_score >= 50 else "Needs Attention"),
                "benchmark": "≥ 20% of net income",
                "details": f"Current savings rate is {savings_rate*100:.1f}% ({format_inr_score(net_savings)}/mo saved)."
            },
            {
                "name": "Budget Adherence",
                "score": round(budget_score, 1),
                "weight": 25.0,
                "status": "Optimal" if budget_score >= 80 else ("Fair" if budget_score >= 50 else "Needs Attention"),
                "benchmark": "Spend within category limits",
                "details": f"Tracking overall adherence with {len(budgets)} established category budgets."
            },
            {
                "name": "Emergency Runway",
                "score": round(runway_score, 1),
                "weight": 20.0,
                "status": "Optimal" if runway_score >= 80 else ("Fair" if runway_score >= 50 else "Needs Attention"),
                "benchmark": "3 to 6 months of essentials",
                "details": f"Current runway: {runway_months:.1f} months based on {format_inr_score(savings_balance)} liquid reserve."
            },
            {
                "name": "Debt & Fixed Obligations",
                "score": round(debt_score, 1),
                "weight": 15.0,
                "status": "Optimal" if debt_score >= 80 else ("Fair" if debt_score >= 50 else "Needs Attention"),
                "benchmark": "< 20% Debt-to-Income",
                "details": f"Monthly debt payments account for {debt_ratio*100:.1f}% of your monthly income."
            },
            {
                "name": "Spending Volatility",
                "score": round(volatility_score, 1),
                "weight": 15.0,
                "status": "Optimal" if volatility_score >= 80 else ("Fair" if volatility_score >= 50 else "Needs Attention"),
                "benchmark": "Discretionary spend ≤ 30%",
                "details": f"Discretionary categories represent {discretionary_ratio*100:.1f}% of total monthly income."
            }
        ]

        # Generate Actionable Recommendations with estimated point uplifts
        actionable_recommendations = []
        if s_rate_score < 75:
            uplift = min(8.0, round((80 - s_rate_score) * 0.25, 1))
            actionable_recommendations.append({
                "title": "Automate 5% Monthly Savings Boost",
                "category": "Savings",
                "impact": f"+{uplift} Score Points",
                "difficulty": "Easy",
                "action": f"Set up an automatic sweep of {format_inr_score(monthly_income * 0.05)}/mo on payday to your high-yield savings account."
            })

        if runway_months < 3.0:
            shortfall = max(0.0, (3.0 * essential_spend) - savings_balance)
            actionable_recommendations.append({
                "title": "Bolster Emergency Safety Net",
                "category": "Runway",
                "impact": "+7.5 Score Points",
                "difficulty": "Medium",
                "action": f"Target accumulating {format_inr_score(shortfall)} in liquid reserves to cover 3 full months of essential living expenses."
            })

        if discretionary_ratio > 0.32:
            dining = category_spending.get("Dining & Food Delivery", 0.0)
            shopping = category_spending.get("Shopping & Electronics", 0.0)
            target_cut = (dining * 0.20) if dining > 300 else 100.0
            actionable_recommendations.append({
                "title": "Optimize Dining & Discretionary Outflows",
                "category": "Discretionary",
                "impact": "+5.0 Score Points",
                "difficulty": "Easy",
                "action": f"Trimming dining & delivery orders by ~{format_inr_score(target_cut)}/mo brings your Wants ratio under the 50/30/20 benchmark."
            })

        if debt_ratio > 0.25:
            actionable_recommendations.append({
                "title": "Accelerate High-Interest Debt Payoff",
                "category": "Debt",
                "impact": "+6.0 Score Points",
                "difficulty": "High",
                "action": "Use the Avalanche Method to pay down highest APR balances first, reducing your recurring fixed obligations."
            })

        if not actionable_recommendations:
            actionable_recommendations.append({
                "title": "Maximize Tax-Advantaged Investments",
                "category": "Wealth Building",
                "impact": "+3.0 Score Points",
                "difficulty": "Medium",
                "action": "Increase your recurring monthly SIP or index fund contributions into tax-efficient retirement accounts."
            })

        return {
            "total_score": total_score,
            "grade": grade,
            "rating_title": rating_title,
            "summary": summary,
            "pillars": pillars,
            "actionable_recommendations": actionable_recommendations
        }

health_scoring_engine = HealthScoringEngine()
