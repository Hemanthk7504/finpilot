import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, ShieldCheck, AlertCircle } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Liquid Balance</span>
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-white">
            {currency}{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+30-day net: {currency}{netSavings.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          Base Income: {currency}{overview?.monthly_income?.toLocaleString()}/mo
        </div>
      </div>

      {/* 2. 30-Day Cash Flow */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">30-Day Net Cash Flow</span>
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {netSavings >= 0 ? "+" : ""}{currency}{netSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              In: {currency}{inflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              Out: {currency}{outflow.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        {/* Visual Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 flex">
          <div className="bg-emerald-500" style={{ width: `${Math.min(100, (inflow / (inflow + outflow || 1)) * 100)}%` }}></div>
          <div className="bg-rose-500" style={{ width: `${Math.min(100, (outflow / (inflow + outflow || 1)) * 100)}%` }}></div>
        </div>
      </div>

      {/* 3. Savings Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Savings Rate</span>
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight text-white">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${savingsRate >= 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {savingsRate >= 20 ? 'Exceeds Benchmark' : 'Below 20% Target'}
            </span>
            <span className="text-slate-400">Target: ≥20%</span>
          </div>
        </div>
        {/* Meter */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
            style={{ width: `${Math.min(100, (savingsRate / 50) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 4. Financial Health Score */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm transition hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Financial Health Score</span>
          <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{healthScore.toFixed(0)}</span>
              <span className="text-sm font-normal text-slate-400">/100</span>
              <span className="ml-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                Grade {healthGrade}
              </span>
            </div>
            <div className="mt-1 text-xs font-medium text-purple-300">
              {healthTitle}
            </div>
          </div>
        </div>
        {anomaliesCount > 0 ? (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{anomaliesCount} anomaly flagged for review</span>
          </div>
        ) : (
          <div className="mt-3 text-[11px] text-slate-400">
            Optimal 50/30/20 alignment
          </div>
        )}
      </div>
    </div>
  );
}
