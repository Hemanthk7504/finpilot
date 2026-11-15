import React, { useState } from "react";
import { Target, PiggyBank, Plus, Check, Edit2, AlertCircle, ArrowUpRight } from "lucide-react";
import { createOrUpdateBudget, createGoal, updateGoalDeposit } from "../services/api";
import { formatINR } from "../utils/currency";

export default function BudgetGoals({ budgets = [], goals = [], onRefreshData }) {
  const [activeTab, setActiveTab] = useState("budgets");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [newBudgetLimit, setNewBudgetLimit] = useState("");

  const handleSaveBudget = async (categoryName) => {
    if (!newBudgetLimit || isNaN(newBudgetLimit)) return;
    try {
      await createOrUpdateBudget(categoryName, parseFloat(newBudgetLimit));
      setEditingBudgetId(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;
    try {
      await createGoal({
        title: newGoalTitle,
        category: "Savings",
        target_amount: parseFloat(newGoalTarget),
        current_amount: parseFloat(newGoalCurrent || "0"),
        target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsAddingGoal(false);
      setNewGoalTitle("");
      setNewGoalTarget("");
      setNewGoalCurrent("");
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepositToGoal = async (goal) => {
    try {
      const updated = goal.current_amount + 5000;
      await updateGoalDeposit(goal.id, updated);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Budgets & Goal Jars</h3>
          <p className="text-xs text-slate-400">Manage monthly envelope limits and automated savings milestones in INR (₹)</p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
          <button
            onClick={() => setActiveTab("budgets")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              activeTab === "budgets" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Category Envelopes ({budgets.length})
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              activeTab === "goals" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Savings Jars ({goals.length})
          </button>
        </div>
      </div>

      {/* TAB 1: BUDGETS */}
      {activeTab === "budgets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const isEditing = editingBudgetId === b.id;
            const pct = b.spent_percentage;
            const isExceeded = pct >= 100;
            const isWarning = pct >= 80 && pct < 100;

            return (
              <div
                key={b.id}
                className={`rounded-xl border p-4 transition ${
                  isExceeded
                    ? "border-rose-500/40 bg-rose-500/5"
                    : isWarning
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{b.category_name}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Spent: <strong className="text-white">{formatINR(b.spent_amount)}</strong> of {formatINR(b.monthly_limit)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditingBudgetId(null);
                      } else {
                        setEditingBudgetId(b.id);
                        setNewBudgetLimit(b.monthly_limit.toString());
                      }
                    }}
                    className="text-slate-400 hover:text-white p-1"
                    title="Edit budget limit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isEditing ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-numeric"
                      placeholder="New limit"
                    />
                    <button
                      onClick={() => handleSaveBudget(b.category_name)}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500 shrink-0"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Meter */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExceeded ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className={isExceeded ? "text-rose-400 font-bold" : isWarning ? "text-amber-400 font-medium" : "text-slate-400"}>
                        {pct.toFixed(0)}% utilized
                      </span>
                      <span className="text-slate-400 font-numeric">
                        {b.monthly_limit > b.spent_amount
                          ? `${formatINR(b.monthly_limit - b.spent_amount, { decimals: 0 })} left`
                          : `${formatINR(b.spent_amount - b.monthly_limit, { decimals: 0 })} over limit`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GOALS */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isAddingGoal ? "Cancel" : "New Savings Jar"}</span>
            </button>
          </div>

          {/* New Goal Modal/Form */}
          {isAddingGoal && (
            <form onSubmit={handleCreateGoal} className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Create New Goal Jar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Goal Title (e.g. Home Downpayment)"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  required
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Target Amount (₹)"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  required
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-numeric"
                />
                <input
                  type="number"
                  placeholder="Current Savings (₹)"
                  value={newGoalCurrent}
                  onChange={(e) => setNewGoalCurrent(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-numeric"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-cyan-500"
                >
                  Create Goal Jar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = goal.progress_percentage;
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 p-5 transition hover:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                          <PiggyBank className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">{goal.title}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{goal.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-numeric">{pct.toFixed(0)}%</span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between text-xs">
                      <span className="font-bold text-white text-base font-numeric">{formatINR(goal.current_amount)}</span>
                      <span className="text-slate-400 font-numeric">Target: {formatINR(goal.target_amount)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Required: <strong className="text-slate-200 font-numeric">{formatINR(goal.monthly_required, { decimals: 0 })}/mo</strong>
                    </span>

                    <button
                      onClick={() => handleDepositToGoal(goal)}
                      className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                    >
                      + Deposit ₹5,000
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
