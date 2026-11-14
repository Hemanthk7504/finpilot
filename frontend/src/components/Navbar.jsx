import React, { useState } from "react";
import { Sparkles, Shield, RefreshCw, FileText, Bot, Home, LogOut, User, ChevronDown } from "lucide-react";

export default function Navbar({
  overview,
  currentUser,
  onNavigateHome,
  onOpenChat,
  onOpenReport,
  onResetDemo,
  onOpenAuth,
  onLogout,
  isResetting
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const healthScore = overview?.health_score ?? 82;
  const grade = overview?.health_grade ?? "A";

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    if (score >= 40) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Home Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left focus:outline-none group"
            title="Return to Home Page"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition">
                  FinPilot
                </span>
                <span className="rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-1.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                  MAX
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">AI-Powered Intelligent Personal Finance Advisor</p>
            </div>
          </button>

          {/* Quick Home Pill */}
          <button
            onClick={onNavigateHome}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </button>
        </div>

        {/* Quick Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Score Pill */}
          <div className={`hidden lg:flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getScoreColor(healthScore)}`}>
            <Shield className="h-3.5 w-3.5" />
            <span>Health Score: <strong className="font-bold">{healthScore}/100</strong> ({grade})</span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset and reload realistic demo bank statement"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden xl:inline">{isResetting ? "Resetting..." : "Reload Demo"}</span>
          </button>

          {/* Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 transition"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Executive Report</span>
          </button>

          {/* AI Co-Pilot CTA */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-cyan-500 transition"
          >
            <Bot className="h-4 w-4" />
            <span>AI Co-Pilot</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 transition"
              >
                <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {currentUser.name?.[0] || "U"}
                </div>
                <span className="hidden md:inline truncate max-w-[100px]">{currentUser.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl text-xs space-y-1 z-50">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 text-slate-400">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 transition shadow"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
