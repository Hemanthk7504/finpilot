import React, { useState } from "react";
import { Search, Filter, AlertTriangle, ArrowUpDown, Tag, ChevronLeft, ChevronRight, PlusCircle, CheckCircle2 } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function TransactionTable({ transactions = [], onUpdateCategory, onAddTransaction }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showOnlyAnomalies, setShowOnlyAnomalies] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.clean_merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.raw_narration?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || t.category_name === selectedCategory;
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesAnomaly = !showOnlyAnomalies || t.is_anomaly;

    return matchesSearch && matchesCategory && matchesType && matchesAnomaly;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categories = Array.from(new Set(transactions.map((t) => t.category_name))).filter(Boolean);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">Transaction Ledger</h3>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400">
              {filtered.length} Entries (INR)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ML-categorized transactions from verified accounts & statements.
          </p>
        </div>

        {/* Action Button & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Transaction</span>
            </button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800/80 pl-8 pr-3 py-1.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-40"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="debit">Outflows (Debits)</option>
            <option value="credit">Inflows (Credits)</option>
          </select>

          {/* Anomaly Toggle */}
          <button
            onClick={() => {
              setShowOnlyAnomalies(!showOnlyAnomalies);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition ${
              showOnlyAnomalies
                ? "border-amber-500 bg-amber-500/20 text-amber-300"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Accessible Table Container */}
      <div tabIndex={0} role="region" aria-label="Transactions ledger table" className="table-wrapper rounded-xl border border-slate-800">
        <table>
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 border-b border-slate-800">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Merchant / Narration</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status / Fraud Flags</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginated.length > 0 ? (
              paginated.map((txn) => {
                const dateStr = typeof txn.date === "string" ? txn.date.split("T")[0] : new Date(txn.date).toLocaleDateString();
                const isCredit = txn.type === "credit";

                return (
                  <tr key={txn.id} className="transition hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{txn.clean_merchant}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm">{txn.raw_narration}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700/80 px-2 py-0.5 text-[11px] text-slate-300">
                        <Tag className="h-2.5 w-2.5 text-indigo-400" />
                        {txn.category_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {txn.is_anomaly ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 cursor-help"
                          title={txn.anomaly_reason || "Suspicious or duplicate transaction"}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>Flagged Duplicate</span>
                        </span>
                      ) : txn.is_recurring ? (
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
                          Recurring
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`font-bold font-numeric text-sm ${isCredit ? "text-emerald-400" : "text-white"}`}>
                        {formatINR(txn.amount, { showSign: true, decimals: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  {transactions.length === 0
                    ? "No transactions recorded yet in this account. Click 'Add Transaction' or 'Import Bank Statement' to begin."
                    : "No transactions match your current filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>
          Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
