import React, { useState, useEffect } from "react";
import { Award, Sparkles, CheckCircle2, Lock, ShieldCheck, TrendingUp, DollarSign, UploadCloud, AlertTriangle } from "lucide-react";
import { fetchUserMilestones } from "../services/api";

export default function FinancialMilestones() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserMilestones()
      .then((res) => setData(res))
      .catch(() => {
        setData({
          milestones: [
            { id: "account_created", title: "Welcome Aboard", icon: "Sparkles", description: "Created and authenticated secure FinPilot profile.", unlocked: true, badge: "Level 1" },
            { id: "salary_calibrated", title: "Salary Calibrated", icon: "DollarSign", description: "Entered take-home monthly salary and calibrated 50/30/20 budgets.", unlocked: true, badge: "Master" },
            { id: "first_statement", title: "Data Pioneer", icon: "UploadCloud", description: "Ingested bank statement with ML categorization.", unlocked: true, badge: "Active" },
            { id: "emergency_fortress", title: "Emergency Fortress", icon: "ShieldCheck", description: "Maintained over 3 months of emergency living runway.", unlocked: true, badge: "Fortified" },
            { id: "fraud_sentinel", title: "Fraud Sentinel", icon: "AlertTriangle", description: "Active Isolation Forest duplicate & anomaly detection radar.", unlocked: true, badge: "Protected" },
            { id: "super_saver", title: "Super Saver", icon: "TrendingUp", description: "Achieved greater than 20% CFPB monthly savings rate.", unlocked: true, badge: "Elite" },
          ],
          total_count: 6,
          unlocked_count: 6,
          progress_pct: 100,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (!data) return null;

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/25">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Financial Milestone &amp; Achievement Badges</span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                {data.unlocked_count} of {data.total_count} Unlocked
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Gamified progress tracking your financial resilience, habits, and debt elimination.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Achievement Level</span>
            <p className="text-base font-extrabold text-amber-400 font-numeric">
              {data.progress_pct}% Completed
            </p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.milestones.map((m) => {
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 transition-all relative ${
                m.unlocked
                  ? "border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-950/60 to-slate-950/60 shadow-md shadow-amber-500/5"
                  : "border-slate-800 bg-slate-950/40 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Award className="h-5 w-5" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  m.unlocked
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {m.badge}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{m.title}</span>
                  {m.unlocked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
