import React, { useState } from "react";
import { X, Lock, Mail, User, DollarSign, Sparkles, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { loginUser, registerUser, demoLogin } from "../services/api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("6500");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      let data;
      if (mode === "login") {
        data = await loginUser(email, password);
      } else {
        data = await registerUser({
          name,
          email,
          password,
          monthly_income: parseFloat(monthlyIncome) || 6500.0,
          currency: "$",
        });
      }
      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const data = await demoLogin();
      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand & Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25 mb-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {mode === "login" ? "Welcome back to FinPilot MAX" : "Create Your FinPilot Account"}
          </h3>
          <p className="text-xs text-slate-400">
            {mode === "login"
              ? "Access your autonomous AI financial advisor and analytics"
              : "Start making intelligent, data-driven financial decisions today"}
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>⚡ Instant Demo Access</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Explore with 3 months of preloaded realistic bank data
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 transition shadow-md shadow-indigo-600/30 flex items-center gap-1"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Demo Sign In"}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider">
            or continue with email
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === "login" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === "register" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Bell"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Monthly Income ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="6500"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{mode === "login" ? "Sign In to Dashboard" : "Create Account & Launch"}</span>
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400">
          By signing in, your data is processed with 256-bit AES encryption & local privacy isolation.
        </p>
      </div>
    </div>
  );
}
