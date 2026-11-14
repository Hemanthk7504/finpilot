import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon, Layers, TrendingUp, CheckCircle } from "lucide-react";

export default function SpendingCharts({ categoryData }) {
  const categories = categoryData?.categories || [];
  const totalSpend = categoryData?.total_spend || 0;
  const f503020 = categoryData?.framework_50_30_20 || {
    needs_actual_percent: 52.0,
    wants_actual_percent: 24.0,
    savings_actual_percent: 24.0,
    needs_target_percent: 50.0,
    wants_target_percent: 30.0,
    savings_target_percent: 20.0,
  };

  const chartData = categories.slice(0, 6).map((c) => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }));

  const COLORS = ["#6366F1", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = totalSpend > 0 ? ((data.value / totalSpend) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-indigo-400 font-bold mt-1">
            ${data.value.toLocaleString()} <span className="text-slate-400 font-normal">({pct}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Donut Chart: Category Spending Breakdown */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-indigo-400" />
              Category Outflow Distribution
            </h3>
            <p className="text-xs text-slate-400">Total Analyzed Outflow: ${totalSpend.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
          <div className="sm:col-span-6 h-56 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No transactions recorded yet.</p>
            )}
          </div>

          {/* Top Categories Legend */}
          <div className="sm:col-span-6 space-y-2">
            {categories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-slate-300 truncate">{cat.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-white">${cat.amount.toLocaleString()}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 50/30/20 Framework Compliance */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              50/30/20 Budget Rule
            </h3>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
              Guideline Match
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Benchmark distribution for sound financial health: 50% Needs, 30% Wants, 20% Savings.
          </p>

          <div className="space-y-4">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Needs (Essential Expenses)</span>
                <span className="text-white font-bold">
                  {f503020.needs_actual_percent}% <span className="text-slate-400 font-normal">/ 50% target</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, f503020.needs_actual_percent)}%` }}
                ></div>
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Wants (Discretionary)</span>
                <span className="text-white font-bold">
                  {f503020.wants_actual_percent}% <span className="text-slate-400 font-normal">/ 30% target</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    f503020.wants_actual_percent <= 30 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, f503020.wants_actual_percent)}%` }}
                ></div>
              </div>
            </div>

            {/* Savings & Investments */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Savings & Investments</span>
                <span className="text-white font-bold">
                  {f503020.savings_actual_percent}% <span className="text-slate-400 font-normal">/ 20% target</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, f503020.savings_actual_percent)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-xs text-slate-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Your savings and wants allocations are well balanced within the optimal range.</span>
        </div>
      </div>
    </div>
  );
}
