import React, { useState } from "react";
import { X, Globe2, ArrowRightLeft, Check } from "lucide-react";

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1.0, flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.0116, flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.0107, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0092, flag: "🇬🇧" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 0.016, flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 0.0176, flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 1.78, flag: "🇯🇵" },
];

export default function CurrencySwitcherModal({ isOpen, onClose, currentCurrency, onSelectCurrency }) {
  const [calcAmount, setCalcAmount] = useState(10000);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Currency &amp; FX Rates</h3>
              <p className="text-xs text-slate-400">Select active workspace currency (Default: Indian Rupee ₹).</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CURRENCIES.map((curr) => {
            const isSelected = (currentCurrency?.code || "INR") === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => {
                  onSelectCurrency(curr);
                  onClose();
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-950/30 text-white"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{curr.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{curr.code}</span>
                      <span className="text-slate-400 font-numeric">({curr.symbol})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{curr.name}</span>
                  </div>
                </div>

                {isSelected ? (
                  <Check className="h-4 w-4 text-indigo-400" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-numeric">
                    {curr.code === "INR" ? "Base Currency" : `₹100 = ${(100 * curr.rate).toFixed(2)}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick FX Calculator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
              <span>Quick FX Rate Calculator</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-numeric">₹</span>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-24 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-right text-white font-numeric"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="rounded-xl bg-slate-900 p-2">
              <span className="text-[10px] text-slate-400">USD ($)</span>
              <p className="font-bold text-white font-numeric mt-0.5">${(calcAmount * 0.0116).toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-2">
              <span className="text-[10px] text-slate-400">EUR (€)</span>
              <p className="font-bold text-white font-numeric mt-0.5">€{(calcAmount * 0.0107).toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-900 p-2">
              <span className="text-[10px] text-slate-400">GBP (£)</span>
              <p className="font-bold text-white font-numeric mt-0.5">£{(calcAmount * 0.0092).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
