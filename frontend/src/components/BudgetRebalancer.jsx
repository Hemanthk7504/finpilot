import React, { useState } from "react";
import { Sliders, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, RefreshCw } from "lucide-react";

export default function BudgetRebalancer({ overview, currentUser }) {
  const baseSalary = currentUser?.monthly_income || overview?.monthly_income || 6500;
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  const needsAmount = Math.round((baseSalary * needsPct) / 100);
  const wantsAmount = Math.round((baseSalary * wantsPct) / 100);
  const savingsAmount = Math.round((baseSalary * savingsPct) / 100);

  const resetCFPB = () => {
    setNeedsPct(50);
    setWantsPct(30);
    setSavingsPct(20);
  };

  const totalPct = needsPct + wantsPct + savingsPct;
  const isValid100 = totalPct === 100;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>50/30/20 Rule Stress-Tester &amp; Rebalancer</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isValid100 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {isValid100 ? "Balanced 100%" : `${totalPct}% Allocated`}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulate budget shocks: Adjust percentages to test impact on Needs, Wants, and Savings capacity.
            </p>
          </div>
        </div>

        <button
          onClick={resetCFPB}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
          <span>Reset to CFPB 50/30/20</span>
        </button>
      </div>

      {/* Visual Three-Bar Distribution */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="bg-indigo-500 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: `${needsPct}%` }}
          >
            {needsPct > 12 && `${needsPct}% Needs`}
          </div>
          <div
            className="bg-cyan-500 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: `${wantsPct}%` }}
          >
            {wantsPct > 12 && `${wantsPct}% Wants`}
          </div>
          <div
            className="bg-emerald-500 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: `${savingsPct}%` }}
          >
            {savingsPct > 12 && `${savingsPct}% Save`}
          </div>
        </div>
      </div>

      {/* 3 Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Needs (50%) */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/60 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-400">Needs (Essentials)</span>
            <span className="font-extrabold font-numeric text-white">{needsPct}%</span>
          </div>
          <div className="text-xl font-bold font-numeric text-white">
            ${needsAmount.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <input
            type="range"
            min="20"
            max="70"
            value={needsPct}
            onChange={(e) => setNeedsPct(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">Housing, groceries, bills, loan minimums.</p>
        </div>

        {/* Wants (30%) */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400">Wants (Discretionary)</span>
            <span className="font-extrabold font-numeric text-white">{wantsPct}%</span>
          </div>
          <div className="text-xl font-bold font-numeric text-white">
            ${wantsAmount.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={wantsPct}
            onChange={(e) => setWantsPct(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">Dining out, travel, entertainment, leisure.</p>
        </div>

        {/* Savings & Investments (20%) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-400">Savings &amp; Wealth</span>
            <span className="font-extrabold font-numeric text-white">{savingsPct}%</span>
          </div>
          <div className="text-xl font-bold font-numeric text-white">
            ${savingsAmount.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={savingsPct}
            onChange={(e) => setSavingsPct(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-400">Emergency fund, ETFs, stocks, debt payoff.</p>
        </div>
      </div>
    </div>
  );
}
