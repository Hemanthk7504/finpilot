import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { fetchEmergencyRunway } from "../services/api";

export default function EmergencyRunwayCard({ overview }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyRunway()
      .then((res) => setData(res))
      .catch(() => {
        setData({
          liquid_cash: 5420,
          monthly_essential_burn: 2850,
          runway_months: 1.9,
          status: "Moderate Buffer",
          badge_color: "amber",
          target_3m: 8550,
          target_6m: 17100,
          gap_to_3m: 3130,
          gap_to_6m: 11680,
        });
      })
      .finally(() => setIsLoading(false));
  }, [overview]);

  if (!data) return null;

  const runway = data.runway_months;
  const isHealthy = runway >= 3.0;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            isHealthy ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
          }`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Emergency Cash Runway</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isHealthy ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {data.status}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Survival cushion covering essential needs if all income stopped today.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Runway</span>
          <p className={`text-2xl font-black font-numeric ${isHealthy ? "text-emerald-400" : "text-amber-400"}`}>
            {runway} <span className="text-xs font-bold text-slate-400">Months</span>
          </p>
        </div>
      </div>

      {/* Visual Runway Progress Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>0 mo (Critical)</span>
          <span className="text-indigo-400 font-semibold">3 mo (CFPB Safe)</span>
          <span className="text-emerald-400 font-semibold">6 mo (Fortified)</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 ${
              runway >= 6 ? "bg-emerald-500" : runway >= 3 ? "bg-indigo-500" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(5, (runway / 6) * 100))}%` }}
          ></div>
          {/* 3-month marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600"></div>
        </div>
      </div>

      {/* Runway Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Essential Burn Rate</span>
          <p className="text-sm font-bold text-white font-numeric">${data.monthly_essential_burn.toLocaleString()}/mo</p>
          <span className="text-[10px] text-slate-500">Rent, Food, Utilities, Debt</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">3-Month Target</span>
          <p className="text-sm font-bold text-indigo-400 font-numeric">${data.target_3m.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">
            {data.gap_to_3m > 0 ? `Gap: $${data.gap_to_3m.toLocaleString()}` : "Fully Achieved ✓"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">6-Month Fortress Target</span>
          <p className="text-sm font-bold text-emerald-400 font-numeric">${data.target_6m.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">
            {data.gap_to_6m > 0 ? `Gap: $${data.gap_to_6m.toLocaleString()}` : "Fully Achieved ✓"}
          </span>
        </div>
      </div>
    </div>
  );
}
