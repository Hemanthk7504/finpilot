/**
 * FinPilot MAX - Universal Indian Currency (INR - ₹) Formatter
 * Complies with the Indian numbering system (Lakhs & Crores, e.g. ₹1,00,000.00)
 */

export const formatINR = (amount, options = {}) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0.00";
  }

  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  const { decimals = 2, showSign = false } = options;

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  try {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(absNum);

    // Ensure standardized clean ₹ symbol without extraneous spaces
    const cleanStr = formatted.replace(/^₹\s*/, "₹");
    
    if (isNegative) {
      return `-${cleanStr}`;
    }
    if (showSign && num > 0) {
      return `+${cleanStr}`;
    }
    return cleanStr;
  } catch (e) {
    // Fallback manual Indian numbering system
    const parts = absNum.toFixed(decimals).split(".");
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : "";

    // Indian comma separation: last 3 digits, then groups of 2
    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + decimalPart;

    const prefix = isNegative ? "-₹" : showSign && num > 0 ? "+₹" : "₹";
    return `${prefix}${res}`;
  }
};

/**
 * Compact Indian Currency Formatter (e.g. ₹7K, ₹2.5 L, ₹1.2 Cr)
 */
export const formatINRCompact = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0";
  }

  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  const isNegative = num < 0;
  const abs = Math.abs(num);
  const sign = isNegative ? "-" : "";

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(abs >= 100000000 ? 1 : 2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(abs >= 1000000 ? 1 : 2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
};

export default formatINR;
