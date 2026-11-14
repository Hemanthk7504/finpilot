import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import KPIOverview from "./components/KPIOverview";
import StatementUploader from "./components/StatementUploader";
import SpendingCharts from "./components/SpendingCharts";
import ForecastView from "./components/ForecastView";
import HealthScoreCard from "./components/HealthScoreCard";
import AnomalyAlerts from "./components/AnomalyAlerts";
import BudgetGoals from "./components/BudgetGoals";
import InvestmentGuidance from "./components/InvestmentGuidance";
import TransactionTable from "./components/TransactionTable";
import AICoPilotDrawer from "./components/AICoPilotDrawer";
import ReportsModal from "./components/ReportsModal";

import {
  fetchOverview,
  fetchCategoryBreakdown,
  fetchForecast,
  fetchAnomalies,
  fetchHealthScore,
  fetchBudgets,
  fetchGoals,
  fetchTransactions,
  resetDemoData,
} from "./services/api";

import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Target,
  LineChart,
  ListOrdered,
  Bot,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [healthScoreData, setHealthScoreData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ov, cat, fc, ano, hs, bg, gl, tx] = await Promise.all([
        fetchOverview().catch(() => null),
        fetchCategoryBreakdown().catch(() => null),
        fetchForecast().catch(() => null),
        fetchAnomalies().catch(() => []),
        fetchHealthScore().catch(() => null),
        fetchBudgets().catch(() => []),
        fetchGoals().catch(() => []),
        fetchTransactions({ limit: 150 }).catch(() => []),
      ]);

      setOverview(ov);
      setCategoryData(cat);
      setForecastData(fc);
      setAnomalies(ano || []);
      setHealthScoreData(hs);
      setBudgets(bg || []);
      setGoals(gl || []);
      setTransactions(tx || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      await loadAllData();
    } catch (err) {
      alert("Failed to reset demo: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "forecast", label: "Predictive Forecast", icon: TrendingUp },
    { id: "health-score", label: "Health Score", icon: ShieldCheck },
    { id: "budgets-goals", label: "Budgets & Goals", icon: Target },
    { id: "investments", label: "Investment Guidance", icon: LineChart },
    { id: "ledger", label: "Transactions", icon: ListOrdered },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        overview={overview}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === "health-score" && overview?.health_score && (
                    <span className="ml-1 rounded bg-indigo-900/60 text-indigo-300 text-[10px] px-1.5 py-0.2">
                      {overview.health_score}
                    </span>
                  )}
                  {tab.id === "forecast" && anomalies.length > 0 && (
                    <span className="ml-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.2 border border-amber-500/30">
                      {anomalies.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global KPIs (always visible for financial clarity) */}
        <KPIOverview overview={overview} anomaliesCount={anomalies.length} />

        {/* TAB CONTENTS */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Statement Uploader Card */}
            <StatementUploader onUploadSuccess={() => loadAllData()} />

            {/* Spending Breakdown & 50/30/20 Rule */}
            <SpendingCharts categoryData={categoryData} />

            {/* Quick Anomaly Radar if any */}
            {anomalies.length > 0 && (
              <AnomalyAlerts anomalies={anomalies} />
            )}

            {/* Recent Transactions Preview */}
            <TransactionTable transactions={transactions.slice(0, 15)} />
          </div>
        )}

        {activeTab === "forecast" && (
          <div className="space-y-6">
            <ForecastView forecastData={forecastData} />
            <AnomalyAlerts anomalies={anomalies} />
          </div>
        )}

        {activeTab === "health-score" && (
          <div className="space-y-6">
            <HealthScoreCard healthScoreData={healthScoreData} />
          </div>
        )}

        {activeTab === "budgets-goals" && (
          <div className="space-y-6">
            <BudgetGoals budgets={budgets} goals={goals} onRefresh={() => loadAllData()} />
          </div>
        )}

        {activeTab === "investments" && (
          <div className="space-y-6">
            <InvestmentGuidance />
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="space-y-6">
            <TransactionTable transactions={transactions} />
          </div>
        )}
      </main>

      {/* Floating AI Co-Pilot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition"
        >
          <Bot className="h-5 w-5" />
          <span>Ask FinPilot AI</span>
        </button>
      </div>

      {/* Modals & Slide-out Drawers */}
      <AICoPilotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        overview={overview}
      />

      <ReportsModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>FinPilot MAX • AI-Powered Intelligent Personal Finance Advisor • Built with FastAPI, Scikit-Learn & React</p>
      </footer>
    </div>
  );
}
