import React from "react";
import { UploadCloud, CreditCard, Sparkles, CheckCircle } from "lucide-react";

export default function StatementBanner({ onOpenUpload }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900/90 to-purple-950/50 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Cards Graphics + Text */}
        <div className="flex items-center gap-5">
          {/* Isometric Cards Graphic */}
          <div className="relative h-16 w-24 shrink-0 hidden sm:block">
            {/* Back Card */}
            <div className="absolute top-0 left-0 w-20 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 shadow-lg transform -rotate-6 opacity-80 border border-indigo-300/30"></div>
            {/* Front Card */}
            <div className="absolute bottom-0 right-1 w-20 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-xl transform rotate-3 border border-white/20 p-1.5 flex flex-col justify-between">
              <div className="h-2 w-3 rounded-sm bg-amber-300/90"></div>
              <div className="flex justify-between items-center text-[7px] text-white font-mono">
                <span>•••• 4209</span>
                <CheckCircle className="h-2.5 w-2.5 text-emerald-300" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Import your bank statement</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Upload a CSV or PDF to automatically analyze your income, expenses, and get AI-powered insights in seconds.
            </p>
          </div>
        </div>

        {/* Right: Upload Button */}
        <button
          onClick={onOpenUpload}
          className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3 shadow-xl shadow-purple-600/30 transition hover:scale-105 active:scale-95 border border-purple-400/30"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Import Bank Statement</span>
        </button>
      </div>
    </div>
  );
}
