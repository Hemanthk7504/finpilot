import React, { useState } from "react";
import { X, PlusCircle, Check, Loader2 } from "lucide-react";
import { createTransaction } from "../services/api";

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [type, setType] = useState("debit");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const categories = [
    "Food & Dining",
    "Groceries & Essentials",
    "Shopping & Electronics",
    "Bills & Utilities",
    "Transportation & Fuel",
    "Salary & Wages",
    "Investments & Wealth",
    "Healthcare & Medical",
    "Entertainment & Leisure",
    "Travel & Lodging",
    "Loans & Debt EMI",
    "Miscellaneous"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !merchant.trim()) {
      setError("Please provide a valid amount and transaction description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTransaction({
        raw_narration: merchant.trim(),
        clean_merchant: merchant.trim(),
        amount: parseFloat(amount),
        type,
        category_name: category,
        date: new Date(date).toISOString(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to record transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Transaction</h3>
              <p className="text-xs text-slate-400">Add an expense or income entry in INR (₹)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Type Toggle: Debit vs Credit */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setType("debit");
                if (category === "Salary & Wages") setCategory("Food & Dining");
              }}
              className={`py-2 rounded-lg font-bold transition text-xs ${
                type === "debit"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Expense (Debit)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("credit");
                setCategory("Salary & Wages");
              }}
              className={`py-2 rounded-lg font-bold transition text-xs ${
                type === "credit"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Income (Credit)
            </button>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-base font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500.00"
                className="w-full rounded-xl bg-slate-800/80 border border-slate-700 py-2.5 pl-8 pr-4 text-sm font-numeric text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Narration / Merchant Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Merchant
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Swiggy, Amazon, Monthly Rent, Salary Credit"
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 py-2.5 px-3.5 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category (ML Class)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 py-2.5 px-3.5 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Transaction Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700 py-2.5 px-3.5 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
