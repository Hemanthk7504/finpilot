import React, { useState, useEffect } from "react";
import { Flame, TrendingUp, Calculator, ShieldCheck, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { simulateFIRE } from "../services/api";
import { formatINR } from "../utils/currency";

export default function FIRECalculator({ overview, currentUser }) {
  const annualIncome = (currentUser?.monthly_income || overview?.monthly_income || 75000) * 12;
  const [annualExpense, setAnnualExpense] = useState(Math.round(annualIncome * 0.5) || 450000);
  const [currentPortfolio, setCurrentPortfolio] = useState(350000);
  const [monthlySavings, setMonthlySavings] = useState(25000);
  const [expectedReturn, setExpectedReturn] = useState(12.0); // Equity mutual fund CAGR in India
  const [swr, setSwr] = useState(4.0); // Safe Withdrawal Rate %

  const [fireData, setFireData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculate = async () => {
    setIsLoading(true);
    try {
      const data = await simulateFIRE({
        annual_expense: annualExpense,
        current_portfolio: currentPortfolio,
        monthly_savings: monthlySavings,
        expected_return_pct: expectedReturn,
        safe_withdrawal_rate: swr,
      });
      setFireData(data);
    } catch {
      // Local fallback calculation
      const target = annualExpense * (100 / swr);
      const lean = annualExpense * 0.75 * 25;
      const fat = annualExpense * 1.5 * 33.3;
      setFireData({
        traditional_fire_target: target,
        lean_fire_target: lean,
        fat_fire_target: fat,
        years_to_fire: Math.max(1, Math.round(((target - currentPortfolio) / (monthlySavings * 12 + target * 0.04)) * 10) / 10),
        current_progress_pct: Math.min(100, Math.round((currentPortfolio / target) * 100)),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [annualExpense, currentPortfolio, monthlySavings, expectedReturn, swr]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>F.I.R.E. Independence &amp; Early Retirement Simulator</span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                Trinity Rule Model
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate Lean FIRE, Traditional FIRE, and Fat FIRE milestones with dynamic withdrawal simulations.
            </p>
          </div>
        </div>

        {fireData && (
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Est. Years to Freedom</span>
              <p className="text-xl font-black text-amber-400 font-numeric">
                {fireData.years_to_fire} Years
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3 FIRE Milestone Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Lean FIRE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Lean FIRE (Frugal)</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">75% Core</span>
          </div>
          <div className="mt-2 text-xl font-bold font-numeric text-white">
            {fireData?.lean_fire_target ? formatINR(fireData.lean_fire_target) : "..."}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Essential living expenses covered completely.</p>
        </div>

        {/* Traditional FIRE */}
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-4 shadow-lg shadow-indigo-500/10 transition hover:border-indigo-500/60">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Traditional FIRE</span>
            </span>
            <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-300">
              100% Lifestyle
            </span>
          </div>
          <div className="mt-2 text-2xl font-black font-numeric text-indigo-300">
            {fireData?.traditional_fire_target ? formatINR(fireData.traditional_fire_target) : "..."}
          </div>
          <p className="mt-1 text-[11px] text-slate-300">Full current lifestyle sustained forever at {swr}% SWR.</p>
        </div>

        {/* Fat FIRE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fat FIRE (Abundant)</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">150% Luxury</span>
          </div>
          <div className="mt-2 text-xl font-bold font-numeric text-white">
            {fireData?.fat_fire_target ? formatINR(fireData.fat_fire_target) : "..."}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">High travel, upgraded housing, and generous buffer.</p>
        </div>
      </div>

      {/* Progress Toward Freedom */}
      {fireData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Current FIRE Portfolio Progress</span>
            <span className="font-bold font-numeric text-emerald-400">{fireData.current_progress_pct}% Funded</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(3, fireData.current_progress_pct))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
        {/* Annual Expense */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Annual Living Expense</span>
            <span className="text-white font-numeric">{formatINR(annualExpense)}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="3000000"
            step="25000"
            value={annualExpense}
            onChange={(e) => setAnnualExpense(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Current Portfolio */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Invested Portfolio</span>
            <span className="text-white font-numeric">{formatINR(currentPortfolio)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000000"
            step="50000"
            value={currentPortfolio}
            onChange={(e) => setCurrentPortfolio(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Monthly Savings */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Monthly Contribution</span>
            <span className="text-emerald-400 font-numeric">{formatINR(monthlySavings)}/mo</span>
          </div>
          <input
            type="range"
            min="1000"
            max="150000"
            step="2500"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Expected Return */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Portfolio CAGR</span>
            <span className="text-white font-numeric">{expectedReturn}%</span>
          </div>
          <input
            type="range"
            min="6.0"
            max="18.0"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
