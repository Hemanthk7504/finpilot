import React, { useState } from "react";
import { Bell, Plus, Check, Trash2, AlertTriangle, ShieldCheck, Tag } from "lucide-react";

export default function BudgetRuleBuilder({ budgets }) {
  const [rules, setRules] = useState([
    { id: 1, category: "Dining & Food Delivery", thresholdPct: 80, alertType: "warning", active: true },
    { id: 2, category: "Shopping & Electronics", thresholdPct: 90, alertType: "critical", active: true },
    { id: 3, category: "Groceries", thresholdPct: 95, alertType: "warning", active: true },
  ]);

  const [selectedCategory, setSelectedCategory] = useState("Entertainment & Subscriptions");
  const [threshold, setThreshold] = useState(85);

  const addRule = (e) => {
    e.preventDefault();
    const newRule = {
      id: Date.now(),
      category: selectedCategory,
      thresholdPct: threshold,
      alertType: threshold >= 90 ? "critical" : "warning",
      active: true,
    };
    setRules((prev) => [...prev, newRule]);
  };

  const removeRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRule = (id) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Smart Spending Threshold Rules &amp; Early Alerts</span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                {rules.filter((r) => r.active).length} Active Guards
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Set automated proactive alerts when category spending crosses customizable thresholds before month-end.
            </p>
          </div>
        </div>
      </div>

      {/* New Rule Creator Form */}
      <form onSubmit={addRule} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-slate-300">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="Dining & Food Delivery">Dining & Food Delivery</option>
            <option value="Shopping & Electronics">Shopping & Electronics</option>
            <option value="Entertainment & Subscriptions">Entertainment & Subscriptions</option>
            <option value="Groceries">Groceries</option>
            <option value="Transportation & Fuel">Transportation & Fuel</option>
            <option value="Travel & Vacation">Travel & Vacation</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Warning Trigger (%)</label>
          <input
            type="number"
            min="50"
            max="120"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        </div>
      </form>

      {/* Active Rules List */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-2xl border p-3.5 flex items-center justify-between text-xs transition ${
              rule.active
                ? "border-slate-800 bg-slate-950/60"
                : "border-slate-800/40 bg-slate-950/30 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleRule(rule.id)}
                className={`h-5 w-5 rounded-lg border flex items-center justify-center transition ${
                  rule.active
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-slate-700 bg-slate-900 text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </button>
              <div>
                <p className="font-bold text-white">{rule.category}</p>
                <span className="text-[10px] text-slate-400">
                  Notify when spending reaches {rule.thresholdPct}% of monthly envelope
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                rule.thresholdPct >= 90
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {rule.thresholdPct}% Limit
              </span>

              <button
                onClick={() => removeRule(rule.id)}
                className="text-slate-500 hover:text-rose-400 transition p-1"
                title="Remove Rule"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
