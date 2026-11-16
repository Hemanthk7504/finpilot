import React, { useState, useMemo } from "react";
import { ShieldCheck, PieChart, TrendingDown, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { formatINR } from "../utils/currency";

export default function TaxEstimator({ overview, currentUser }) {
  const baseSalary = currentUser?.monthly_income || overview?.monthly_income || 75000;
  const [annualGross, setAnnualGross] = useState(baseSalary > 0 ? baseSalary * 12 : 900000);
  const [regime, setRegime] = useState("new"); // "new" or "old"
  const [section80C, setSection80C] = useState(150000); // PPF, ELSS, EPF max 1.5L
  const [section80D, setSection80D] = useState(25000); // Health insurance max 25k
  const [hraExemption, setHraExemption] = useState(120000);

  // Calculate Indian Income Tax for New vs Old Regime
  const taxCalculations = useMemo(() => {
    // 1. New Tax Regime (Budget FY 2026-27)
    const stdDeductionNew = 75000;
    const taxableNew = Math.max(0, annualGross - stdDeductionNew);
    let taxNew = 0;

    if (taxableNew <= 700000) {
      // Section 87A rebate makes tax zero for taxable income <= 7 Lakhs
      taxNew = 0;
    } else {
      if (taxableNew > 1500000) {
        taxNew += (taxableNew - 1500000) * 0.30;
        taxNew += 300000 * 0.20; // 12-15L (60k)
        taxNew += 200000 * 0.15; // 10-12L (30k)
        taxNew += 300000 * 0.10; // 7-10L (30k)
        taxNew += 400000 * 0.05; // 3-7L (20k)
      } else if (taxableNew > 1200000) {
        taxNew += (taxableNew - 1200000) * 0.20;
        taxNew += 200000 * 0.15;
        taxNew += 300000 * 0.10;
        taxNew += 400000 * 0.05;
      } else if (taxableNew > 1000000) {
        taxNew += (taxableNew - 1000000) * 0.15;
        taxNew += 300000 * 0.10;
        taxNew += 400000 * 0.05;
      } else if (taxableNew > 700000) {
        taxNew += (taxableNew - 700000) * 0.10;
        taxNew += 400000 * 0.05;
      } else if (taxableNew > 300000) {
        taxNew += (taxableNew - 300000) * 0.05;
      }
    }
    const cessNew = taxNew * 0.04;
    const totalTaxNew = Math.round(taxNew + cessNew);

    // 2. Old Tax Regime
    const stdDeductionOld = 50000;
    const capped80C = Math.min(150000, Math.max(0, section80C));
    const capped80D = Math.min(50000, Math.max(0, section80D));
    const totalDeductionsOld = stdDeductionOld + capped80C + capped80D + hraExemption;
    const taxableOld = Math.max(0, annualGross - totalDeductionsOld);

    let taxOld = 0;
    if (taxableOld <= 500000) {
      taxOld = 0; // 87A rebate
    } else {
      if (taxableOld > 1000000) {
        taxOld += (taxableOld - 1000000) * 0.30;
        taxOld += 500000 * 0.20; // 5-10L (1,00,000)
        taxOld += 250000 * 0.05; // 2.5-5L (12,500)
      } else if (taxableOld > 500000) {
        taxOld += (taxableOld - 500000) * 0.20;
        taxOld += 250000 * 0.05;
      } else if (taxableOld > 250000) {
        taxOld += (taxableOld - 250000) * 0.05;
      }
    }
    const cessOld = taxOld * 0.04;
    const totalTaxOld = Math.round(taxOld + cessOld);

    const activeTax = regime === "new" ? totalTaxNew : totalTaxOld;
    const activeDeduction = regime === "new" ? stdDeductionNew : totalDeductionsOld;
    const activeTaxable = regime === "new" ? taxableNew : taxableOld;
    const taxDiff = Math.abs(totalTaxNew - totalTaxOld);
    const recommendedRegime = totalTaxNew <= totalTaxOld ? "New Regime" : "Old Regime";

    return {
      totalTaxNew,
      totalTaxOld,
      activeTax,
      activeDeduction,
      activeTaxable,
      effectiveRate: annualGross > 0 ? ((activeTax / annualGross) * 100).toFixed(1) : "0.0",
      recommendedRegime,
      taxDiff,
    };
  }, [annualGross, regime, section80C, section80D, hraExemption]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
            <PieChart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Indian Income Tax &amp; Regime Optimizer (FY 2026-27)</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Income Tax India
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluate New vs Old Tax Regime, Section 87A rebates, and optimize Section 80C / 80D deductions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 px-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Recommended Selection</span>
            <p className="text-base font-extrabold text-emerald-400 font-numeric">
              {taxCalculations.recommendedRegime} (Saves {formatINR(taxCalculations.taxDiff)})
            </p>
          </div>
        </div>
      </div>

      {/* Regime Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setRegime("new")}
          className={`flex-1 rounded-2xl border p-4 text-left transition ${
            regime === "new"
              ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm text-white">New Tax Regime (Default)</span>
            {taxCalculations.totalTaxNew <= taxCalculations.totalTaxOld && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Lowest Tax
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">₹75,000 standard deduction, zero tax up to ₹7.75 Lakhs.</p>
          <p className="text-xl font-black text-emerald-400 font-numeric">
            {formatINR(taxCalculations.totalTaxNew)} <span className="text-xs text-slate-500 font-normal">/yr</span>
          </p>
        </button>

        <button
          onClick={() => setRegime("old")}
          className={`flex-1 rounded-2xl border p-4 text-left transition ${
            regime === "old"
              ? "border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm text-white">Old Tax Regime</span>
            {taxCalculations.totalTaxOld < taxCalculations.totalTaxNew && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                Lowest Tax
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">Allows 80C (₹1.5L), 80D health insurance, HRA, home loan deductions.</p>
          <p className="text-xl font-black text-indigo-400 font-numeric">
            {formatINR(taxCalculations.totalTaxOld)} <span className="text-xs text-slate-500 font-normal">/yr</span>
          </p>
        </button>
      </div>

      {/* Tax Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Effective Tax Rate</span>
          <p className="text-xl font-bold font-numeric text-white mt-1">{taxCalculations.effectiveRate}%</p>
          <span className="text-[10px] text-slate-500">of Annual Gross</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Deductions</span>
          <p className="text-xl font-bold font-numeric text-white mt-1">{formatINR(taxCalculations.activeDeduction)}</p>
          <span className="text-[10px] text-slate-500">{regime === "new" ? "Std Deduction: ₹75K" : "80C + 80D + HRA"}</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Taxable Net Income</span>
          <p className="text-xl font-bold font-numeric text-indigo-400 mt-1">{formatINR(taxCalculations.activeTaxable)}</p>
          <span className="text-[10px] text-slate-500">Subject to Slab Rates</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Estimated Annual Tax</span>
          <p className="text-xl font-bold font-numeric text-rose-400 mt-1">{formatINR(taxCalculations.activeTax)}</p>
          <span className="text-[10px] text-slate-500">Includes 4% Health &amp; Edu Cess</span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Annual Gross Salary (₹)</label>
          <input
            type="number"
            step="10000"
            value={annualGross}
            onChange={(e) => setAnnualGross(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {regime === "old" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Section 80C (PPF / ELSS / EPF / LIC)</label>
              <input
                type="number"
                step="5000"
                max="150000"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Section 80D (Health Insurance)</label>
              <input
                type="number"
                step="2500"
                max="50000"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white font-numeric focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
