import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Check, Info, AlertOctagon } from "lucide-react";

export default function AnomalyAlerts({ anomalies = [], onDismiss }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    if (onDismiss) onDismiss(id);
  };

  const activeAnomalies = anomalies.filter((a) => !dismissedIds.has(a.id));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Anomaly & Suspicious Charge Radar
          </h3>
          <p className="text-xs text-slate-400">
            Automated detection using Isolation Forest ML and 48-hour duplicate transaction filters.
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400">
          {activeAnomalies.length} Flagged
        </span>
      </div>

      {activeAnomalies.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white text-sm">No Active Anomalies Detected</h4>
          <p className="text-xs text-slate-400 mt-1">
            All your recent transactions conform to expected spending patterns and historical variance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAnomalies.map((ano) => (
            <div
              key={ano.id}
              className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition hover:bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400 shrink-0 mt-0.5">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{ano.merchant}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">{ano.category}</span>
                    <span className="text-slate-400 text-xs">• {ano.date}</span>
                  </div>
                  <p className="text-xs text-amber-200 mt-1 leading-normal font-medium">{ano.reason}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                <span className="text-base font-bold text-white">${ano.amount.toFixed(2)}</span>
                <button
                  onClick={() => handleDismiss(ano.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 transition"
                >
                  <Check className="h-3 w-3 text-emerald-400" />
                  Verified
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
