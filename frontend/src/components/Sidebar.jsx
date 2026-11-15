import React from "react";
import {
  LayoutDashboard,
  Receipt,
  Target,
  TrendingUp,
  Heart,
  LineChart,
  LayoutGrid,
  Bot,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";

export default function Sidebar({
  activeTab,
  onSelectTab,
  onOpenChat,
  onOpenSettings,
  onLogout,
  theme
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ledger", label: "Transactions", icon: Receipt },
    { id: "budgets-goals", label: "Budgets & Goals", icon: Target },
    { id: "forecast", label: "Forecast & Bills", icon: TrendingUp },
    { id: "health-score", label: "Health Score", icon: Heart },
    { id: "investments", label: "Investments", icon: LineChart },
    { id: "simulators", label: "Simulators & Tools", icon: LayoutGrid },
    { id: "ai-copilot", label: "AI Co-Pilot", icon: Bot, badge: "New" },
  ];

  const handleNavClick = (id) => {
    if (id === "ai-copilot") {
      onOpenChat();
    } else {
      onSelectTab(id);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 w-64 z-30 flex flex-col justify-between transition-colors duration-200 border-r ${
        theme === "light"
          ? "bg-[#FFFFFF] border-slate-200/90 text-slate-800 shadow-sm"
          : "bg-[#090D18]/95 border-slate-800/80 text-slate-200 backdrop-blur-xl"
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white dark:text-white light:text-slate-900">
                FinPilot
              </span>
              <span className="rounded bg-gradient-to-r from-indigo-500 to-purple-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                MAX
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">AI Finance Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-bold border border-purple-400/30"
                  : theme === "light"
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm shadow-purple-500/40 uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Ambient Waves & Utility Links */}
      <div className="relative p-3 pt-2 border-t border-slate-800/40">
        {/* Subtle Ambient Wave SVG */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg
            viewBox="0 0 200 60"
            className="w-full h-full text-indigo-500 fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,20 C50,40 100,0 150,30 C180,45 190,20 200,25 L200,60 L0,60 Z" />
          </svg>
        </div>

        <div className="relative space-y-1">
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              theme === "light"
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition text-rose-400 hover:text-rose-300 ${
              theme === "light" ? "hover:bg-rose-50" : "hover:bg-rose-950/20"
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
