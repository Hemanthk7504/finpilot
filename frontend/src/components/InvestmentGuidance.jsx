import React, { useState } from "react";
import { TrendingUp, Shield, PieChart as PieIcon, Calculator, ArrowRight, DollarSign } from "lucide-react";

export default function InvestmentGuidance() {
  const [riskProfile, setRiskProfile] = useState("Balanced"); // Conservative, Balanced, Growth
  const [monthlySIP, setMonthlySIP] = useState(500);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [adjustInflation, setAdjustInflation] = useState(false);

  // Asset allocations by profile
  const allocations = {
    Conservative: {
      equity: 30,
      debt: 50,
      gold: 10,
      cash: 10,
      description: "Focus on capital preservation, low volatility, and guaranteed fixed returns.",
    },
    Balanced: {
      equity: 60,
      debt: 25,
      gold: 10,
      cash: 5,
      description: "Optimal balance between long-term compound growth and downside protection.",
    },
    Growth: {
      equity: 80,
      debt: 10,
      gold: 5,
      cash: 5,
      description: "Maximizes compound wealth expansion over a 7+ year horizon.",
    },
  };

  const activeAlloc = allocations[riskProfile];

  // Compound Interest Calculation (SIP formula)
  // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = years * 12;
  const investedAmount = monthlySIP * totalMonths;

  const effectiveRate = adjustInflation ? Math.max(0.01, expectedReturn - 4.5) / 100 / 12 : monthlyRate;
  const futureValue =
    monthlySIP *
    ((Math.pow(1 + effectiveRate, totalMonths) - 1) / effectiveRate) *
    (1 + effectiveRate);
  const totalGain = Math.max(0, futureValue - investedAmount);

  return (
    <div className="space-y-6">
      {/* Risk Profile & Asset Allocation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Personalized Asset Allocation & Risk Profile
            </h3>
            <p className="text-xs text-slate-400">
              Optimal multi-asset distribution calibrated to your investment horizon.
            </p>
          </div>

          {/* Risk Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 self-start sm:self-auto">
            {["Conservative", "Balanced", "Growth"].map((p) => (
              <button
                key={p}
                onClick={() => setRiskProfile(p)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  riskProfile === p
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5">{activeAlloc.description}</p>

        {/* Allocation Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Equities / Index</span>
            <div className="text-2xl font-black text-white mt-1">{activeAlloc.equity}%</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">S&P 500 / Total Mkt</span>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Fixed Income / Debt</span>
            <div className="text-2xl font-black text-white mt-1">{activeAlloc.debt}%</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Treasuries & Bonds</span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Gold / Hedging</span>
            <div className="text-2xl font-black text-white mt-1">{activeAlloc.gold}%</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Inflation Buffer</span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Liquid Cash</span>
            <div className="text-2xl font-black text-white mt-1">{activeAlloc.cash}%</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">High Yield Savings</span>
          </div>
        </div>
      </div>

      {/* SIP & Compound Interest Growth Simulator */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-400" />
              SIP & Compound Wealth Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Calculate the exponential impact of systematic monthly investments over time.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={adjustInflation}
              onChange={(e) => setAdjustInflation(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
            />
            <span>Adjust for 4.5% Inflation</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Monthly Investment Amount</span>
                <span className="text-white font-bold">${monthlySIP}/mo</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={monthlySIP}
                onChange={(e) => setMonthlySIP(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Investment Horizon</span>
                <span className="text-white font-bold">{years} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Expected Annual Rate of Return</span>
                <span className="text-white font-bold">{expectedReturn}% p.a.</span>
              </div>
              <input
                type="range"
                min="5"
                max="18"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-6 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 p-5 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Estimated Maturity Value {adjustInflation && "(Real Purchasing Power)"}
              </span>
              <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
                ${Math.round(futureValue).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Principal Invested</span>
                <strong className="text-white text-sm">${investedAmount.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Wealth Gain</span>
                <strong className="text-emerald-400 text-sm">+${Math.round(totalGain).toLocaleString()}</strong>
              </div>
            </div>

            <div className="rounded-lg bg-indigo-500/10 p-2.5 text-[11px] text-indigo-300">
              💡 Consistent compounding multiplies your capital by <strong>{(futureValue / investedAmount).toFixed(1)}x</strong> over {years} years!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
