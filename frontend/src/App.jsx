import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import AuthModal from "./components/AuthModal";
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
  getStoredUser,
  getCurrentUser,
  logoutUser,
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
  ArrowRight,
  Calendar,
  Sparkles
} from "lucide-react";

export default function App() {
  // Main View: 'home' (Landing Page) vs 'dashboard' (Finance Advisor Portal)
  const [currentView, setCurrentView] = useState("home");
  const [activeDashboardTab, setActiveDashboardTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Financial Data
  const [overview, setOverview] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [healthScoreData, setHealthScoreData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Transition helper (Modern View Transitions API)
  const navigateView = (newView) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentView(newView);
      });
    } else {
      setCurrentView(newView);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    // Check if user session exists
    getCurrentUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {});
    loadAllData();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadAllData();
    navigateView("dashboard");
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigateView("home");
  };

  const openAuthWithMode = (mode = "login") => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* VIEW 1: SEPARATE HOME / LANDING PAGE */}
      {currentView === "home" && (
        <HomePage
          onLaunchApp={() => navigateView("dashboard")}
          onOpenAuth={openAuthWithMode}
          currentUser={currentUser}
        />
      )}

      {/* VIEW 2: FULL-FEATURED DASHBOARD */}
      {currentView === "dashboard" && (
        <>
          {/* Top Navbar */}
          <Navbar
            overview={overview}
            currentUser={currentUser}
            activeTab={activeDashboardTab}
            onSelectTab={(tabId) => setActiveDashboardTab(tabId)}
            onNavigateHome={() => navigateView("home")}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenAuth={() => openAuthWithMode("login")}
            onLogout={handleLogout}
          />

          {/* Main Dashboard Workspace */}
          <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
            {/* Secondary Mobile Tabs Bar */}
            <div className="lg:hidden border-b border-slate-800/80 pb-3 flex items-center overflow-x-auto no-scrollbar gap-1.5">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeDashboardTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDashboardTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Global KPIs (always visible for financial clarity) */}
            <KPIOverview overview={overview} anomaliesCount={anomalies.length} />

            {/* Real-time statement import onboarding when account has no statements yet */}
            {transactions.length === 0 && (
              <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-cyan-950/40 p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Real-Time Statement Ingestion</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Welcome to your FinPilot Workspace{currentUser?.name ? `, ${currentUser.name}` : ""}!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Import your real bank statement (CSV or PDF extract) to start real-time ML categorization, 30-day cash flow forecasting, and 5-pillar financial health scoring.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Import Bank Statement</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: OVERVIEW DASHBOARD (Executive Bento Grid) */}
            {activeDashboardTab === "dashboard" && (
              <div className="space-y-6">
                {/* Bento Grid: 2 Columns on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (8 / 12): Spending Charts & Recent Transactions */}
                  <div className="lg:col-span-8 space-y-6">
                    <SpendingCharts categoryData={categoryData} />

                    {/* Quick Ledger Snapshot */}
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <ListOrdered className="h-4 w-4 text-indigo-400" />
                            <span>Recent Ledger Activity</span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Latest classified income and expense transactions.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveDashboardTab("ledger")}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                        >
                          <span>Full Ledger</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <TransactionTable transactions={transactions.slice(0, 8)} />
                    </div>
                  </div>

                  {/* Right Column (4 / 12): Anomaly Guard, Upcoming Bills, Quick Actions */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Anomaly & Fraud Radar */}
                    <AnomalyAlerts anomalies={anomalies} />

                    {/* Upcoming Recurring Bills & Subscriptions */}
                    {forecastData?.detected_recurring && forecastData.detected_recurring.length > 0 && (
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span>Upcoming Subscriptions</span>
                          </h3>
                          <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                            {forecastData.detected_recurring.length} Detected
                          </span>
                        </div>

                        <div className="space-y-2">
                          {forecastData.detected_recurring.slice(0, 4).map((sub, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-bold text-white truncate max-w-[140px]">
                                  {sub.merchant}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  Every {sub.frequency_days} days
                                </span>
                              </div>
                              <span className="font-bold font-numeric text-rose-400">
                                -${sub.estimated_amount?.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setActiveDashboardTab("forecast")}
                          className="w-full text-center text-xs font-semibold text-purple-400 hover:text-purple-300 py-1 transition flex items-center justify-center gap-1"
                        >
                          <span>View 30-Day Cash Forecast</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Quick Import Statement Callout */}
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/80 p-5 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Import Statement</h4>
                          <p className="text-[11px] text-slate-400">Add new CSV or PDF bank statement</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Upload Statement</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PREDICTIVE FORECAST */}
            {activeDashboardTab === "forecast" && (
              <div className="space-y-6">
                <ForecastView forecastData={forecastData} />
                <AnomalyAlerts anomalies={anomalies} />
              </div>
            )}

            {/* TAB 3: FINANCIAL HEALTH SCORE */}
            {activeDashboardTab === "health-score" && (
              <div className="space-y-6">
                <HealthScoreCard healthScoreData={healthScoreData} />
              </div>
            )}

            {/* TAB 4: BUDGETS & GOALS */}
            {activeDashboardTab === "budgets-goals" && (
              <div className="space-y-6">
                <BudgetGoals budgets={budgets} goals={goals} onRefresh={() => loadAllData()} />
              </div>
            )}

            {/* TAB 5: INVESTMENT GUIDANCE */}
            {activeDashboardTab === "investments" && (
              <div className="space-y-6">
                <InvestmentGuidance />
              </div>
            )}

            {/* TAB 6: TRANSACTION LEDGER */}
            {activeDashboardTab === "ledger" && (
              <div className="space-y-6">
                <TransactionTable transactions={transactions} />
              </div>
            )}
          </main>

          {/* Floating AI Co-Pilot Trigger Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition"
            >
              <Bot className="h-5 w-5" />
              <span>Ask FinPilot AI</span>
            </button>
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <p>FinPilot MAX • AI-Powered Intelligent Personal Finance Advisor • Built with FastAPI, Scikit-Learn & React</p>
          </footer>
        </>
      )}

      {/* Shared Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {isUploadModalOpen && (
        <StatementUploader
          isModal={true}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            loadAllData();
            setIsUploadModalOpen(false);
          }}
        />
      )}

      <AICoPilotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        overview={overview}
      />

      <ReportsModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
