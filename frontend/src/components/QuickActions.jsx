import React from "react";
import { Zap, PlusCircle, Target, Trophy, Calendar, Calculator, Bot } from "lucide-react";

export default function QuickActions({
  onAddTransaction,
  onSetBudget,
  onCreateGoal,
  onBillReminder,
  onRunSimulator,
  onOpenAICoPilot,
  theme
}) {
  const actions = [
    {
      id: "add-txn",
      label: "Add Transaction",
      icon: PlusCircle,
      onClick: onAddTransaction,
      color: "text-blue-400 hover:border-blue-500/50 hover:bg-blue-950/20",
      iconColor: "text-blue-400",
    },
    {
      id: "set-budget",
      label: "Set Budget",
      icon: Target,
      onClick: onSetBudget,
      color: "text-purple-400 hover:border-purple-500/50 hover:bg-purple-950/20",
      iconColor: "text-purple-400",
    },
    {
      id: "create-goal",
      label: "Create Goal",
      icon: Trophy,
      onClick: onCreateGoal,
      color: "text-amber-400 hover:border-amber-500/50 hover:bg-amber-950/20",
      iconColor: "text-amber-400",
    },
    {
      id: "bill-reminder",
      label: "Bill Reminder",
      icon: Calendar,
      onClick: onBillReminder,
      color: "text-teal-400 hover:border-teal-500/50 hover:bg-teal-950/20",
      iconColor: "text-teal-400",
    },
    {
      id: "run-simulator",
      label: "Run Simulator",
      icon: Calculator,
      onClick: onRunSimulator,
      color: "text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-950/20",
      iconColor: "text-indigo-400",
    },
    {
      id: "ai-copilot",
      label: "AI Co-Pilot",
      icon: Bot,
      onClick: onOpenAICoPilot,
      color: "text-violet-400 hover:border-violet-500/50 hover:bg-violet-950/20",
      iconColor: "text-violet-400",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">Quick Actions</h3>
      </div>

      {/* 6 Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-md backdrop-blur-md transition-all duration-200 group hover:-translate-y-1 hover:shadow-lg ${act.color}`}
            >
              <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${act.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white text-center">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
