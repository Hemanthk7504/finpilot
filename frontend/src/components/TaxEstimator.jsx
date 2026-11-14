import React, { useState, useEffect } from "react";
import { DollarSign, ShieldCheck, PieChart, TrendingDown, ArrowRight, HelpCircle } from "lucide-react";
import { estimateTaxBracket } from "../services/api";

export default function TaxEstimator({ overview, currentUser }) {
  const baseSalary = currentUser?.monthly_income || overview?.monthly_income || 6500;
  const [annualGross, setAnnualGross] = useState(baseSalary * 12);
  const [filingStatus, setFilingStatus] = useState("single");
  const [pretax401k, setPretax401k] = useState(6000);
  const [pretaxIra, setPretaxIra] = useState(3000);

  const [taxData, setTaxData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculate = async () => {
    setIsLoading(true);
    try {
      const data = await estimateTaxBracket({
        annual_income: annualGross,
        filing_status: filingStatus,
        pretax_401k: pretax401k,
        pretax_ira: pretaxIra,
      });
      setTaxData(data);
    } catch {
      // Local estimate
      const deduction = filingStatus === "single" ? 14600 : 29200;
      const taxable = Math.max(0, annualGross - deduction - pretax401k - pretaxIra);
      const estimatedTax = taxable * 0.18;
      setTaxData({
        annual_gross: annualGross,
        standard_deduction: deduction,
        total_pretax_contributions: pretax401k + pretaxIra,
        taxable_income: taxable,
        estimated_federal_tax: estimatedTax,
        effective_tax_rate: Math.round((estimatedTax / annualGross) * 1000) / 10,
        marginal_bracket_pct: 22.0,
        annual_tax_saved_from_investments: (pretax401k + pretaxIra) * 0.22,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [annualGross, filingStatus, pretax401k, pretaxIra]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <PieChart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Tax Optimization & Pre-Tax Shield Estimator</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                IRS 2026 Index
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate standard deductions, tax brackets, and immediate tax savings from 401(k) / IRA contributions.
            </p>
          </div>
        </div>

        {taxData && (
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Tax Saved via Investments</span>
              <p className="text-base font-extrabold text-emerald-400 font-numeric">
                +${taxData.annual_tax_saved_from_investments?.toLocaleString()}/yr
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tax Metrics Grid */}
      {taxData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Effective Tax Rate</span>
            <p className="text-xl font-bold font-numeric text-white mt-1">{taxData.effective_tax_rate}%</p>
            <span className="text-[10px] text-slate-500">Marginal: {taxData.marginal_bracket_pct}%</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Standard Deduction</span>
            <p className="text-xl font-bold font-numeric text-white mt-1">${taxData.standard_deduction?.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">{filingStatus === "single" ? "Single Filer" : "Married Joint"}</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Taxable Net Income</span>
            <p className="text-xl font-bold font-numeric text-indigo-400 mt-1">${taxData.taxable_income?.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">After Pre-tax Deductions</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Estimated Federal Tax</span>
            <p className="text-xl font-bold font-numeric text-rose-400 mt-1">${taxData.estimated_federal_tax?.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Annual Obligation</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Annual Gross Salary ($)</label>
          <input
            type="number"
            step="1000"
            value={annualGross}
            onChange={(e) => setAnnualGross(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Annual 401(k) / Pre-tax Contribution</label>
          <input
            type="number"
            step="500"
            max="23500"
            value={pretax401k}
            onChange={(e) => setPretax401k(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Filing Status</label>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="single">Single Filer ($14,600 Deduction)</option>
            <option value="married">Married Filing Jointly ($29,200 Deduction)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
