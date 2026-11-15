import React, { useState } from "react";
import { X, Sparkles, Check, ArrowRight, Loader2, PieChart, ShieldCheck } from "lucide-react";
import { updateUserSalary } from "../services/api";
import { formatINR } from "../utils/currency";

export default function SalaryModal({ isOpen, onClose, currentUser, onSalaryUpdated }) {
  const [salary, setSalary] = useState(
    currentUser?.monthly_income && currentUser.monthly_income > 0
      ? currentUser.monthly_income
      : 75000
  );
  const [currency, setCurrency] = useState("₹");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const numSalary = parseFloat(salary) || 0;
  const needs50 = Math.round(numSalary * 0.5);
  const wants30 = Math.round(numSalary * 0.3);
  const savings20 = Math.round(numSalary * 0.2);

  const presets = [35000, 50000, 75000, 100000, 150000, 250000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numSalary <= 0) {
      setErrorMsg("Please enter a valid monthly net income greater than 0.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    try {
      const updatedUser = await updateUserSalary(numSalary, "₹");
      if (onSalaryUpdated) onSalaryUpdated(updatedUser);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update monthly income.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800/90 bg-slate-900/95 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 shadow-lg shadow-indigo-500/25 mb-1">
            <span className="text-2xl font-black text-white">₹</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Set Up Your Monthly Take-Home Salary
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your monthly net income calibrates your personalized 50/30/20 budget envelopes, savings rate benchmarks, and cash flow projections in Indian Rupees (₹).
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Salary Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Monthly Net Take-Home Salary (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold font-numeric text-indigo-400">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="75000"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 pl-11 pr-20 py-3.5 text-xl font-extrabold font-numeric text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <span className="absolute right-4 text-xs font-medium text-slate-400">
                / month
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Income Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSalary(preset)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold font-numeric transition ${
                    numSalary === preset
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {formatINR(preset, { decimals: 0 })}
                </button>
              ))}
            </div>
          </div>

          {/* 50/30/20 Instant Calibration Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-cyan-400" />
                <span>Calibrated 50/30/20 Envelopes</span>
              </span>
              <span className="text-[11px] text-slate-400">Monthly Targets</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5">
                <span className="text-[10px] text-blue-300 font-bold uppercase block">50% Needs</span>
                <span className="text-sm font-extrabold font-numeric text-white mt-0.5 block">
                  {formatINR(needs50, { decimals: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Rent, Bills, Food</span>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5">
                <span className="text-[10px] text-purple-300 font-bold uppercase block">30% Wants</span>
                <span className="text-sm font-extrabold font-numeric text-white mt-0.5 block">
                  {formatINR(wants30, { decimals: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Dining, Leisure</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <span className="text-[10px] text-emerald-300 font-bold uppercase block">20% Savings</span>
                <span className="text-sm font-extrabold font-numeric text-emerald-400 mt-0.5 block">
                  {formatINR(savings20, { decimals: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">SIP & Cushion</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 py-3.5 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Save Salary & Calibrate Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
