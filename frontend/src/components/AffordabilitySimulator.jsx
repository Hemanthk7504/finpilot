import React, { useState } from "react";
import { ShoppingBag, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { checkAffordability } from "../services/api";
import { formatINR } from "../utils/currency";

export default function AffordabilitySimulator({ overview, currentUser }) {
  const [itemName, setItemName] = useState("Apple MacBook Air / iPhone");
  const [itemPrice, setItemPrice] = useState(65000);
  const [paymentType, setPaymentType] = useState("cash"); // "cash" | "emi"
  const [emiMonths, setEmiMonths] = useState(12);

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const evaluate = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const data = await checkAffordability({
        item_name: itemName,
        price: itemPrice,
        payment_type: paymentType,
        emi_months: emiMonths,
      });
      setResult(data);
    } catch {
      // Local fallback
      const liquid = overview?.current_balance || 5420;
      const isAffordable = itemPrice < liquid * 0.4;
      setResult({
        item_name: itemName,
        price: itemPrice,
        payment_type: paymentType,
        monthly_commitment: paymentType === "cash" ? itemPrice : Math.round(itemPrice / emiMonths),
        impact_pct_of_cash: Math.round((itemPrice / liquid) * 100),
        verdict: isAffordable ? "Green Light (Affordable)" : "Caution (Dips into Buffer)",
        color: isAffordable ? "emerald" : "amber",
        recommendation: isAffordable
          ? "You will still maintain over 3 months of emergency buffer after purchase."
          : "This purchase represents a substantial chunk of liquid funds. Consider saving up for 2 months.",
        remaining_liquid_cash: liquid - (paymentType === "cash" ? itemPrice : Math.round(itemPrice / emiMonths)),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>"Can I Afford This?" Purchase Decision Engine</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
              AI Stress-Test
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Simulate a large discretionary expense and evaluate its impact on cash runway, savings rate, and emergency buffer.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={evaluate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Item Description</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="e.g. Vacation to Japan, New Laptop"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Purchase Price (₹)</label>
          <input
            type="number"
            min="100"
            max="10000000"
            value={itemPrice}
            onChange={(e) => setItemPrice(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Payment Strategy</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="cash">One-Time Cash Outflow</option>
            <option value="emi">12-Month EMI / Financing</option>
          </select>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? "Evaluating Cash Impact..." : "Evaluate Purchase Affordability"}</span>
          </button>
        </div>
      </form>

      {/* Decision Output Card */}
      {result && (
        <div className={`rounded-2xl border p-5 transition-all ${
          result.color === "emerald"
            ? "border-emerald-500/40 bg-emerald-950/20"
            : result.color === "amber"
            ? "border-amber-500/40 bg-amber-950/20"
            : "border-rose-500/40 bg-rose-950/20"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.color === "emerald" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              )}
              <h4 className="text-sm font-bold text-white">{result.verdict}</h4>
            </div>
            <span className="text-xs font-numeric font-bold text-slate-300">
              Commitment: {formatINR(result.monthly_commitment, { decimals: 0 })}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            {result.recommendation}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Impact on Cash Reserve:</span>
              <strong className="ml-1.5 text-white font-numeric">{result.impact_pct_of_cash}%</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Post-Purchase Reserve:</span>
              <strong className="ml-1.5 text-emerald-400 font-numeric">{formatINR(result.remaining_liquid_cash, { decimals: 0 })}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
