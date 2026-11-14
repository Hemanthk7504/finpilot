import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  UploadCloud,
  Layers,
  ArrowRight,
  CheckCircle2,
  PieChart,
  Lock,
  Cpu,
  BarChart3,
  Calculator,
  ChevronRight
} from "lucide-react";

export default function HomePage({ onLaunchApp, onOpenAuth, currentUser, onDemoLogin }) {
  const [sipAmount, setSipAmount] = useState(500);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(10);

  // Quick compound interest math for interactive hero widget
  const monthlyRate = sipRate / 100 / 12;
  const totalMonths = sipYears * 12;
  const investedAmount = sipAmount * totalMonths;
  const futureValue =
    sipAmount *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const features = [
    {
      icon: UploadCloud,
      title: "Bank Statement Ingestion",
      desc: "Instant parsing of CSV and PDF bank statements with automated merchant cleaning and zero manual typing.",
      badge: "CSV & PDF Ready",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Cpu,
      title: "Machine Learning Categorization",
      desc: "Combines domain rules with TF-IDF and calibrated classifiers to map spend into 12 standardized life categories.",
      badge: "ML Powered",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: AlertTriangle,
      title: "Isolation Forest Anomaly Radar",
      desc: "Detects hidden duplicates, price spikes, and suspicious charges within 48-hour windows before fees accumulate.",
      badge: "Fraud Detection",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "5-Pillar Financial Health Score",
      desc: "Transparent 0–100 wellness index evaluating Savings, Budget Adherence, Runway, Debt, and Discretionary Volatility.",
      badge: "Interpretable FHS",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: TrendingUp,
      title: "30-Day Predictive Cash Flow",
      desc: "Time-series daily trajectory with upper/lower confidence bounds and automated recurring subscription renewal radar.",
      badge: "Predictive Analytics",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Bot,
      title: "Context-Aware AI Co-Pilot",
      desc: "Conversational assistant trained on your personal financial data to answer queries, assess affordability, and guide choices.",
      badge: "LLM Co-Pilot",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[#0B0F19] text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 blur-[130px] animate-pulse-glow"></div>
      <div className="pointer-events-none absolute top-[900px] right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[110px]"></div>

      {/* Hero Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">FinPilot</span>
              <span className="rounded bg-gradient-to-r from-indigo-500 to-cyan-500 px-1.5 py-0.2 text-[10px] font-extrabold uppercase text-white">
                MAX
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Signed in as <strong className="text-white">{currentUser.name}</strong>
                </span>
                <button
                  onClick={onLaunchApp}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onDemoLogin}
                  className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-xs px-3.5 py-2 transition flex items-center gap-1"
                >
                  <span>⚡ Quick Demo</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 transition shadow-md shadow-indigo-600/30"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28 text-center space-y-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm animate-float">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>FinPilot MAX 2.0 • Autonomous Personal Finance Advisor</span>
        </div>

        {/* Main Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Master Your Finances with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
              Autonomous AI Intelligence
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FinPilot MAX analyzes your bank statements, predicts cash flows, detects anomalous charges, tracks custom budgets, and delivers personalized guidance through a conversational financial co-pilot.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onDemoLogin}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-600 px-5 py-3.5 text-sm font-semibold text-slate-200 transition"
          >
            <span>⚡ Explore Live Demo Data</span>
          </button>
        </div>

        {/* Floating Metrics Highlights */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>99.4% Auto-Categorization Precision</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>Isolation Forest Anomaly Radar</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
            <span>CFPB-Compliant Financial Health Score</span>
          </div>
        </div>

        {/* INTERACTIVE WEALTH SIMULATOR TEASER ON HOME PAGE */}
        <div className="pt-8 max-w-4xl mx-auto text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                  Interactive Simulator
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <Calculator className="h-5 w-5 text-indigo-400" />
                  See the Power of Systematic Wealth Compounding
                </h3>
              </div>
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 self-start sm:self-auto">
                Estimated Maturity: ${Math.round(futureValue).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Monthly Contribution</span>
                  <strong className="text-white">${sipAmount}/mo</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Horizon</span>
                  <strong className="text-white">{sipYears} Years</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Expected Growth</span>
                  <strong className="text-white">{sipRate}% p.a.</strong>
                </div>
                <input
                  type="range"
                  min="6"
                  max="16"
                  step="1"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <span>
                Total Out of Pocket: <strong className="text-white">${investedAmount.toLocaleString()}</strong> | 
                Compound Gain: <strong className="text-emerald-400">+${Math.round(futureValue - investedAmount).toLocaleString()}</strong>
              </span>
              <button
                onClick={onLaunchApp}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Simulate in Full Advisor</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE 6 FEATURES GRID */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Intelligent Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Total Financial Clarity
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to transform static bank statements into proactive, automated financial decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-xl p-3 border ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Seamless Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Statement to Actionable Strategy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mx-auto sm:mx-0">
              01
            </div>
            <h3 className="text-base font-bold text-white">Ingest Bank Statements</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop any CSV or PDF statement. FinPilot automatically cleans raw transaction lines, normalizes merchants, and reconciles balances.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm mx-auto sm:mx-0">
              02
            </div>
            <h3 className="text-base font-bold text-white">Autonomous Machine Auditing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Isolation Forest flags duplicate charges and high-variance spikes. The 5-pillar scoring engine computes your Financial Health Score.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm mx-auto sm:mx-0">
              03
            </div>
            <h3 className="text-base font-bold text-white">Proactive Conversational Advice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask FinPilot Co-Pilot whether you can afford an upcoming vacation, simulate 5-year compounding wealth, and follow concrete level-up steps.
            </p>
          </div>
        </div>
      </section>

      {/* SECURITY & PRIVACY PROMISE */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-indigo-950/40 p-8 sm:p-12 text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Bank-Grade Privacy & Security</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your financial records are strictly isolated and encrypted with 256-bit AES standards. We never monetize, aggregate, or sell your private personal financial activities.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onLaunchApp}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Launch Dashboard Experience</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <p>FinPilot MAX • AI-Powered Intelligent Personal Finance Advisor • Built with FastAPI, Scikit-Learn & React</p>
      </footer>
    </div>
  );
}
