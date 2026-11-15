import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Sun,
  Moon,
  Bell,
  UploadCloud,
  ChevronDown,
  User,
  DollarSign,
  LogOut,
  FileText,
  ShieldCheck
} from "lucide-react";

export default function Header({
  currentUser,
  theme,
  onToggleTheme,
  onOpenUpload,
  onOpenSalaryModal,
  onOpenReport,
  onLogout,
  onSearchFocus,
  anomaliesCount = 0
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl + K or Cmd + K focuses search bar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const userName = currentUser?.name || currentUser?.full_name || "abdulla";
  const userInitial = (userName[0] || "A").toUpperCase();

  return (
    <header
      className={`sticky top-0 z-20 h-16 w-full flex items-center justify-between px-6 border-b transition-colors duration-200 ${
        theme === "light"
          ? "bg-[#FFFFFF]/90 border-slate-200/80 backdrop-blur-md"
          : "bg-[#090D18]/90 border-slate-800/80 backdrop-blur-md"
      }`}
    >
      {/* Left: Global Search Input */}
      <div className="flex-1 max-w-xl">
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-150 ${
            theme === "light"
              ? "bg-slate-100/80 border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20"
              : "bg-slate-900/80 border-slate-800 focus-within:border-indigo-500 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500/20"
          }`}
        >
          <Search className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, insights, or tools..."
            className="w-full bg-transparent px-3 py-2 text-xs outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <div className="mr-2 flex items-center gap-1 rounded bg-slate-800/20 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 select-none">
            <span>Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Import Button, User Chip */}
      <div className="flex items-center gap-3 ml-4" ref={dropdownRef}>
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className={`p-2 rounded-xl border transition flex items-center justify-center ${
            theme === "light"
              ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
          }`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className={`relative p-2 rounded-xl border transition ${
              theme === "light"
                ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
                : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
            }`}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          {showNotificationDropdown && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-2xl border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                theme === "light"
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-slate-900 border-slate-800 text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                <span className="text-xs font-bold">Notifications</span>
                <span className="rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5">
                  Live
                </span>
              </div>
              <div className="py-2.5 space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-800/40 transition">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[11px]">System Online & Resilient</p>
                    <p className="text-[10px] text-slate-400">
                      ML Categorization & Anomaly Detection models active.
                    </p>
                  </div>
                </div>
                {anomaliesCount > 0 && (
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                    <div>
                      <p className="font-bold text-[11px]">{anomaliesCount} Anomalies Flagged</p>
                      <p className="text-[10px] text-rose-400">Check Transactions for duplicate or spike charges.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Purple "↑ Import Statement" Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-purple-600/30 transition hover:scale-105 active:scale-95"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Import Statement</span>
        </button>

        {/* User Profile Chip */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full border transition hover:ring-2 hover:ring-indigo-500/30 ${
              theme === "light"
                ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800"
                : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200"
            }`}
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              {userInitial}
            </div>
            <span className="text-xs font-semibold">{userName}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                theme === "light"
                  ? "bg-white border-slate-200 text-slate-800"
                  : "bg-slate-900 border-slate-800 text-slate-200"
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-700/40">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email || "user@finpilot.io"}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenSalaryModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Update Monthly Salary</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenReport();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                  <span>Export Financial Report</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-700/40">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-rose-500/10 text-rose-400 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
