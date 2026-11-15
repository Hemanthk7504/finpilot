import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import AuthModal from "./components/AuthModal";
import KPIOverview from "./components/KPIOverview";
import CashFlowTrendCard from "./components/CashFlowTrendCard";
import ExpenseBreakdownCard from "./components/ExpenseBreakdownCard";
import AIInsightsCard from "./components/AIInsightsCard";
import StatementBanner from "./components/StatementBanner";
import QuickActions from "./components/QuickActions";
import AddTransactionModal from "./components/AddTransactionModal";
import StatementUploader from "./components/StatementUploader";
import AICoPilotDrawer from "./components/AICoPilotDrawer";
import ReportsModal from "./components/ReportsModal";
import SalaryModal from "./components/SalaryModal";
import BudgetGoals from "./components/BudgetGoals";
import TransactionTable from "./components/TransactionTable";
import ForecastView from "./components/ForecastView";
import HealthScoreCard from "./components/HealthScoreCard";
import InvestmentGuidance from "./components/InvestmentGuidance";
import SimulatorsView from "./components/SimulatorsView";

import FIRECalculator from "./components/FIRECalculator";
import DebtPayoffPlanner from "./components/DebtPayoffPlanner";
import EmergencyRunwayCard from "./components/EmergencyRunwayCard";
import AffordabilitySimulator from "./components/AffordabilitySimulator";
import TaxEstimator from "./components/TaxEstimator";
import SubscriptionAudit from "./components/SubscriptionAudit";
import BudgetRebalancer from "./components/BudgetRebalancer";
import BudgetRuleBuilder from "./components/BudgetRuleBuilder";
import FinancialMilestones from "./components/FinancialMilestones";
import NetWorthTracker from "./components/NetWorthTracker";

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

import { Calendar, DollarSign, ArrowRight, Sparkles } from "lucide-react";

export default function App() {
  // Main View: 'home' (Landing Page) vs 'dashboard' (Finance Advisor Portal)
  const [currentView, setCurrentView] = useState("home");
  const [activeDashboardTab, setActiveDashboardTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Light / Dark Theme State (persisted & synced to <meta>)
  const [theme, setTheme] = useState(() => localStorage.getItem("finpilot_theme") || "dark");

  // Multi-Currency & Live FX (INR as standard default)
  const [currentCurrency, setCurrentCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    rate: 1.0,
  });

  // Modals & Panels
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
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

  // Theme Synchronizer
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("finpilot_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = nextTheme;
  };

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // View Transition helper
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
    getCurrentUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          loadAllData();
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadAllData();
    navigateView("dashboard");
    if (!user.monthly_income || user.monthly_income <= 0) {
      setTimeout(() => setIsSalaryModalOpen(true), 400);
    }
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

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-[#F8FAFC] text-slate-900" : "bg-[#070B14] text-slate-100"
      } font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200`}
    >
      {/* VIEW 1: HOME / LANDING PAGE */}
      {currentView === "home" && (
        <HomePage
          onLaunchApp={() => {
            if (currentUser) {
              navigateView("dashboard");
            } else {
              openAuthWithMode("login");
            }
          }}
          onOpenAuth={openAuthWithMode}
          currentUser={currentUser}
        />
      )}

      {/* VIEW 2: FULL-FEATURED ADVANCED DASHBOARD WITH SIDEBAR & HEADER */}
      {currentView === "dashboard" && (
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeDashboardTab}
            onSelectTab={(tabId) => setActiveDashboardTab(tabId)}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenSettings={() => setIsSalaryModalOpen(true)}
            onLogout={handleLogout}
            theme={theme}
          />

          {/* Main Scrollable Layout */}
          <div className="flex-1 flex flex-col pl-64 h-full overflow-y-auto">
            {/* Top Header Bar */}
            <Header
              currentUser={currentUser}
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
              onOpenReport={() => setIsReportOpen(true)}
              onLogout={handleLogout}
              anomaliesCount={anomalies.length}
            />

            {/* Main Content Workspace */}
            <main className="flex-1 p-6 lg:p-8 space-y-6">
              {/* Optional Prompt to Set Monthly Salary if not yet configured */}
              {currentUser && (!currentUser.monthly_income || currentUser.monthly_income <= 0) && (
                <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                      <span className="text-xl font-black">₹</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Add Your Monthly Net Salary (INR)</h4>
                      <p className="text-xs text-slate-300">
                        Calibrate personalized 50/30/20 budgets, savings targets, and health score benchmarks in Indian Rupees.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSalaryModalOpen(true)}
                    className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
                  >
                    <span>Add Salary Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: DASHBOARD (Matches Reference Screenshot) */}
              {activeDashboardTab === "dashboard" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Greeting & Date Range Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight flex items-center gap-2">
                        <span>👋 Welcome back, {currentUser?.name || currentUser?.full_name || "abdulla"}!</span>
                      </h1>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Here's your financial snapshot for the last 30 days.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-sm self-start sm:self-auto">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span>Oct 16, 2026 – Nov 15, 2026</span>
                    </div>
                  </div>

                  {/* 4 KPI Cards (Total Liquid Balance, 30-Day Net Cash Flow, Monthly Savings Rate, Health Score) */}
                  <KPIOverview overview={overview} />

                  {/* Middle Row (3 Cards: Cash Flow Trend, Expense Breakdown, AI Insights) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Area Chart: 6 of 12 columns */}
                    <div className="lg:col-span-6 flex flex-col">
                      <CashFlowTrendCard overview={overview} transactions={transactions} />
                    </div>

                    {/* Expense Breakdown Donut: 3.5 of 12 columns */}
                    <div className="lg:col-span-3 flex flex-col">
                      <ExpenseBreakdownCard categoryData={categoryData} />
                    </div>

                    {/* AI Insights Card: 2.5 of 12 columns */}
                    <div className="lg:col-span-3 flex flex-col">
                      <AIInsightsCard overview={overview} onOpenChat={() => setIsChatOpen(true)} />
                    </div>
                  </div>

                  {/* Bank Statement Banner */}
                  <StatementBanner onOpenUpload={() => setIsUploadModalOpen(true)} />

                  {/* Quick Actions Row */}
                  <QuickActions
                    onAddTransaction={() => setIsAddTxnOpen(true)}
                    onSetBudget={() => setActiveDashboardTab("budgets-goals")}
                    onCreateGoal={() => setActiveDashboardTab("budgets-goals")}
                    onBillReminder={() => setActiveDashboardTab("forecast")}
                    onRunSimulator={() => setActiveDashboardTab("simulators")}
                    onOpenAICoPilot={() => setIsChatOpen(true)}
                    theme={theme}
                  />
                </div>
              )}

              {/* TAB 2: TRANSACTIONS (Full Ledger) */}
              {activeDashboardTab === "ledger" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <TransactionTable
                    transactions={transactions}
                    onAddTransaction={() => setIsAddTxnOpen(true)}
                  />
                </div>
              )}

              {/* TAB 3: BUDGETS & GOALS */}
              {activeDashboardTab === "budgets-goals" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <BudgetGoals
                    budgets={budgets}
                    goals={goals}
                    onRefreshData={loadAllData}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BudgetRuleBuilder currentUser={currentUser} />
                    <BudgetRebalancer categoryData={categoryData} />
                  </div>
                </div>
              )}

              {/* TAB 4: FORECAST & BILLS */}
              {activeDashboardTab === "forecast" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <ForecastView forecastData={forecastData} />
                  <SubscriptionAudit recurringBills={forecastData?.detected_recurring || []} />
                </div>
              )}

              {/* TAB 5: HEALTH SCORE */}
              {activeDashboardTab === "health-score" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <HealthScoreCard healthScoreData={healthScoreData} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EmergencyRunwayCard overview={overview} />
                    <FinancialMilestones overview={overview} />
                  </div>
                </div>
              )}

              {/* TAB 6: INVESTMENTS */}
              {activeDashboardTab === "investments" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <InvestmentGuidance overview={overview} />
                  <TaxEstimator currentUser={currentUser} />
                </div>
              )}

              {/* TAB 7: SIMULATORS & TOOLS */}
              {activeDashboardTab === "simulators" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <SimulatorsView overview={overview} currentUser={currentUser} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FIRECalculator overview={overview} currentUser={currentUser} />
                    <AffordabilitySimulator overview={overview} currentUser={currentUser} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DebtPayoffPlanner />
                    <NetWorthTracker overview={overview} />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      {isAddTxnOpen && (
        <AddTransactionModal
          isOpen={isAddTxnOpen}
          onClose={() => setIsAddTxnOpen(false)}
          onSuccess={loadAllData}
        />
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <StatementUploader
            isModal={true}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={() => {
              loadAllData();
              setTimeout(() => setIsUploadModalOpen(false), 1200);
            }}
          />
        </div>
      )}

      {isSalaryModalOpen && (
        <SalaryModal
          isOpen={isSalaryModalOpen}
          onClose={() => setIsSalaryModalOpen(false)}
          currentUser={currentUser}
          onSalaryUpdated={(updated) => {
            setCurrentUser(updated);
            loadAllData();
          }}
        />
      )}

      {isReportOpen && (
        <ReportsModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          overview={overview}
        />
      )}

      {isChatOpen && (
        <AICoPilotDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          overview={overview}
          currentUser={currentUser}
          theme={theme}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authInitialMode}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
