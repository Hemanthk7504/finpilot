import re
from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

class TransactionCategorizer:
    """Hybrid Rule-Based + Machine Learning Transaction Categorizer."""

    CATEGORIES = {
        "Salary & Income": {"type": "income", "icon": "DollarSign", "color": "#10B981"},
        "Housing & Rent": {"type": "essential", "icon": "Home", "color": "#3B82F6"},
        "Groceries": {"type": "essential", "icon": "ShoppingCart", "color": "#059669"},
        "Utilities & Bills": {"type": "essential", "icon": "Zap", "color": "#F59E0B"},
        "Healthcare & Medical": {"type": "essential", "icon": "HeartPulse", "color": "#EC4899"},
        "Transportation & Fuel": {"type": "essential", "icon": "Car", "color": "#6366F1"},
        "Dining & Food Delivery": {"type": "discretionary", "icon": "Utensils", "color": "#F97316"},
        "Shopping & Electronics": {"type": "discretionary", "icon": "ShoppingBag", "color": "#8B5CF6"},
        "Entertainment & Subscriptions": {"type": "discretionary", "icon": "Film", "color": "#14B8A6"},
        "Travel & Lodging": {"type": "discretionary", "icon": "Plane", "color": "#06B6D4"},
        "Investments & Savings": {"type": "investment", "icon": "TrendingUp", "color": "#84CC16"},
        "Loans & Debt EMI": {"type": "debt", "icon": "CreditCard", "color": "#EF4444"},
        "Miscellaneous": {"type": "discretionary", "icon": "Tag", "color": "#64748B"}
    }

    # Keyword heuristics for high-precision instant matching
    KEYWORD_RULES = [
        # Income
        (r'\b(salary|payroll|direct dep|wages|employer|dividend|stipend|freelance payment)\b', "Salary & Income"),
        # Housing & Rent
        (r'\b(rent|landlord|mortgage|lease|hoa fee|property management|apartment)\b', "Housing & Rent"),
        # Groceries
        (r'\b(walmart|target grocery|trader joe|whole foods|kroger|safeway|costco|aldi|supermarket|grocery|heb|publix|market)\b', "Groceries"),
        # Utilities & Bills
        (r'\b(electric|water bill|power|energy|gas co|broadband|wifi|internet|at&t|verizon|t-mobile|comcast|xfinity|utility|sewer)\b', "Utilities & Bills"),
        # Healthcare & Medical
        (r'\b(pharmacy|walgreens|cvs|hospital|clinic|doctor|dental|optometry|health|pediatric|medicine|rx)\b', "Healthcare & Medical"),
        # Transportation & Fuel
        (r'\b(uber|lyft|shell|chevron|bp gas|exxon|mobil|gas station|parking|transit|subway|metro|toll|fuel|petrol)\b', "Transportation & Fuel"),
        # Dining & Food Delivery
        (r'\b(starbucks|mcdonald|chipotle|subway|domino|pizza|burger|swiggy|zomato|doordash|uber eats|grubhub|restaurant|cafe|bakery|diner)\b', "Dining & Food Delivery"),
        # Shopping & Electronics
        (r'\b(amazon|best buy|apple store|target|ikea|zara|h&m|ebay|nike|clothing|department store|electronics)\b', "Shopping & Electronics"),
        # Entertainment & Subscriptions
        (r'\b(netflix|spotify|disney|hulu|prime video|youtube premium|playstation|xbox|steam|cinema|theatre|amc|audible|patreon)\b', "Entertainment & Subscriptions"),
        # Travel & Lodging
        (r'\b(airbnb|marriott|hilton|hotel|delta air|united air|american air|southwest|flight|airline|booking\.com|expedia)\b', "Travel & Lodging"),
        # Investments & Savings
        (r'\b(vanguard|fidelity|charles schwab|robinhood|coinbase|etrade|mutual fund|401k|ira deposit|brokerage|wealthfront)\b', "Investments & Savings"),
        # Loans & Debt
        (r'\b(loan emi|car payment|student loan|mortgage payment|credit card payment|chase card pymt|citi card autopay|amex payment)\b', "Loans & Debt EMI"),
    ]

    def __init__(self):
        self._init_ml_model()

    def _init_ml_model(self):
        """Train a lightweight TF-IDF classifier on synthetic financial phrases."""
        training_corpus = [
            ("Monthly employee payroll deposit company direct deposit", "Salary & Income"),
            ("Stipend freelance client wire transfer payment", "Salary & Income"),
            ("Quarterly stock dividend distribution account credit", "Salary & Income"),
            ("Apartment monthly rent payment leasing office ACH", "Housing & Rent"),
            ("Home mortgage principal and interest payment", "Housing & Rent"),
            ("HOA condominium maintenance monthly assessment", "Housing & Rent"),
            ("Organic fresh produce fruits vegetables grocery store", "Groceries"),
            ("Weekly family food supermarket bulk purchase eggs milk bread", "Groceries"),
            ("City electric utility bill power energy grid", "Utilities & Bills"),
            ("High speed fiber internet wifi service bill monthly", "Utilities & Bills"),
            ("Municipal water sewer trash collection service", "Utilities & Bills"),
            ("Prescription drugs prescription eyeglasses doctor clinic checkup", "Healthcare & Medical"),
            ("Emergency dental cavity cleaning clinic hospital visit", "Healthcare & Medical"),
            ("Rideshare trip across town city center dropoff", "Transportation & Fuel"),
            ("Gasoline unleaded regular fuel pump station filling", "Transportation & Fuel"),
            ("Highway toll express lane electronic transponder transit pass", "Transportation & Fuel"),
            ("Coffee latte espresso morning breakfast bakery shop", "Dining & Food Delivery"),
            ("Dinner evening dining restaurant with friends burgers fries", "Dining & Food Delivery"),
            ("Food delivery courier courier tips evening meal", "Dining & Food Delivery"),
            ("Online order household goods clothing shoes accessories", "Shopping & Electronics"),
            ("Computer hardware electronics gadget smartphone cable", "Shopping & Electronics"),
            ("Streaming music video subscription monthly plan membership", "Entertainment & Subscriptions"),
            ("Movie theater tickets concessions popcorn evening show", "Entertainment & Subscriptions"),
            ("Hotel reservation room nights resort lodging weekend trip", "Travel & Lodging"),
            ("Flight tickets roundtrip economy baggage fees boarding", "Travel & Lodging"),
            ("Automated stock index fund deposit brokerage investment", "Investments & Savings"),
            ("Cryptocurrency exchange transfer recurring savings deposit", "Investments & Savings"),
            ("Auto loan monthly finance payment installment bank", "Loans & Debt EMI"),
            ("Personal installment loan repayment interest principal", "Loans & Debt EMI"),
        ]

        texts = [x[0] for x in training_corpus]
        labels = [x[1] for x in training_corpus]

        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', min_df=1)
        X = self.vectorizer.fit_transform(texts)
        self.clf = LogisticRegression(C=1.0, max_iter=200)
        self.clf.fit(X, labels)

    def categorize(self, narration: str, clean_merchant: str = "", txn_type: str = "debit") -> Tuple[str, float]:
        """Determine category using rule hierarchy and ML fallback."""
        query = f"{clean_merchant} {narration}".strip().lower()

        # If credit and contains salary/income words
        if txn_type == "credit":
            if any(w in query for w in ["salary", "payroll", "dividend", "interest", "stipend", "bonus"]):
                return "Salary & Income", 0.99

        # Rule-based regex check
        for pattern, cat in self.KEYWORD_RULES:
            if re.search(pattern, query, re.IGNORECASE):
                # Extra validation: if it's credit, don't label as Rent unless refund
                if txn_type == "credit" and cat not in ["Salary & Income", "Investments & Savings"]:
                    continue
                return cat, 0.95

        # ML classifier prediction fallback
        try:
            vec = self.vectorizer.transform([query])
            pred = self.clf.predict(vec)[0]
            probs = self.clf.predict_proba(vec)[0]
            confidence = float(max(probs))
            if confidence > 0.35:
                return pred, round(confidence, 2)
        except Exception:
            pass

        # Fallback based on transaction type
        if txn_type == "credit":
            return "Salary & Income", 0.60
        return "Miscellaneous", 0.50

    @classmethod
    def get_category_meta(cls, category_name: str) -> Dict[str, Any]:
        return cls.CATEGORIES.get(category_name, cls.CATEGORIES["Miscellaneous"])

categorizer = TransactionCategorizer()
