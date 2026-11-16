import React, { useEffect, useState } from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from "lucide-react";
import { fetchReportSummary } from "../services/api";
import { formatINR } from "../utils/currency";

export default function ReportsModal({ isOpen, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchReportSummary()
        .then((data) => setReport(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight">FinPilot MAX</span>
              <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                Executive Report
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Generated: {report?.generated_at || "Recent"}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Compiling financial performance report...</div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* User Profile & Key KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Account</span>
                <strong className="text-white text-sm">{report?.user_profile?.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Monthly Inflow</span>
                <strong className="text-emerald-400 text-sm font-numeric">{formatINR(report?.financial_kpis?.monthly_inflow)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Monthly Outflow</span>
                <strong className="text-rose-400 text-sm font-numeric">{formatINR(report?.financial_kpis?.monthly_outflow)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Net Savings Rate</span>
                <strong className="text-indigo-400 text-sm">{report?.financial_kpis?.savings_rate_pct}%</strong>
              </div>
            </div>

            {/* Health Score Summary */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">Financial Health Score</span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {report?.health_score?.total_score}/100 · Grade {report?.health_score?.grade}
                </div>
                <p className="text-slate-300 mt-1 max-w-md">{report?.health_score?.summary}</p>
              </div>
              <ShieldCheck className="h-12 w-12 text-indigo-400/80 shrink-0" />
            </div>

            {/* Top Categories */}
            <div>
              <h4 className="font-bold text-sm text-white mb-2">Category Breakdown (30-Day Outflows)</h4>
              <div className="space-y-2">
                {report?.category_spending?.slice(0, 6).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-300">{cat.name}</span>
                    <strong className="text-white font-numeric">{formatINR(cat.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Action Recommendations */}
            <div>
              <h4 className="font-bold text-sm text-white mb-2">Prioritized Wealth Optimizations</h4>
              <div className="space-y-2">
                {report?.health_score?.actionable_recommendations?.map((rec, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 bg-slate-800/30 p-3 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">{rec.title} ({rec.impact})</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{rec.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
