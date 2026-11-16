import React, { useState } from "react";
import { Repeat, Calendar, Trash2, CheckCircle2, TrendingDown, Scissors } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function SubscriptionAudit({ forecastData }) {
  const initialSubs = (forecastData?.detected_recurring || []).length > 0
    ? forecastData.detected_recurring.map((s, idx) => ({
        id: idx + 1,
        merchant: s.merchant,
        amount: s.estimated_amount,
        frequency: `Every ${s.frequency_days} days`,
        annualCost: Math.round(s.estimated_amount * (365 / (s.frequency_days || 30))),
        selectedToCut: false,
      }))
    : [
        { id: 1, merchant: "Netflix Premium", amount: 649, frequency: "Monthly", annualCost: 7788, selectedToCut: false },
        { id: 2, merchant: "Spotify Premium", amount: 119, frequency: "Monthly", annualCost: 1428, selectedToCut: false },
        { id: 3, merchant: "Amazon Prime Annual", amount: 299, frequency: "Monthly (amortized)", annualCost: 1499, selectedToCut: false },
        { id: 4, merchant: "Cult.fit / Gym Fitness", amount: 2200, frequency: "Monthly", annualCost: 26400, selectedToCut: false },
        { id: 5, merchant: "Airtel / Jio Fiber", amount: 1179, frequency: "Monthly", annualCost: 14148, selectedToCut: false },
      ];

  const [subs, setSubs] = useState(initialSubs);

  const toggleCut = (id) => {
    setSubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selectedToCut: !s.selectedToCut } : s))
    );
  };

  const totalMonthlySpend = subs.reduce((sum, s) => sum + s.amount, 0);
  const totalAnnualSpend = subs.reduce((sum, s) => sum + s.annualCost, 0);

  const cutSubs = subs.filter((s) => s.selectedToCut);
  const potentialMonthlySaved = cutSubs.reduce((sum, s) => sum + s.amount, 0);
  const potentialAnnualSaved = cutSubs.reduce((sum, s) => sum + s.annualCost, 0);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-600 text-white shadow-lg shadow-rose-500/25">
            <Repeat className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Subscription &amp; Recurring Leakage Audit</span>
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                Auto-Detected
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit recurring charges, simulate cancellations, and quantify annual compounding gains.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Annual Subscription Drain</span>
            <p className="text-base font-extrabold text-rose-400 font-numeric">
              {formatINR(totalAnnualSpend)}/yr
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Savings Callout if any selected */}
      {potentialAnnualSaved > 0 && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scissors className="h-5 w-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Cut Impact: {cutSubs.length} Subscriptions Selected</h4>
              <p className="text-[11px] text-slate-300">
                Cutting these will free up <strong className="text-emerald-400 font-numeric">{formatINR(potentialMonthlySaved)}/mo</strong> to redirect into mutual fund SIPs.
              </p>
            </div>
          </div>
          <span className="text-lg font-black font-numeric text-emerald-400">
            +{formatINR(potentialAnnualSaved)}/yr
          </span>
        </div>
      )}

      {/* Subscription List */}
      <div className="space-y-2">
        {subs.map((sub) => (
          <div
            key={sub.id}
            onClick={() => toggleCut(sub.id)}
            className={`cursor-pointer rounded-2xl border p-3.5 flex items-center justify-between transition-all ${
              sub.selectedToCut
                ? "border-rose-500/50 bg-rose-950/20 opacity-80"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={sub.selectedToCut}
                onChange={() => {}}
                className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
              />
              <div>
                <p className={`text-xs font-bold ${sub.selectedToCut ? "line-through text-slate-400" : "text-white"}`}>
                  {sub.merchant}
                </p>
                <span className="text-[10px] text-slate-400">{sub.frequency}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-extrabold font-numeric text-white">
                {formatINR(sub.amount)}/mo
              </p>
              <span className="text-[10px] text-slate-500 font-numeric">
                {formatINR(sub.annualCost)}/yr
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
