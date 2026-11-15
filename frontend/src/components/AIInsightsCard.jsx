import React from "react";
import { Bot, CheckCircle2, ArrowRight } from "lucide-react";

export default function AIInsightsCard({ overview, onOpenChat }) {
  const savingsRate = overview?.savings_rate ?? 100.0;
  const healthScore = Math.round(overview?.health_score ?? 81);
  const healthGrade = overview?.health_grade ?? "Grade A";

  const insights = [
    `You've maintained a ${savingsRate.toFixed(0)}% savings rate this month. Great job!`,
    `Your financial health score is ${healthScore} (${healthGrade}).`,
    "Consider setting a monthly budget to track expenses.",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/40 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between transition hover:border-purple-500/50">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1">
            <span>AI Insights</span>
            <span className="text-purple-400">✨</span>
          </h3>
        </div>

        {/* Bullet Points */}
        <div className="mt-4 space-y-3">
          {insights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3">
        <button
          onClick={onOpenChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-4 shadow-lg shadow-purple-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Ask FinPilot AI</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
