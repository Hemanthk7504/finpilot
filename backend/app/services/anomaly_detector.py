import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import timedelta
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """Multi-tiered financial anomaly and fraud/suspicious activity detector."""

    @classmethod
    def analyze_transactions(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes parsed transaction dictionaries, applies statistical rules,
        duplicate checks, and Isolation Forest to flag anomalies with explanations.
        """
        if not transactions:
            return transactions

        df = pd.DataFrame(transactions)
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])
            df = df.sort_values(by="date").reset_index(drop=True)

        # Initialize anomaly flags
        df["is_anomaly"] = False
        df["anomaly_reason"] = None

        # 1. Duplicate Charge Detection (Debit only)
        # Same clean_merchant, same amount, within 48 hours
        debits = df[df["type"] == "debit"].copy()
        if not debits.empty:
            for i, row in debits.iterrows():
                # Look back within 48 hours
                window_start = row["date"] - timedelta(hours=48)
                window_end = row["date"] + timedelta(hours=48)
                
                duplicates = debits[
                    (debits.index != i) &
                    (debits["clean_merchant"].str.lower() == row["clean_merchant"].lower()) &
                    (abs(debits["amount"] - row["amount"]) < 0.01) &
                    (debits["date"] >= window_start) &
                    (debits["date"] <= window_end)
                ]

                if not duplicates.empty:
                    df.at[i, "is_anomaly"] = True
                    df.at[i, "anomaly_reason"] = f"Possible Duplicate: identical charge of ${row['amount']:.2f} for '{row['clean_merchant']}' detected within 48 hours."

        # 2. Category-Specific Outlier Spikes (Z-Score & IQR)
        # Only evaluate categories with enough transaction history
        for cat, group in debits.groupby("category_name"):
            if len(group) >= 4:
                amounts = group["amount"].values
                mean_amt = np.mean(amounts)
                std_amt = np.std(amounts)
                median_amt = np.median(amounts)

                for idx, r in group.iterrows():
                    amt = r["amount"]
                    # If already flagged as duplicate, skip or append
                    if df.at[idx, "is_anomaly"]:
                        continue

                    # High threshold: Z-score > 2.8 and at least 2.5x median
                    if std_amt > 0:
                        z_score = (amt - mean_amt) / std_amt
                        if z_score >= 2.6 and amt >= (median_amt * 2.5) and amt > 100.0:
                            df.at[idx, "is_anomaly"] = True
                            df.at[idx, "anomaly_reason"] = (
                                f"Unusual High Spend: ${amt:.2f} is {amt/mean_amt:.1f}x higher than your average "
                                f"${mean_amt:.2f} for {cat}."
                            )

        # 3. Isolation Forest for Global Multivariate Outliers
        if len(debits) >= 15:
            try:
                # Features: amount, day of week
                features = np.column_stack([
                    debits["amount"].values,
                    debits["date"].dt.dayofweek.values
                ])

                # Fit IsolationForest with low contamination
                iso = IsolationForest(contamination=0.04, random_state=42)
                preds = iso.fit_predict(features) # -1 is anomaly

                for i, (idx, _) in enumerate(debits.iterrows()):
                    if preds[i] == -1 and not df.at[idx, "is_anomaly"]:
                        amt = df.at[idx, "amount"]
                        if amt > 250.0: # Filter out trivial micro amounts
                            df.at[idx, "is_anomaly"] = True
                            df.at[idx, "anomaly_reason"] = (
                                f"Statistical Outlier: Model detected anomalous spend pattern (${amt:.2f} at {df.at[idx, 'clean_merchant']})."
                            )
            except Exception:
                pass

        return df.to_dict(orient="records")

anomaly_detector = AnomalyDetector()
