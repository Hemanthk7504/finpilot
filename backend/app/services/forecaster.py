from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class CashFlowForecaster:
    """Predictive cash flow, recurring bill detection, and 30-day forecast engine."""

    @classmethod
    def detect_recurring_bills(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify recurring subscriptions and fixed utility/rent obligations."""
        if not transactions:
            return []

        df = pd.DataFrame(transactions)
        debits = df[df["type"] == "debit"].copy()
        if debits.empty:
            return []

        debits["date"] = pd.to_datetime(debits["date"])
        recurring_bills = []

        # Group by clean merchant
        for merchant, group in debits.groupby("clean_merchant"):
            if len(group) >= 2:
                sorted_group = group.sort_values(by="date")
                diffs = sorted_group["date"].diff().dt.days.dropna().tolist()
                amounts = sorted_group["amount"].tolist()

                # Check if intervals are roughly monthly (27 to 33 days)
                is_monthly = any(26 <= d <= 34 for d in diffs)
                # Check if amounts are very close
                amount_variance = np.std(amounts) / (np.mean(amounts) + 1e-6)

                if is_monthly or (amount_variance < 0.15 and len(group) >= 3):
                    avg_amt = float(np.mean(amounts))
                    last_date = sorted_group["date"].max()
                    # Project next expected billing date
                    next_expected = last_date + timedelta(days=30)
                    
                    recurring_bills.append({
                        "merchant": merchant,
                        "category": sorted_group["category_name"].iloc[-1],
                        "average_amount": round(avg_amt, 2),
                        "frequency": "Monthly",
                        "last_billed": last_date.strftime("%Y-%m-%d"),
                        "next_expected": next_expected.strftime("%Y-%m-%d"),
                        "days_until_due": max(0, (next_expected - datetime.utcnow()).days)
                    })

        # Sort by next due date
        recurring_bills.sort(key=lambda x: x["next_expected"])
        return recurring_bills

    @classmethod
    def generate_30day_forecast(
        cls,
        transactions: List[Dict[str, Any]],
        current_balance: float = 4250.0,
        monthly_income: float = 6500.0,
        payday_dom: int = 1
    ) -> Dict[str, Any]:
        """
        Generate 30-day forward cash flow trajectory, daily predicted expense,
        and projected balance with upper and lower confidence intervals.
        """
        now = datetime.utcnow()
        recurring = cls.detect_recurring_bills(transactions)

        # Calculate daily discretionary burn rate from past 60 days
        if transactions:
            df = pd.DataFrame(transactions)
            debits = df[df["type"] == "debit"].copy()
            debits["date"] = pd.to_datetime(debits["date"])
            
            # Exclude large one-off or fixed bills to isolate variable daily spend
            recurring_merchants = {b["merchant"].lower() for b in recurring}
            variable_debits = debits[~debits["clean_merchant"].str.lower().isin(recurring_merchants)]
            
            if not variable_debits.empty:
                daily_spend_avg = float(variable_debits["amount"].sum() / max(30, (debits["date"].max() - debits["date"].min()).days or 30))
                daily_std = float(variable_debits["amount"].std() or 25.0)
            else:
                daily_spend_avg = 45.0
                daily_std = 20.0
        else:
            daily_spend_avg = 45.0
            daily_std = 20.0

        daily_spend_avg = max(20.0, min(250.0, daily_spend_avg))
        
        forecast_days = []
        running_balance = current_balance
        total_projected_expense = 0.0

        for day_offset in range(1, 31):
            target_date = now + timedelta(days=day_offset)
            date_str = target_date.strftime("%Y-%m-%d")
            
            # Check for recurring bills due on this date
            day_bills = [b for b in recurring if b["next_expected"] == date_str]
            scheduled_bill_amount = sum(b["average_amount"] for b in day_bills)
            bill_name = ", ".join(b["merchant"] for b in day_bills) if day_bills else None

            # Check for income deposit on payday
            day_income = 0.0
            if target_date.day == payday_dom or (day_offset == 15 and target_date.day == 15):
                day_income = monthly_income / 2.0 if target_date.day in [1, 15] else monthly_income

            # Weekend multiplier for discretionary spending
            weekend_multiplier = 1.35 if target_date.weekday() in [5, 6] else 0.90
            predicted_expense = (daily_spend_avg * weekend_multiplier) + scheduled_bill_amount
            
            # Confidence intervals
            lower_expense = max(5.0, predicted_expense - (daily_std * 1.2))
            upper_expense = predicted_expense + (daily_std * 1.5)

            running_balance = running_balance + day_income - predicted_expense
            total_projected_expense += predicted_expense

            forecast_days.append({
                "date": date_str,
                "day_label": target_date.strftime("%b %d"),
                "predicted_expense": round(predicted_expense, 2),
                "predicted_balance": round(running_balance, 2),
                "lower_bound": round(max(0, running_balance - (daily_std * 2.0)), 2),
                "upper_bound": round(running_balance + (daily_std * 2.0), 2),
                "has_scheduled_bill": bool(day_bills),
                "bill_name": bill_name
            })

        projected_eom_balance = round(running_balance, 2)
        
        if projected_eom_balance > current_balance:
            status = "Surplus: Positive net cash flow expected by end of month."
        elif projected_eom_balance >= (monthly_income * 0.20):
            status = "Stable: Projected balance remains safely above reserve buffer."
        elif projected_eom_balance > 0:
            status = "Tight: Cash reserves will shrink; limit non-essential expenses."
        else:
            status = "Deficit Warning: Outflows are projected to exceed available funds."

        return {
            "current_balance": round(current_balance, 2),
            "projected_end_of_month_balance": projected_eom_balance,
            "projected_total_month_expense": round(total_projected_expense, 2),
            "forecast_days": forecast_days,
            "detected_subscriptions": recurring,
            "cashflow_health_status": status
        }

cash_flow_forecaster = CashFlowForecaster()
