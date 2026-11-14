import React, { useState } from "react";
import { Landmark, TrendingUp, ArrowUpRight, DollarSign, PieChart, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function NetWorthTracker({ overview }) {
  const [cash, setCash] = useState(overview?.current_balance || 5420);
  const [investments, setInvestments] = useState(14800);
  const [property, setProperty] = useState(0);

  const [creditDebt, setCreditDebt] = useState(1200);
  const [studentDebt, setStudentDebt] = useState(8500);
  const [autoDebt, setAutoDebt] = useState(4200);

  const totalAssets = cash + investments + property;
  const totalLiabilities = creditDebt + studentDebt + autoDebt;
  const netWorth = totalAssets - totalLiabilities;
  const debtToAsset = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;

  // 6-Month Projected Trend Data
  const trendData = [
    { month: "May", netWorth: netWorth - 5200, assets: totalAssets - 4000, debt: totalLiabilities + 1200 },
    { month: "Jun", netWorth: netWorth - 4100, assets: totalAssets - 3100, debt: totalLiabilities + 1000 },
    { month: "Jul", netWorth: netWorth - 3200, assets: totalAssets - 2400, debt: totalLiabilities + 800 },
    { month: "Aug", netWorth: netWorth - 2000, assets: totalAssets - 1500, debt: totalLiabilities + 500 },
    { month: "Sep", netWorth: netWorth - 900, assets: totalAssets - 600, debt: totalLiabilities + 300 },
    { month: "Current", netWorth: netWorth, assets: totalAssets, debt: totalLiabilities },
  ];

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/25">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Personal Balance Sheet &amp; Net Worth Engine</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Solvency Metric
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete Asset vs. Liability accounting: Liquid cash, stocks, and debt obligations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Net Worth</span>
            <p className="text-xl font-black text-emerald-400 font-numeric">
              ${netWorth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Assets</span>
          <p className="text-2xl font-extrabold text-white font-numeric mt-1">${totalAssets.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-400">Cash + Investments</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Liabilities</span>
          <p className="text-2xl font-extrabold text-rose-400 font-numeric mt-1">${totalLiabilities.toLocaleString()}</p>
          <span className="text-[11px] text-rose-400">Credit + Student Loans</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Debt-to-Asset Ratio</span>
          <p className="text-2xl font-extrabold text-indigo-400 font-numeric mt-1">{debtToAsset}%</p>
          <span className="text-[11px] text-slate-400">{debtToAsset <= 40 ? "Healthy Solvency ✓" : "Leveraged"}</span>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>6-Month Net Worth Trajectory</span>
        </h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="netWorth" stroke="#10B981" strokeWidth={2.5} fill="url(#netWorthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Asset/Liability Breakdown Adjuster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Assets Form */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/40 p-4 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400">Asset Accounts ($)</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Liquid Checking &amp; Savings:</span>
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-right text-white font-numeric"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Brokerage &amp; Retirement:</span>
              <input
                type="number"
                value={investments}
                onChange={(e) => setInvestments(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-right text-white font-numeric"
              />
            </div>
          </div>
        </div>

        {/* Liabilities Form */}
        <div className="rounded-2xl border border-rose-500/20 bg-slate-950/40 p-4 space-y-3">
          <h4 className="text-xs font-bold text-rose-400">Liability Accounts ($)</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Credit Card Balance:</span>
              <input
                type="number"
                value={creditDebt}
                onChange={(e) => setCreditDebt(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-right text-white font-numeric"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Student &amp; Auto Loans:</span>
              <input
                type="number"
                value={studentDebt + autoDebt}
                onChange={(e) => setStudentDebt(Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-right text-white font-numeric"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
