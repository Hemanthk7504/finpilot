import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar, AlertCircle, Clock, Zap } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function ForecastView({ forecastData }) {
  const forecastDays = forecastData?.forecast_days || [];
  const subscriptions = forecastData?.detected_subscriptions || [];
  const projectedEOM = forecastData?.projected_end_of_month_balance ?? 5890.0;
  const currentBalance = forecastData?.current_balance ?? 5420.0;
  const status = forecastData?.cashflow_health_status ?? "Positive cash flow expected.";

  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs">
          <p className="font-semibold text-white">{data.day_label || label} ({data.date})</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-cyan-400">
              Projected Balance: <strong className="text-white font-numeric">{formatINR(data.predicted_balance)}</strong>
            </p>
            <p className="text-indigo-400">
              Predicted Outflow: <strong className="text-white font-numeric">{formatINR(data.predicted_expense)}</strong>
            </p>
            {data.has_scheduled_bill && (
              <p className="text-amber-400 font-medium">
                ⚡ Scheduled Bill: {data.bill_name}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 30-Day Predictive Cash Flow Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              30-Day Predictive Cash Flow & Balance Forecast
            </h3>
            <p className="text-xs text-slate-400">
              Machine learning time-series projection combining recurring bill detection and variable burn rate.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="rounded-lg bg-slate-800 px-3 py-1.5 border border-slate-700 text-slate-300">
              Projected EOM Balance: <strong className="text-emerald-400 font-bold font-numeric">{formatINR(projectedEOM)}</strong>
            </div>
          </div>
        </div>

        {/* Health status banner */}
        <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300 flex items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{status}</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastDays} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day_label" stroke="#64748B" fontSize={11} tickLine={false} interval={4} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomForecastTooltip />} />
              <Area
                type="monotone"
                dataKey="predicted_balance"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceGrad)"
                name="Projected Balance"
              />
              <Line
                type="monotone"
                dataKey="upper_bound"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Upper Bound"
              />
              <Line
                type="monotone"
                dataKey="lower_bound"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth={1}
                dot={false}
                name="Lower Bound"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detected Subscriptions & Recurring Bills */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Automated Subscription & Recurring Bill Radar
            </h3>
            <p className="text-xs text-slate-400">
              Identified regular billing cycles to prevent surprises and avoid cash flow deficits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subscriptions.map((sub, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">{sub.merchant}</h4>
                  <span className="text-[11px] text-slate-400">{sub.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-sm font-numeric">{formatINR(sub.average_amount)}</span>
                  <span className="text-[10px] text-slate-400 block">{sub.frequency}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  Due: {sub.next_expected}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    sub.days_until_due <= 3
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : sub.days_until_due <= 7
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  in {sub.days_until_due} days
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
