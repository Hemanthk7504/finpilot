import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, Check, Info, AlertOctagon, ChevronDown, ChevronUp } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function AnomalyAlerts({ anomalies = [], onDismiss }) {
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const handleDismiss = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    if (onDismiss) onDismiss(id);
  };

  const activeAnomalies = anomalies.filter((a) => !dismissedIds.has(a.id));
  const displayedAnomalies = showAll ? activeAnomalies : activeAnomalies.slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Fraud & Anomaly Guard</span>
          </h3>
          <p className="text-xs text-slate-400">
            Isolation Forest ML & 48-hour duplicate detection radar.
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400">
          {activeAnomalies.length} Flagged
        </span>
      </div>

      {activeAnomalies.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white text-sm">All Transactions Normal</h4>
          <p className="text-xs text-slate-400 mt-1">
            Zero duplicate charges or anomalous variance detected across your statement.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedAnomalies.map((ano) => (
            <div
              key={ano.id}
              className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 transition hover:bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400 shrink-0 mt-0.5">
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-white">{ano.merchant}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      {ano.category}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">• {ano.date}</span>
                  </div>
                  <p className="text-xs text-amber-200 mt-1 leading-snug">{ano.reason}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                <span className="text-sm font-bold font-numeric text-rose-400">
                  {formatINR(ano.amount)}
                </span>
                <button
                  onClick={() => handleDismiss(ano.id)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition"
                >
                  <Check className="h-3 w-3" />
                  <span>Verify</span>
                </button>
              </div>
            </div>
          ))}

          {activeAnomalies.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-2 py-2 text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition"
            >
              <span>{showAll ? "Show Less" : `View All ${activeAnomalies.length} Flagged Transactions`}</span>
              {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
