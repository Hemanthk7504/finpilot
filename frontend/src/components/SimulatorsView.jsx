import React, { useState } from "react";
import {
  Flame,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  PieChart,
  Repeat,
  Sliders,
  Bell,
  Award,
  Landmark,
  Sparkles,
  ChevronRight
} from "lucide-react";

import FIRECalculator from "./FIRECalculator";
import DebtPayoffPlanner from "./DebtPayoffPlanner";
import EmergencyRunwayCard from "./EmergencyRunwayCard";
import AffordabilitySimulator from "./AffordabilitySimulator";
import TaxEstimator from "./TaxEstimator";
import SubscriptionAudit from "./SubscriptionAudit";
import BudgetRebalancer from "./BudgetRebalancer";
import BudgetRuleBuilder from "./BudgetRuleBuilder";
import FinancialMilestones from "./FinancialMilestones";
import NetWorthTracker from "./NetWorthTracker";

export default function SimulatorsView({ overview, currentUser, forecastData, budgets }) {
  const [activeSubTab, setActiveSubTab] = useState("fire");

  const tools = [
    { id: "fire", label: "FIRE Freedom Number", icon: Flame, color: "text-amber-400" },
    { id: "debt", label: "Debt Acceleration", icon: CreditCard, color: "text-rose-400" },
    { id: "runway", label: "Emergency Runway", icon: ShieldCheck, color: "text-emerald-400" },
    { id: "affordability", label: "Affordability Check", icon: ShoppingBag, color: "text-cyan-400" },
    { id: "tax", label: "Tax & 401(k) Shield", icon: PieChart, color: "text-teal-400" },
    { id: "subs", label: "Subscription Audit", icon: Repeat, color: "text-purple-400" },
    { id: "rebalance", label: "50/30/20 Rebalancer", icon: Sliders, color: "text-indigo-400" },
    { id: "rules", label: "Spending Rules", icon: Bell, color: "text-amber-400" },
    { id: "milestones", label: "Milestones & Badges", icon: Award, color: "text-yellow-400" },
    { id: "networth", label: "Net Worth Balance Sheet", icon: Landmark, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-cyan-950/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Advanced Financial Intelligence Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Financial Engines, Stress-Testers &amp; Simulators
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Run forward projections, test life shocks, accelerate debt elimination, and simulate early retirement runway.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Sub-Tool Navigation Strip */}
      <div className="border-b border-slate-800/80 pb-3 flex items-center overflow-x-auto no-scrollbar gap-2">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : t.color}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tool */}
      <div className="transition-all duration-300">
        {activeSubTab === "fire" && (
          <FIRECalculator overview={overview} currentUser={currentUser} />
        )}
        {activeSubTab === "debt" && (
          <DebtPayoffPlanner />
        )}
        {activeSubTab === "runway" && (
          <EmergencyRunwayCard overview={overview} />
        )}
        {activeSubTab === "affordability" && (
          <AffordabilitySimulator overview={overview} currentUser={currentUser} />
        )}
        {activeSubTab === "tax" && (
          <TaxEstimator overview={overview} currentUser={currentUser} />
        )}
        {activeSubTab === "subs" && (
          <SubscriptionAudit forecastData={forecastData} />
        )}
        {activeSubTab === "rebalance" && (
          <BudgetRebalancer overview={overview} currentUser={currentUser} />
        )}
        {activeSubTab === "rules" && (
          <BudgetRuleBuilder budgets={budgets} />
        )}
        {activeSubTab === "milestones" && (
          <FinancialMilestones />
        )}
        {activeSubTab === "networth" && (
          <NetWorthTracker overview={overview} />
        )}
      </div>
    </div>
  );
}
