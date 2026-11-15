import React from "react";
import { Wallet, BarChart3, Percent, ShieldCheck, ArrowUp } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function KPIOverview({ overview }) {
  const balance = overview?.current_balance ?? 5420.0;
  const inflow = overview?.total_inflow_30d ?? 6500.0;
  const outflow = overview?.total_outflow_30d ?? 0.0;
  const netSavings = overview?.net_savings_30d ?? (inflow - outflow);
  const savingsRate = overview?.savings_rate ?? (inflow > 0 ? (netSavings / inflow) * 100 : 100.0);
  const healthScore = Math.round(overview?.health_score ?? 81);
  const healthGrade = overview?.health_grade ?? "Grade A";
  const healthTitle = overview?.health_title ?? "Strong & Financially Resilient";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Total Liquid Balance (Purple Gradient Theme) */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/70 p-5 shadow-lg shadow-purple-950/30 backdrop-blur-xl transition hover:border-purple-500/50 hover:shadow-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-300">Total Liquid Balance</span>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-extrabold font-numeric text-white tracking-tight">
            {formatINR(balance)}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>+21.6% vs last month</span>
          </div>
        </div>
      </div>

      {/* CARD 2: 30-Day Net Cash Flow (Emerald Gradient Theme) */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-teal-950/60 p-5 shadow-lg shadow-emerald-950/30 backdrop-blur-xl transition hover:border-emerald-500/50 hover:shadow-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-300">30-Day Net Cash Flow</span>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-extrabold font-numeric text-emerald-400 tracking-tight">
            {netSavings >= 0 ? "+" : ""}{formatINR(netSavings)}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>In: {formatINR(inflow, { decimals: 0 })}</span>
            <span className="text-slate-600">|</span>
            <span>Out: {formatINR(outflow, { decimals: 0 })}</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Monthly Savings Rate (Blue Gradient Theme) */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-slate-900/90 to-indigo-950/60 p-5 shadow-lg shadow-blue-950/30 backdrop-blur-xl transition hover:border-blue-500/50 hover:shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-300">Monthly Savings Rate</span>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-extrabold font-numeric text-white tracking-tight">
            {savingsRate.toFixed(1)}%
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {savingsRate >= 20 ? "Above Target" : "Below Target"}
            </span>
            <span className="text-slate-400 text-[11px]">Target: ≥ 20%</span>
          </div>
        </div>
      </div>

      {/* CARD 4: Financial Health Score (Violet Gradient Theme) */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-violet-950/60 p-5 shadow-lg shadow-violet-950/30 backdrop-blur-xl transition hover:border-violet-500/50 hover:shadow-violet-500/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-300">Financial Health Score</span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold font-numeric text-white tracking-tight">
              {healthScore} <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </h3>
            <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300">
              {healthGrade}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {healthTitle}
          </div>
        </div>
      </div>
    </div>
  );
}
