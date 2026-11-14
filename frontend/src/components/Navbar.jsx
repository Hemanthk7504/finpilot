import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Shield,
  FileText,
  Bot,
  Home,
  LogOut,
  ChevronDown,
  UploadCloud,
  LayoutDashboard,
  TrendingUp,
  Target,
  LineChart,
  ListOrdered,
  DollarSign,
  Edit3,
  CheckCircle2,
  Sun,
  Moon,
  Globe2,
  Cpu
} from "lucide-react";

export default function Navbar({
  overview,
  currentUser,
  activeTab,
  onSelectTab,
  onNavigateHome,
  onOpenChat,
  onOpenReport,
  onOpenUpload,
  onOpenSalaryModal,
  onOpenCurrencyModal,
  currentCurrency,
  theme,
  onToggleTheme,
  onOpenAuth,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const healthScore = overview?.health_score ?? 81.2;
  const healthGrade = overview?.health_grade ?? "A";
  const monthlySalary = currentUser?.monthly_income ?? overview?.monthly_income ?? 0;
  const currencySymbol = currentCurrency?.symbol || "$";
  const currencyCode = currentCurrency?.code || "USD";

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    if (score >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "forecast", label: "Forecast & Bills", icon: TrendingUp },
    { id: "health-score", label: "Health Score", icon: Shield },
    { id: "budgets-goals", label: "Budgets & Goals", icon: Target },
    { id: "investments", label: "Investments", icon: LineChart },
    { id: "simulators", label: "Simulators & Tools", icon: Cpu },
    { id: "ledger", label: "Transactions", icon: ListOrdered },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
      {/* TIER 1: BRAND IDENTITY, QUICK METRICS & UTILITY ACTIONS (FULL WIDTH) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 border-b border-slate-800/50">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Live Mode Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
              title="Return to Home Landing Page"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition">
                  FinPilot
                </span>
                <span className="rounded bg-gradient-to-r from-indigo-500 to-cyan-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                  MAX
                </span>
              </div>
            </button>

            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 whitespace-nowrap shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Finance OS</span>
            </div>
          </div>

          {/* Right: Currency, Theme Toggle, Salary Pill, Actions & User Account */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
            {/* Global Currency Switcher Pill */}
            <button
              type="button"
              onClick={onOpenCurrencyModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition shrink-0 whitespace-nowrap"
              title="Change Workspace Currency & Live FX Rates"
            >
              <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-numeric font-bold">{currencySymbol}</span>
              <span className="text-[10px] text-slate-400">{currencyCode}</span>
            </button>

            {/* Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition shrink-0"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle Color Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Monthly Salary Setup Pill */}
            {currentUser && (
              <button
                type="button"
                onClick={onOpenSalaryModal}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/50 shrink-0 whitespace-nowrap"
                title="Click to view or edit your monthly take-home salary"
              >
                <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden md:inline">Salary:</span>
                <strong className="text-white font-numeric font-bold">
                  {monthlySalary > 0 ? `${currencySymbol}${monthlySalary.toLocaleString()}/mo` : "Set Salary"}
                </strong>
                <Edit3 className="h-3 w-3 text-indigo-400 ml-0.5" />
              </button>
            )}

            {/* Health Score Pill (Large Displays) */}
            {overview?.health_score && (
              <button
                onClick={() => onSelectTab("health-score")}
                className={`hidden xl:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition hover:scale-105 shrink-0 whitespace-nowrap ${getScoreColor(
                  healthScore
                )}`}
                title="Financial Health Score"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Score: <strong className="font-bold">{healthScore.toFixed(0)}</strong> ({healthGrade})</span>
              </button>
            )}

            {/* Import Statement Primary Action */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-indigo-600/25 transition hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
              title="Import Bank Statement (CSV or PDF)"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Import Statement</span>
            </button>

            {/* Executive Report Button */}
            <button
              onClick={onOpenReport}
              className="hidden 2xl:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition shrink-0 whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>Executive Report</span>
            </button>

            {/* AI Co-Pilot Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-3 py-1.5 text-xs font-bold transition hover:scale-105 shrink-0 whitespace-nowrap"
            >
              <Bot className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>

            {/* User Profile Menu */}
            {currentUser ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 pl-1.5 pr-2.5 py-1 text-xs text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-xs font-bold text-white uppercase shadow-sm">
                    {currentUser.name ? currentUser.name[0] : "U"}
                  </div>
                  <span className="font-semibold max-w-[110px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                    <div className="border-b border-slate-800 px-3 py-2.5">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Verified Account</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSalaryModal();
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Monthly Salary</span>
                      </span>
                      <strong className="text-indigo-400 font-numeric">
                        {monthlySalary > 0 ? `${currencySymbol}${monthlySalary.toLocaleString()}` : "Not Set"}
                      </strong>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenCurrencyModal();
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <span className="flex items-center gap-2">
                        <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Currency / FX</span>
                      </span>
                      <strong className="text-cyan-400 font-numeric">
                        {currencyCode} ({currencySymbol})
                      </strong>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateHome();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <Home className="h-3.5 w-3.5 text-slate-400" />
                      <span>Home Landing Page</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenAuth}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 transition shadow-sm"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: PRIMARY NAVIGATION TABS (FULL-WIDTH, PUNCHY LABELS, ZERO WRAPPING) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 bg-slate-950/70">
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
