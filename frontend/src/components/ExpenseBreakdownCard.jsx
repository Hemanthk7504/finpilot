import React from "react";
import { PieChart, Calendar } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function ExpenseBreakdownCard({ categoryData }) {
  const breakdown = categoryData?.breakdown || [];
  const totalSpend = categoryData?.total_expense || 0;

  // Standard category color map
  const defaultCategories = [
    { name: "Food & Dining", color: "#8B5CF6", dotColor: "bg-purple-500", percent: 0 },
    { name: "Transport", color: "#F59E0B", dotColor: "bg-amber-500", percent: 0 },
    { name: "Shopping", color: "#06B6D4", dotColor: "bg-cyan-500", percent: 0 },
    { name: "Bills & Utilities", color: "#EC4899", dotColor: "bg-pink-500", percent: 0 },
    { name: "Others", color: "#6366F1", dotColor: "bg-indigo-500", percent: 0 },
  ];

  // If real category data exists, map it; otherwise display the clean 0% layout matching reference
  const categories = defaultCategories.map((def) => {
    const match = breakdown.find(
      (b) => b.category_name?.toLowerCase().includes(def.name.toLowerCase().split(" ")[0])
    );
    if (match) {
      return {
        ...def,
        percent: Math.round(match.percentage || 0),
        amount: match.amount || 0,
      };
    }
    return def;
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl backdrop-blur-xl transition hover:border-slate-700 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/50">
        <Calendar className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-bold text-white">Expense Breakdown</h3>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#1E293B"
              strokeWidth="11"
            />

            {/* Segments */}
            {totalSpend > 0 ? (
              // Dynamic segments if real expenses exist
              breakdown.slice(0, 5).map((item, idx) => {
                const strokeDasharray = `${(item.percentage / 100) * 238.76} 238.76`;
                const colors = ["#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899", "#6366F1"];
                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="11"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-idx * 40}
                  />
                );
              })
            ) : (
              // Multi-color aesthetic segments matching the reference screenshot ring
              <>
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06B6D4"
                  strokeWidth="11"
                  strokeDasharray="60 238.76"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="11"
                  strokeDasharray="45 238.76"
                  strokeDashoffset="-60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EC4899"
                  strokeWidth="11"
                  strokeDasharray="50 238.76"
                  strokeDashoffset="-105"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="11"
                  strokeDasharray="83.76 238.76"
                  strokeDashoffset="-155"
                />
              </>
            )}
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-white font-numeric tracking-tight">
              {formatINR(totalSpend, { decimals: 0 })}
            </span>
            <span className="text-[10px] font-medium text-slate-400">Total Spend</span>
          </div>
        </div>

        {/* Legend on Right Side */}
        <div className="flex-1 w-full space-y-2">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${cat.dotColor}`}></span>
                <span className="text-slate-300 text-xs">{cat.name}</span>
              </div>
              <span className="font-mono text-slate-400 text-xs font-semibold">
                {cat.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
