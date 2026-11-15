import os
import re
import joblib
from typing import Dict, Any, List, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline

class TransactionCategorizer:
    """Production-grade Indian & Global Financial Transaction Classifier."""

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
        "Bank Charges & Fees": {"type": "essential", "icon": "AlertCircle", "color": "#94A3B8"},
        "Refunds & Cashback": {"type": "income", "icon": "RefreshCw", "color": "#22C55E"},
        "Miscellaneous": {"type": "discretionary", "icon": "Tag", "color": "#64748B"}
    }

    # High-precision Indian & Global Keyword Heuristic Rules
    KEYWORD_RULES = [
        # Income / Salary
        (r'\b(salary|payroll|direct dep|wages|stipend|bonus cr|neft.*sal|salary credit|monthly payout|employer|dividend credit|interest credit|int\.pd)\b', "Salary & Income"),
        # Refunds & Cashback
        (r'\b(refund|cashback|reversal|chargeback|cr.*refund|paytm cashback|cred cashback)\b', "Refunds & Cashback"),
        # Housing & Rent
        (r'\b(rent|landlord|nobroker|housing\.com|apartment rent|society maintenance|hoa fee|property tax|mygate|lease payment)\b', "Housing & Rent"),
        # Groceries
        (r'\b(blinkit|zepto|bigbasket|instamart|dmart|reliance fresh|nature\'s basket|more retail|grofers|supermarket|grocery|kirana|spencer|vegetables|milk|fruits|provisions)\b', "Groceries"),
        # Utilities & Bills
        (r'\b(bescom|tata power|adani electricity|igl|mahanagar gas|torrent power|electricity bill|water board|bwssb|jio recharge|airtel broadband|vi prepaid|tata play|dish tv|fastag|billdesk|bbps|recharge)\b', "Utilities & Bills"),
        # Healthcare & Medical
        (r'\b(apollo pharmacy|netmeds|tata 1mg|pharmeasy|medplus|practo|max healthcare|fortis|dr lal pathlabs|diagnostic|clinic|hospital|doctor fee|dental|eye care|ayurveda|medicine|chemist)\b', "Healthcare & Medical"),
        # Transportation & Fuel
        (r'\b(uber|ola cabs|rapido|indian oil|iocl|hpcl|bpcl|bharat petroleum|shell petrol|fuel pump|cng station|namma metro|delhi metro|irctc|railway|toll plaza|fastag toll|parking fee)\b', "Transportation & Fuel"),
        # Dining & Food Delivery
        (r'\b(swiggy|zomato|mcdonald|starbucks|domino|pizza hut|kfc|burger king|haldiram|subway|chai point|chaayos|barbeque nation|cafe|restaurant|bistro|dhaba|bakery|biryani|dining)\b', "Dining & Food Delivery"),
        # Shopping & Electronics
        (r'\b(amazon|flipkart|myntra|meesho|nykaa|ajio|tata cliq|croma|reliance digital|vijay sales|ikea|zara|h&m|decathlon|lenskart|lifestyle|shoppers stop|clothing|electronics)\b', "Shopping & Electronics"),
        # Entertainment & Subscriptions
        (r'\b(netflix|spotify|hotstar|disney\+ hotstar|prime video|youtube premium|bookmyshow|pvr|inox|cinema|theatre|sony liv|zee5|audible|gaana|wynk|playstation|xbox|steam)\b', "Entertainment & Subscriptions"),
        # Travel & Lodging
        (r'\b(makemytrip|yatra|cleartrip|goibibo|easemytrip|indigo|air india|vistara|spicejet|oyo|taj hotels|marriott|airbnb|booking\.com|hotel stay|flight ticket|resort)\b', "Travel & Lodging"),
        # Investments & Wealth
        (r'\b(zerodha|groww|angel one|upstox|kuvera|cams|karvy|uti mf|sbi mutual fund|hdfc mutual fund|icici pru|nippon india|ppf|nps|sip deposit|brokerage|demat|gold etf|sovereign gold)\b', "Investments & Savings"),
        # Loans & Debt EMI
        (r'\b(loan emi|home loan|auto loan|car loan|personal loan|bajaj finance|kreditbee|krazybee|tvs credit|hdfc loan|sbi loan|icici loan|credit card payment|cred pay|card bill)\b', "Loans & Debt EMI"),
        # Bank Charges & Fees
        (r'\b(sms alert charge|consolidated charges|debit card fee|annual fee|atm charges|minimum balance|penalty charge|gst on charge|cheque return|interchange fee)\b', "Bank Charges & Fees"),
    ]

    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "..", "ml_models")
        os.makedirs(self.model_path, exist_ok=True)
        self.pipeline_file = os.path.join(self.model_path, "categorizer_pipeline.joblib")
        
        self.pipeline = None
        self._load_or_train()

    def _get_training_dataset(self) -> List[Tuple[str, str]]:
        """
        Extensive dataset of realistic Indian and global bank transaction narrations
        covering UPI, NEFT, RTGS, IMPS, Card POS, ATM, NetBanking, and BillPay.
        """
        return [
            # Salary & Income
            ("ACH CR INFOSYS TECH SALARY FOR OCTOBER 2026", "Salary & Income"),
            ("NEFT-N10293847-TCS LIMITED-MONTHLY SALARY", "Salary & Income"),
            ("SALARY CR - WIPRO ENTERPRISES PVT LTD", "Salary & Income"),
            ("HCL TECH SALARY CREDIT NOV 2026", "Salary & Income"),
            ("DIRECT DEP - ACCENTURE SERVICES SALARY", "Salary & Income"),
            ("RELIANCE INDUSTRIES PAYROLL CREDIT", "Salary & Income"),
            ("GOOGLE INDIA CORP MONTHLY SALARY", "Salary & Income"),
            ("MICROSOFT R&D SALARY DEPOSIT", "Salary & Income"),
            ("RAZORPAY PAYOUT FREELANCE SOFTWARE SERVICES", "Salary & Income"),
            ("UPI/CLIENT/STIPEND CONSULTING PAYMENT", "Salary & Income"),
            ("DIVIDEND CR ITC LIMITED QUARTERLY", "Salary & Income"),
            ("INT.PD:SAVINGS BANK INTEREST 01-JUL TO 30-SEP", "Salary & Income"),
            ("INTEREST CREDITED ON AUTO SWEEP DEPOSIT", "Salary & Income"),
            ("TCS PERFORMANCE BONUS PAYOUT", "Salary & Income"),

            # Refunds & Cashback
            ("UPI/REFUND/AMAZON SELLER REVERSAL", "Refunds & Cashback"),
            ("REFUND CR - FLIPKART INTERNET PVT LTD", "Refunds & Cashback"),
            ("SWIGGY CANCELLATION REFUND TO ACCOUNT", "Refunds & Cashback"),
            ("CRED CASHBACK CREDITED TO BANK A/C", "Refunds & Cashback"),
            ("IRCTC TICKET CANCEL REFUND RAILWAYS", "Refunds & Cashback"),
            ("MYNTRA RETURN PRODUCT REFUND", "Refunds & Cashback"),
            ("PAYTM WALLET CASHBACK PROMO REWARD", "Refunds & Cashback"),

            # Housing & Rent
            ("UPI/LANDLORD RENT FOR OCTOBER APARTMENT 402", "Housing & Rent"),
            ("NOBROKER RENT PAYMENT BANGALORE FLAT", "Housing & Rent"),
            ("HOUSING.COM PROPERTY RENT TRANSFER", "Housing & Rent"),
            ("SOCIETY MONTHLY MAINTENANCE PRESTIGE TECH PARK", "Housing & Rent"),
            ("MYGATE SOCIETY APARTMENT AMENITY CHARGE", "Housing & Rent"),
            ("NEFT-RENT PAYMENT TO SURESH KUMAR", "Housing & Rent"),
            ("BBMP PROPERTY TAX REVENUE PAYMENT", "Housing & Rent"),
            ("HOA RESIDENTIAL QUARTERLY ASSESSMENT", "Housing & Rent"),

            # Groceries
            ("UPI/BLINKIT/INSTANT GROCERY BANGALORE", "Groceries"),
            ("ZEPTO CONSUMER PRODUCTS 10 MIN GROCERY", "Groceries"),
            ("BIGBASKET SUPERMARKET ONLINE VEGGIES ORDER", "Groceries"),
            ("SWIGGY INSTAMART MILK BREAD EGGS", "Groceries"),
            ("DMART AVENUE SUPERMARTS MONTHLY RATION", "Groceries"),
            ("RELIANCE FRESH RETAIL STORE VEGETABLES", "Groceries"),
            ("NATURES BASKET GOURMET FOOD STORE", "Groceries"),
            ("SPENCERS RETAIL SUPERMARKET PURCHASE", "Groceries"),
            ("UPI/KIRANA STORE DAIRY PRODUCTS", "Groceries"),
            ("MORE SUPERMARKET PROVISIONS STAPLES", "Groceries"),
            ("LOCAL VEGETABLE VENDOR DAILY FRESH", "Groceries"),

            # Utilities & Bills
            ("BESCOM ELECTRICITY BILL PAYMENT BANGALORE", "Utilities & Bills"),
            ("TATA POWER BILL PAYMENT MUMBAI GRID", "Utilities & Bills"),
            ("ADANI ELECTRICITY CONSUMER BILL PAY", "Utilities & Bills"),
            ("INDRAPRASTHA GAS LIMITED PIPED GAS BILL", "Utilities & Bills"),
            ("MAHANAGAR GAS BILL PAY AUTOMATION", "Utilities & Bills"),
            ("JIO PREPAID 5G RECHARGE 365 DAYS PLAN", "Utilities & Bills"),
            ("AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", "Utilities & Bills"),
            ("VI CELLULAR MONTHLY MOBILE BILL", "Utilities & Bills"),
            ("TATA PLAY DTH SATELLITE TV RECHARGE", "Utilities & Bills"),
            ("PAYTM FASTAG HIGHWAY TOLL WALLET RECHARGE", "Utilities & Bills"),
            ("ICICI FASTAG TOLL AUTO TOPUP", "Utilities & Bills"),
            ("BWSSB WATER SUPPLY BILL MUNICIPAL", "Utilities & Bills"),
            ("BBPS BILL PAYMENT ELECTRICITY UTILITY", "Utilities & Bills"),

            # Healthcare & Medical
            ("APOLLO PHARMACY TABLETS AND VITAMINS", "Healthcare & Medical"),
            ("NETMEDS HEALTHCARE MEDICINES ORDER", "Healthcare & Medical"),
            ("TATA 1MG PRESCRIPTION DRUGS ONLINE", "Healthcare & Medical"),
            ("PHARMEASY DIAGNOSTIC BLOOD TEST PACKAGE", "Healthcare & Medical"),
            ("MEDPLUS PHARMA RETAIL MEDICAL STORE", "Healthcare & Medical"),
            ("PRACTO CONSULTATION CLINIC DOCTOR APPOINTMENT", "Healthcare & Medical"),
            ("MAX SUPER SPECIALITY HOSPITAL OPD BILL", "Healthcare & Medical"),
            ("FORTIS HEALTHCARE CLINICAL CONSULTATION", "Healthcare & Medical"),
            ("DR LAL PATHLABS FULL BODY PROFILE CHECK", "Healthcare & Medical"),
            ("DENTAL SURGERY CAVITY ROOT CANAL CLINIC", "Healthcare & Medical"),
            ("LENSKART EYEGLASSES POWER LENSES PURCHASE", "Healthcare & Medical"),

            # Transportation & Fuel
            ("UPI/UBER TRIPS BANGALORE AIRPORT CAB", "Transportation & Fuel"),
            ("OLA CABS DAILY COMMUTE RIDESHARE", "Transportation & Fuel"),
            ("RAPIDO BIKE TAXI CITY TRAVEL", "Transportation & Fuel"),
            ("INDIAN OIL CORP PETROL PUMP FUEL REFILL", "Transportation & Fuel"),
            ("HPCL AUTO GAS PETROL FUEL PUMP", "Transportation & Fuel"),
            ("BPCL SPEED PETROL FILLING STATION", "Transportation & Fuel"),
            ("SHELL INDIA UNLEADED V-POWER FUEL", "Transportation & Fuel"),
            ("NAMMA METRO SMART CARD RECHARGE BANGALORE", "Transportation & Fuel"),
            ("DELHI METRO DMRC TRANSIT TOKEN RECHARGE", "Transportation & Fuel"),
            ("FASTAG TOLL PLAZA TOLL PASS DEDUCTION", "Transportation & Fuel"),
            ("MUNICIPAL AIRPORT PARKING CHARGES", "Transportation & Fuel"),
            ("IRCTC E-TICKETING TRAIN TRAVEL BOOKING", "Transportation & Fuel"),

            # Dining & Food Delivery
            ("SWIGGY ONLINE FOOD DELIVERY RESTAURANT", "Dining & Food Delivery"),
            ("ZOMATO FOOD ORDER MEAL FOR DINNER", "Dining & Food Delivery"),
            ("MCDONALDS BURGER FRIES COMBO MEAL", "Dining & Food Delivery"),
            ("STARBUCKS COFFEE LATTE COLD BREW", "Dining & Food Delivery"),
            ("DOMINOS PIZZA CRUST CHEESE BURST", "Dining & Food Delivery"),
            ("PIZZA HUT DINE IN FAMILY MEAL", "Dining & Food Delivery"),
            ("KFC FRIED CHICKEN BUCKET WINGS", "Dining & Food Delivery"),
            ("BURGER KING WHOPPER COMBO MEAL", "Dining & Food Delivery"),
            ("HALDIRAMS RESTAURANT SWEETS SNACKS", "Dining & Food Delivery"),
            ("BARBEQUE NATION DINING BUFFET DINNER", "Dining & Food Delivery"),
            ("CHAI POINT HOT GINGER TEA SAMOSA", "Dining & Food Delivery"),
            ("CHAAYOS KULLAD TEA AND BUN MASKA", "Dining & Food Delivery"),
            ("UDUPI GRAND DOSA IDLI BREAKFAST", "Dining & Food Delivery"),
            ("PARADISE BIRYANI HYDERABAD SPECIAL", "Dining & Food Delivery"),

            # Shopping & Electronics
            ("AMAZON INDIA ECOMMERCE ELECTRONICS ORDER", "Shopping & Electronics"),
            ("FLIPKART INTERNET LAPTOP ACCESSORIES ORDER", "Shopping & Electronics"),
            ("MYNTRA FASHION WEAR JEANS SHIRTS CLOTHING", "Shopping & Electronics"),
            ("MEESHO ONLINE SHOPPING HOME DECOR", "Shopping & Electronics"),
            ("NYKAA COSMETICS SKINCARE BEAUTY PRODUCTS", "Shopping & Electronics"),
            ("AJIO TRENDS CASUAL WEAR APPAREL", "Shopping & Electronics"),
            ("TATA CLIQ LUXURY FOOTWEAR ONLINE", "Shopping & Electronics"),
            ("CROMA ELECTRONICS HEADPHONES SMARTWATCH", "Shopping & Electronics"),
            ("RELIANCE DIGITAL 4K OLED TV PURCHASE", "Shopping & Electronics"),
            ("VIJAY SALES HOME APPLIANCES REFRIGERATOR", "Shopping & Electronics"),
            ("IKEA INDIA FURNITURE WARDROBE TABLE", "Shopping & Electronics"),
            ("ZARA RETAIL STORE APPAREL MENSWEAR", "Shopping & Electronics"),
            ("H&M CLOTHING STORE MALL PURCHASE", "Shopping & Electronics"),
            ("DECATHLON SPORTS RUNNING SHOES GEAR", "Shopping & Electronics"),

            # Entertainment & Subscriptions
            ("NETFLIX PREMIUM 4K UHD MONTHLY SUBSCRIPTION", "Entertainment & Subscriptions"),
            ("SPOTIFY PREMIUM INDIVIDUAL MUSIC PLAN", "Entertainment & Subscriptions"),
            ("DISNEY+ HOTSTAR ANNUAL VIP SUBSCRIPTION", "Entertainment & Subscriptions"),
            ("AMAZON PRIME ANNUAL MEMBERSHIP VIDEO", "Entertainment & Subscriptions"),
            ("YOUTUBE PREMIUM FAMILY AD-FREE STREAMING", "Entertainment & Subscriptions"),
            ("BOOKMYSHOW MOVIE TICKETS IMAX 3D SHOW", "Entertainment & Subscriptions"),
            ("PVR CINEMAS GOLD CLASS TICKETS POPCORN", "Entertainment & Subscriptions"),
            ("INOX MULTIPLEX EVENING MOVIE SHOW", "Entertainment & Subscriptions"),
            ("SONY LIV PREMIUM SUBSCRIPTION ENTERTAINMENT", "Entertainment & Subscriptions"),
            ("ZEE5 ALL ACCESS OTT ANNUAL PLAN", "Entertainment & Subscriptions"),
            ("AUDIBLE AUDIOBOOKS MONTHLY MEMBERSHIP", "Entertainment & Subscriptions"),
            ("STEAM GAMES STORE DIGITAL VIDEO GAME", "Entertainment & Subscriptions"),

            # Travel & Lodging
            ("MAKEMYTRIP FLIGHT TICKETS BANGALORE TO DELHI", "Travel & Lodging"),
            ("GOIBIBO HOTEL RESORT RESERVATION GOA", "Travel & Lodging"),
            ("YATRA ONLINE VACATION HOLIDAY TOUR", "Travel & Lodging"),
            ("CLEARTRIP AIRLINE FLIGHT BOOKING", "Travel & Lodging"),
            ("INDIGO AIRLINES FLIGHT MEAL BAGGAGE", "Travel & Lodging"),
            ("AIR INDIA DOMESTIC FLIGHT SEAT RESERVATION", "Travel & Lodging"),
            ("VISTARA PREMIUM ECONOMY FLIGHT TICKET", "Travel & Lodging"),
            ("OYO ROOMS BUDGET HOTEL ROOM BOOKING", "Travel & Lodging"),
            ("TAJ HOTELS PALACES RESORTS LUXURY STAY", "Travel & Lodging"),
            ("MARRIOTT RESORT WEEKEND GETAWAY ROOM", "Travel & Lodging"),
            ("AIRBNB VILLA VACATION HOMESTAY HILLS", "Travel & Lodging"),

            # Investments & Wealth
            ("ZERODHA BROKING EQUITY NIFTY 50 ETF BUY", "Investments & Savings"),
            ("GROWW MUTUAL FUND SIP AUTO DEBIT", "Investments & Savings"),
            ("ANGEL ONE DEMAT SHARE PURCHASE TRADE", "Investments & Savings"),
            ("UPSTOX STOCKS TRADING ACCOUNT DEPOSIT", "Investments & Savings"),
            ("KUVERA DIRECT MUTUAL FUND INVESTMENT", "Investments & Savings"),
            ("CAMS ONLINE MUTUAL FUND SIP PURCHASE", "Investments & Savings"),
            ("KFINTECH MUTUAL FUND UNITS REDEMPTION", "Investments & Savings"),
            ("SBI MUTUAL FUND BLUECHIP SIP ECS", "Investments & Savings"),
            ("HDFC MUTUAL FUND TOP 100 GROWTH PLAN", "Investments & Savings"),
            ("ICICI PRUDENTIAL BALANCED ADVANTAGE FUND", "Investments & Savings"),
            ("PUBLIC PROVIDENT FUND PPF DEPOSIT SBI", "Investments & Savings"),
            ("NATIONAL PENSION SYSTEM NPS TIER 1 CONTRIB", "Investments & Savings"),
            ("SOVEREIGN GOLD BONDS SGB RBI INVESTMENT", "Investments & Savings"),

            # Loans & Debt EMI
            ("HDFC BANK HOME LOAN MONTHLY EMI AUTO DEBIT", "Loans & Debt EMI"),
            ("SBI HOUSING LOAN PRINCIPAL AND INTEREST EMI", "Loans & Debt EMI"),
            ("ICICI BANK AUTO CAR LOAN INSTALLMENT", "Loans & Debt EMI"),
            ("BAJAJ FINANCE CONSUMER DURABLE EMI NACH", "Loans & Debt EMI"),
            ("CREDIT CARD BILL PAYMENT CRED HDFC CARD", "Loans & Debt EMI"),
            ("SBI CARD MONTHLY STATEMENT OUTSTANDING PAYMENT", "Loans & Debt EMI"),
            ("KREDITBEE PERSONAL LOAN EMI REPAYMENT", "Loans & Debt EMI"),
            ("KRAZYBEE SERVICES LOAN REPAYMENT", "Loans & Debt EMI"),
            ("TVS CREDIT SERVICES VEHICLE LOAN EMI", "Loans & Debt EMI"),
            ("AXIS BANK CREDIT CARD AUTO DEBIT ECS", "Loans & Debt EMI"),

            # Bank Charges & Fees
            ("CHG-SMS ALERT CHARGES QUARTER END", "Bank Charges & Fees"),
            ("CONSOLIDATED CHARGES FOR MIN BALANCE NON MAINT", "Bank Charges & Fees"),
            ("DEBIT CARD ANNUAL MAINTENANCE AMC FEE", "Bank Charges & Fees"),
            ("ATM WITHDRAWAL INTERCHANGE DECLINE FEE", "Bank Charges & Fees"),
            ("CHEQUE BOOK ISSUANCE CHARGES WITH GST", "Bank Charges & Fees"),
            ("ECS / NACH BOUNCE RETURN PENALTY CHARGES", "Bank Charges & Fees"),
        ]

    def _train_pipeline(self):
        """Train and calibrate the TF-IDF + Logistic Regression Classifier."""
        corpus = self._get_training_dataset()
        texts = [x[0] for x in corpus]
        labels = [x[1] for x in corpus]

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                sublinear_tf=True,
                token_pattern=r'(?u)\b\w+\b',
                min_df=1
            )),
            ("clf", CalibratedClassifierCV(
                estimator=LogisticRegression(C=2.0, max_iter=400, class_weight='balanced'),
                cv=3
            ))
        ])

        pipeline.fit(texts, labels)
        self.pipeline = pipeline

        # Save model
        try:
            joblib.dump(pipeline, self.pipeline_file)
        except Exception as e:
            pass

    def _load_or_train(self):
        """Load pre-trained pipeline or train fresh."""
        if os.path.exists(self.pipeline_file):
            try:
                self.pipeline = joblib.load(self.pipeline_file)
                return
            except Exception:
                pass
        self._train_pipeline()

    def categorize(self, narration: str, clean_merchant: str = "", txn_type: str = "debit") -> Tuple[str, float]:
        """
        Determine category using:
        1. Directional override (Credits default to Income/Refund unless specific).
        2. High-precision Regex Heuristic Rule Matcher.
        3. Calibrated Machine Learning Pipeline.
        """
        combined = f"{clean_merchant} {narration}".strip()
        combined_lower = combined.lower()

        # 1. Regex Heuristics
        for pattern, cat in self.KEYWORD_RULES:
            if re.search(pattern, combined_lower):
                return cat, 0.98

        # 2. Machine Learning Inference
        if self.pipeline:
            try:
                probs = self.pipeline.predict_proba([combined])[0]
                classes = self.pipeline.classes_
                best_idx = np.argmax(probs)
                confidence = float(probs[best_idx])
                best_cat = str(classes[best_idx])

                if confidence >= 0.35:
                    return best_cat, round(confidence, 2)
            except Exception:
                pass

        # 3. Fallbacks based on txn_type
        if txn_type == "credit":
            return "Salary & Income", 0.60
        return "Miscellaneous", 0.40

    def get_category_meta(self, category_name: str) -> Dict[str, Any]:
        """Retrieve UI metadata for category."""
        return self.CATEGORIES.get(category_name, self.CATEGORIES["Miscellaneous"])

categorizer = TransactionCategorizer()
