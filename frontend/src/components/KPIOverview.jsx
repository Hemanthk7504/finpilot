import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, ShieldCheck, AlertCircle, TrendingUp } from "lucide-react";

export default function KPIOverview({ overview, anomaliesCount }) {
  const currency = overview?.currency || "$";
  const balance = overview?.current_balance ?? 5420.0;
  const inflow = overview?.total_inflow_30d ?? 6500.0;
  const outflow = overview?.total_outflow_30d ?? 3840.0;
  const netSavings = overview?.net_savings_30d ?? 2660.0;
  const savingsRate = overview?.savings_rate ?? 40.9;
  const healthScore = overview?.health_score ?? 82.0;
  const healthGrade = overview?.health_grade ?? "A";
  const healthTitle = overview?.health_title ?? "Strong & Resilient";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Working Balance */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl transition hover:border-indigo-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Liquid Balance</span>
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-numeric text-white tracking-tight">
            {currency}{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+30-day net: {currency}{netSavings.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 font-medium">
          Base Income: {currency}{overview?.monthly_income?.toLocaleString()}/mo
        </div>
      </div>

      {/* 2. 30-Day Cash Flow */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl transition hover:border-cyan-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">30-Day Net Cash Flow</span>
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-extrabold font-numeric tracking-tight ${netSavings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {netSavings >= 0 ? "+" : ""}{currency}{netSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">
              In: {currency}{inflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-rose-400 font-semibold">
              Out: {currency}{outflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        {/* Visual Dual Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 flex">
          <div className="bg-emerald-500" style={{ width: `${Math.min(100, (inflow / (inflow + outflow || 1)) * 100)}%` }}></div>
          <div className="bg-rose-500" style={{ width: `${Math.min(100, (outflow / (inflow + outflow || 1)) * 100)}%` }}></div>
        </div>
      </div>

      {/* 3. Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl transition hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Savings Rate</span>
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-numeric text-white tracking-tight">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${savingsRate >= 20 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {savingsRate >= 20 ? 'Exceeds Benchmark' : 'Below 20% Target'}
            </span>
            <span className="text-slate-500">Target: ≥20%</span>
          </div>
        </div>
        {/* Meter */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-500 ${savingsRate >= 20 ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${Math.min(100, Math.max(5, savingsRate))}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Financial Health Score */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl transition hover:border-purple-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Health Score</span>
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-numeric text-white tracking-tight">
              {healthScore.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
            <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 text-xs font-extrabold text-indigo-300">
              Grade {healthGrade}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">{healthTitle}</span>
            {anomaliesCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                <AlertCircle className="h-3 w-3" />
                {anomaliesCount} anomalies
              </span>
            )}
          </div>
        </div>
        {/* Health Meter */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, healthScore))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
