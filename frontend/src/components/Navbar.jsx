import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Shield,
  FileText,
  Bot,
  Home,
  LogOut,
  User,
  ChevronDown,
  UploadCloud,
  LayoutDashboard,
  TrendingUp,
  Target,
  LineChart,
  ListOrdered,
  Bell,
  CheckCircle2
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
  onOpenAuth,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const healthScore = overview?.health_score ?? 82;
  const grade = overview?.health_grade ?? "A";

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
    { id: "ledger", label: "Ledger", icon: ListOrdered },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Home Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            title="Return to Home Page"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/25 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition">
                FinPilot
              </span>
              <span className="rounded bg-gradient-to-r from-indigo-500 to-cyan-500 px-1.5 py-0.2 text-[10px] font-extrabold uppercase text-white shadow-sm">
                MAX
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-600/90 text-white shadow-sm shadow-indigo-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & User Account Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Score Pill */}
          {overview?.health_score && (
            <button
              onClick={() => onSelectTab("health-score")}
              className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:scale-105 ${getScoreColor(
                healthScore
              )}`}
              title="View Financial Health Score Details"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Score: <strong>{healthScore}</strong> ({grade})</span>
            </button>
          )}

          {/* Upload Statement Action */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-3 py-1.5 text-xs font-semibold transition hover:border-indigo-500/60"
            title="Import Bank Statement (CSV or PDF)"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import Statement</span>
          </button>

          {/* Executive Report Button */}
          <button
            onClick={onOpenReport}
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>Executive Report</span>
          </button>

          {/* AI Co-Pilot Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">AI Co-Pilot</span>
          </button>

          {/* User Profile Menu */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 pl-1.5 pr-2.5 py-1 text-xs text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 text-[11px] font-bold text-white uppercase">
                  {currentUser.name ? currentUser.name[0] : "U"}
                </div>
                <span className="font-semibold max-w-[110px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                  <div className="border-b border-slate-800 px-3 py-2.5">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified Personal Account</span>
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[11px] text-slate-400">
                    <span className="text-slate-500">Monthly Net Income:</span>{" "}
                    <strong className="text-slate-200">
                      ${currentUser.monthly_income?.toLocaleString() || "6,500"}
                    </strong>
                  </div>

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
            <div className="flex items-center gap-2">
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
    </header>
  );
}
