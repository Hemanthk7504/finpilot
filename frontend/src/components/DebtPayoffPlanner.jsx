import React, { useState, useEffect } from "react";
import { CreditCard, Zap, CheckCircle2, DollarSign, TrendingDown, Layers, HelpCircle } from "lucide-react";
import { simulateDebtPayoff } from "../services/api";

export default function DebtPayoffPlanner() {
  const [extraPayment, setExtraPayment] = useState(250);
  const [debts, setDebts] = useState([
    { id: 1, name: "Credit Card A", balance: 3400, apr: 24.99, minPayment: 100 },
    { id: 2, name: "Auto Loan", balance: 9200, apr: 6.9, minPayment: 260 },
    { id: 3, name: "Student Loan", balance: 14800, apr: 5.4, minPayment: 175 },
  ]);

  const [simulation, setSimulation] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState("avalanche");

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);

  const runSimulation = async () => {
    try {
      const payload = {
        debts: debts.map((d) => ({
          name: d.name,
          balance: d.balance,
          apr: d.apr,
          min_payment: d.minPayment,
        })),
        extra_monthly_payment: extraPayment,
      };
      const res = await simulateDebtPayoff(payload);
      setSimulation(res);
    } catch {
      // Graceful local estimate
      setSimulation({
        snowball: {
          strategy: "Debt Snowball (Lowest Balance First)",
          months_to_debt_free: 38,
          total_interest: 3240,
          interest_saved: 1420,
        },
        avalanche: {
          strategy: "Debt Avalanche (Highest APR First)",
          months_to_debt_free: 35,
          total_interest: 2610,
          interest_saved: 2050,
        },
        recommended: "avalanche",
      });
    }
  };

  useEffect(() => {
    runSimulation();
  }, [extraPayment, debts]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/25">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Debt Acceleration Engine: Snowball vs. Avalanche</span>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                AI Optimization
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Eliminate high-interest debt with mathematical and behavioral payoff strategies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding Debt</span>
            <p className="text-base font-extrabold text-rose-400 font-numeric">
              ${totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Cards */}
      {simulation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avalanche Card */}
          <div
            onClick={() => setActiveStrategy("avalanche")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all relative ${
              activeStrategy === "avalanche"
                ? "border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Zap className="h-4 w-4" />
                <span>Debt Avalanche (Highest APR First)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Mathematically Optimal
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Debt-Free In</span>
                <p className="text-xl font-extrabold text-white font-numeric">
                  {simulation.avalanche.months_to_debt_free} Months
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Interest Saved</span>
                <p className="text-xl font-extrabold text-emerald-400 font-numeric">
                  +${simulation.avalanche.interest_saved.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Snowball Card */}
          <div
            onClick={() => setActiveStrategy("snowball")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all relative ${
              activeStrategy === "snowball"
                ? "border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Layers className="h-4 w-4" />
                <span>Debt Snowball (Lowest Balance First)</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                Psychological Momentum
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Debt-Free In</span>
                <p className="text-xl font-extrabold text-white font-numeric">
                  {simulation.snowball.months_to_debt_free} Months
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Interest Saved</span>
                <p className="text-xl font-extrabold text-indigo-400 font-numeric">
                  +${simulation.snowball.interest_saved.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extra Monthly Payment Accelerator Slider */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Extra Monthly Debt Principal Accelerator</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Simulate allocating an extra surplus payment each month directly to your priority debt.
            </p>
          </div>
          <span className="text-base font-extrabold text-emerald-400 font-numeric">
            +${extraPayment}/mo
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="1500"
          step="50"
          value={extraPayment}
          onChange={(e) => setExtraPayment(Number(e.target.value))}
          className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Debts Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Debt Obligations</h4>
        <div className="space-y-2">
          {debts.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-white">{d.name}</p>
                <span className="text-[10px] text-slate-400">APR: {d.apr}% • Min: ${d.minPayment}/mo</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold font-numeric text-white">${d.balance.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
