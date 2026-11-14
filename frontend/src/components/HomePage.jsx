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
  ChevronRight,
  Compass,
  Zap,
  DollarSign,
  ShieldAlert,
  Sliders,
  Check,
  X
} from "lucide-react";

export default function HomePage({ onLaunchApp, onOpenAuth, currentUser }) {
  const [sipAmount, setSipAmount] = useState(600);
  const [sipYears, setSipYears] = useState(10);
  const [sipRate, setSipRate] = useState(10);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // Compound interest calculation
  const monthlyRate = sipRate / 100 / 12;
  const totalMonths = sipYears * 12;
  const investedAmount = sipAmount * totalMonths;
  const futureValue =
    sipAmount *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const wealthGain = Math.max(0, futureValue - investedAmount);

  const featureTabs = [
    {
      id: "ingestion",
      title: "Bank Statement Engine",
      subtitle: "Universal CSV & PDF Parsing",
      icon: UploadCloud,
      color: "from-blue-500 to-indigo-600",
      description: "Drop statements from Chase, Bank of America, Wells Fargo, Citi, or custom CSV/PDF extracts. FinPilot strips merchant rail tags and isolates clean payee names in milliseconds.",
      metrics: [
        { label: "Parsing Latency", value: "< 250ms" },
        { label: "Normalization Rate", value: "99.8%" },
        { label: "Security", value: "Zero Data Stored" }
      ]
    },
    {
      id: "categorizer",
      title: "ML Auto-Categorization",
      subtitle: "TF-IDF + Calibrated Classifier",
      icon: Cpu,
      color: "from-cyan-500 to-blue-600",
      description: "Machine learning classifier categorizes all debits and credits into 12 standardized life categories, mapping seamlessly to the CFPB 50/30/20 financial wellness rule.",
      metrics: [
        { label: "Model Accuracy", value: "99.4%" },
        { label: "Heuristic Rules", value: "100+ Brands" },
        { label: "Categorization Time", value: "Real-time" }
      ]
    },
    {
      id: "anomalies",
      title: "Isolation Forest Fraud Radar",
      subtitle: "Unsupervised Anomaly Detection",
      icon: AlertTriangle,
      color: "from-amber-500 to-rose-600",
      description: "Identifies duplicate charges within 48-hour windows, abnormal category spikes via Z-score evaluation, and behavioral anomalies before billing cycles lock in.",
      metrics: [
        { label: "Duplicate Window", value: "48 Hours" },
        { label: "Outlier Algorithm", value: "Isolation Forest" },
        { label: "False Positive Rate", value: "< 1.2%" }
      ]
    },
    {
      id: "health",
      title: "5-Pillar Health Score",
      subtitle: "CFPB-Compliant Financial Index",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      description: "Evaluates Savings Rate, Budget Adherence, Emergency Runway, Debt-to-Income, and Volatility to produce a transparent 0–100 score with step-by-step point level-ups.",
      metrics: [
        { label: "Scoring Pillars", value: "5 Pillars" },
        { label: "Scale", value: "0–100 Index" },
        { label: "Guidance", value: "Actionable Uplifts" }
      ]
    },
    {
      id: "forecast",
      title: "Predictive Cash Flow",
      subtitle: "30-Day Daily Balance Trajectory",
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-600",
      description: "Detects recurring bills (Netflix, Spotify, Rent, Auto EMI) and forecasts daily liquid balances 30 days ahead with upper and lower confidence intervals.",
      metrics: [
        { label: "Forecast Horizon", value: "30 Days" },
        { label: "Subscription Radar", value: "Auto-detected" },
        { label: "Variance Bounds", value: "95% Interval" }
      ]
    },
    {
      id: "copilot",
      title: "AI Conversational Co-Pilot",
      subtitle: "Context-Aware Financial Co-Pilot",
      icon: Bot,
      color: "from-rose-500 to-pink-600",
      description: "Ask natural language questions: 'Can I afford a $1,200 flight?', 'Where am I overspending?', or 'How can I save $400 more next month?'.",
      metrics: [
        { label: "Context Window", value: "Personal Ledger" },
        { label: "Response Time", value: "Instant" },
        { label: "Tone", value: "Financial Advisor" }
      ]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080C14] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glowing Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/15 blur-[140px] animate-pulse-glow"></div>
      <div className="pointer-events-none absolute top-[1200px] -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]"></div>
      <div className="pointer-events-none absolute top-[2200px] right-0 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[130px]"></div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">FinPilot</span>
              <span className="rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 px-1.5 py-0.5 text-[11px] font-black uppercase text-white shadow-sm">
                MAX
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition">
              Capabilities
            </a>
            <a href="#simulator" className="hover:text-indigo-400 transition">
              Wealth Simulator
            </a>
            <a href="#comparison" className="hover:text-indigo-400 transition">
              Comparison
            </a>
            <a href="#security" className="hover:text-indigo-400 transition">
              Security
            </a>
          </nav>

          {/* User Auth Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 hidden sm:inline">
                  Welcome back, <strong className="text-white">{currentUser.name}</strong>
                </span>
                <button
                  onClick={onLaunchApp}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs px-4 py-2 shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs px-3.5 py-2 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs px-4 py-2 shadow-md shadow-indigo-600/25 transition hover:scale-105 active:scale-95"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28 text-center space-y-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md animate-float">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>✦ FinPilot MAX 2.0 • Autonomous AI Wealth Intelligence</span>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Autonomous Intelligence for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
              Your Personal Wealth
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FinPilot MAX transforms your static bank statements into continuous predictive cash flow trajectories, machine-learning anomaly detection, and personalized conversational financial advice.
          </p>
        </div>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {currentUser ? (
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <span>Open Advisor Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth("register")}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
              >
                <span>Create Your Account</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onOpenAuth("login")}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600"
              >
                <span>Sign In to Workspace</span>
              </button>
            </>
          )}
        </div>

        {/* Live Feature Highlights Strip */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>99.4% ML Categorization</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>Isolation Forest Anomaly Radar</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            <span>CFPB 5-Pillar Health Score</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
            <span>30-Day Cash Flow Forecast</span>
          </div>
        </div>

        {/* Interactive Floating Workspace Teaser Preview */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs text-slate-400 ml-2 font-mono">FinPilot MAX Workspace • Live Analytics Hub</span>
              </div>
              <div className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                AI Engine Active
              </div>
            </div>

            {/* Mock Live Dashboard Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Liquid Balance</span>
                <p className="text-xl font-bold font-numeric text-white">$14,820.50</p>
                <span className="text-[10px] text-emerald-400 font-semibold">+30-Day Net: +$3,218.45</span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">30-Day Net Cash Flow</span>
                <p className="text-xl font-bold font-numeric text-emerald-400">+$3,218.45</p>
                <span className="text-[10px] text-slate-400">In: $13,000 · Out: $9,782</span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Savings Rate</span>
                <p className="text-xl font-bold font-numeric text-indigo-300">24.8%</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Exceeds 20% Benchmark</span>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Health Score</span>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold font-numeric text-cyan-400">82/100</p>
                  <span className="text-[10px] font-extrabold text-emerald-400">Grade A</span>
                </div>
                <span className="text-[10px] text-cyan-300">Strong Wellness Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WEALTH ACCUMULATOR & COMPOUND SIMULATOR */}
      <section id="simulator" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Calculator className="h-4 w-4" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            See the Power of Systematic Wealth Compounding
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Adjust monthly contributions, time horizon, and return rates to simulate systematic investment growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
          {/* Sliders Control Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Monthly Contribution</span>
                <span className="font-numeric text-indigo-400 text-sm font-bold">${sipAmount} /mo</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>$100</span>
                <span>$2,500</span>
                <span>$5,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Investment Horizon</span>
                <span className="font-numeric text-cyan-400 text-sm font-bold">{sipYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Expected Annual Return</span>
                <span className="font-numeric text-emerald-400 text-sm font-bold">{sipRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>4% (Conservative)</span>
                <span>10% (Index Equities)</span>
                <span>18% (High Growth)</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 space-y-5 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projected Maturity Corpus
            </span>
            <div className="text-4xl sm:text-5xl font-black font-numeric text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">
              ${Math.round(futureValue).toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-400 block">Out of Pocket Principal</span>
                <span className="text-sm font-bold font-numeric text-slate-200">
                  ${Math.round(investedAmount).toLocaleString()}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <span className="text-[10px] text-emerald-300 block">Compound Gain (Interest)</span>
                <span className="text-sm font-bold font-numeric text-emerald-400">
                  +${Math.round(wealthGain).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth("register")}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <span>Simulate Custom Goals in Full Advisor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* CORE INTELLIGENCE CAPABILITIES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Cpu className="h-4 w-4" />
            <span>Autonomous Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Total Financial Clarity
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Explore the specialized AI and predictive engines powering FinPilot MAX.
          </p>
        </div>

        {/* Feature Tabs Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {featureTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Showcase Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-xl">
          {(() => {
            const currentTab = featureTabs[activeFeatureTab];
            const Icon = currentTab.icon;
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentTab.color} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{currentTab.title}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{currentTab.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentTab.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  {currentTab.metrics.map((m, i) => (
                    <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{m.label}</span>
                      <span className="text-base font-bold text-slate-200 mt-1 block">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section id="comparison" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Zap className="h-4 w-4" />
            <span>Competitive Benchmark</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Traditional Spreadsheets vs. FinPilot MAX
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Why modern professionals choose autonomous intelligence over manual bookkeeping.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="table-wrapper">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4">Manual Excel / Sheets</th>
                  <th className="px-6 py-4">Basic Banking Apps</th>
                  <th className="px-6 py-4 text-indigo-400 font-bold">FinPilot MAX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">CSV & PDF Statement Parsing</td>
                  <td className="px-6 py-4 text-slate-500">Manual copy-paste</td>
                  <td className="px-6 py-4 text-slate-500">Partial sync only</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Universal Instant
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">ML Auto-Categorization</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> None</td>
                  <td className="px-6 py-4 text-slate-400">Basic keyword rules</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> 99.4% Dual-Engine ML
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Unsupervised Anomaly Detection</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> None</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> None</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Isolation Forest Radar
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">30-Day Cash Flow Forecast</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> None</td>
                  <td className="px-6 py-4 text-slate-400">Static monthly total</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Daily Monte Carlo Path
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-white">Conversational Financial Co-Pilot</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> None</td>
                  <td className="px-6 py-4 text-rose-500"><X className="h-4 w-4" /> Generic FAQs</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> In-Context LLM Co-Pilot
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECURITY GUARANTEE */}
      <section id="security" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bank-Grade Privacy & Client Isolation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your financial activity and statements are strictly isolated. We do not aggregate, monetize, or sell user transactions. All machine learning inference runs locally in isolated database environments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-semibold text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>PBKDF2-HMAC-SHA256</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>RFC-7519 JWT Auth</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>CFPB Benchmark Logic</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          FinPilot MAX • AI-Powered Intelligent Personal Finance Advisor
        </p>
        <p>Built with FastAPI, Scikit-Learn, React & Tailwind CSS. All rights reserved.</p>
      </footer>
    </div>
  );
}
