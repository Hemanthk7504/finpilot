import React from "react";
import { Shield, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, Award } from "lucide-react";

export default function HealthScoreCard({ healthScoreData }) {
  const score = healthScoreData?.total_score ?? 82.0;
  const grade = healthScoreData?.grade ?? "A";
  const title = healthScoreData?.rating_title ?? "Strong & Resilient";
  const summary = healthScoreData?.summary ?? "Great financial health habits.";
  const pillars = healthScoreData?.pillars || [];
  const recommendations = healthScoreData?.actionable_recommendations || [];

  const getPillarColor = (pScore) => {
    if (pScore >= 80) return "bg-emerald-500 text-emerald-400";
    if (pScore >= 60) return "bg-indigo-500 text-indigo-400";
    if (pScore >= 40) return "bg-amber-500 text-amber-400";
    return "bg-rose-500 text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Score & Grade Gauge */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Shield className="h-3.5 w-3.5" />
              <span>Multi-Factor Financial Wellness Index</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Financial Health Score:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {score.toFixed(0)} / 100
              </span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{summary}</p>
          </div>

          {/* Large Badge */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Rating Grade</span>
              <span className="text-4xl font-black text-white mt-1">{grade}</span>
              <span className="text-[10px] text-slate-400 mt-1">{title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Evaluated Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((pillar, idx) => {
          const colorClass = getPillarColor(pillar.score);
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white">{pillar.name}</span>
                  <span className="text-xs font-bold text-slate-300">
                    {pillar.score.toFixed(0)} <span className="text-slate-500 font-normal">/ 100</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Weight: {pillar.weight}%</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      pillar.score >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {pillar.status}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${colorClass.split(" ")[0]}`}
                    style={{ width: `${Math.min(100, pillar.score)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Benchmark: <strong className="text-slate-300">{pillar.benchmark}</strong></div>
                <div className="text-slate-300 leading-tight">{pillar.details}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Recommendations to Level Up */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              AI Recommendations to Level Up Your Score
            </h3>
            <p className="text-xs text-slate-400">
              Personalized action steps prioritizing highest score uplift and financial impact.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-white">{rec.title}</h4>
                  <span className="shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    {rec.impact}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5">{rec.category}</span>
                  <span>•</span>
                  <span>Effort: <strong className="text-slate-300">{rec.difficulty}</strong></span>
                </div>
                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">{rec.action}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition">
                  Activate Plan <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
