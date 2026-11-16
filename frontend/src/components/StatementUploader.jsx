import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, Loader2, X, Check } from "lucide-react";
import { uploadBankStatement } from "../services/api";
import { formatINR } from "../utils/currency";

export default function StatementUploader({ onUploadSuccess, isModal = false, onClose = null }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".pdf")) {
      setErrorMessage("Please select a valid CSV (.csv) or PDF (.pdf) bank statement.");
      return;
    }

    setErrorMessage("");
    setIsUploading(true);
    setUploadResult(null);

    try {
      const summary = await uploadBankStatement(file);
      setUploadResult(summary);
      if (onUploadSuccess) {
        onUploadSuccess(summary);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to parse bank statement.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    window.open("/api/v1/reports/download-sample-statement", "_blank");
  };

  const content = (
    <div className={`relative rounded-2xl border border-slate-800/80 bg-slate-900/95 p-6 backdrop-blur-xl ${isModal ? 'max-w-lg w-full shadow-2xl' : ''}`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-indigo-400" />
            <span>Import Bank Statement</span>
          </h2>
          <p className="text-xs text-slate-400">
            Upload your CSV or PDF bank statement for instant AI categorization and health scoring.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-700 transition shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-4 text-center transition ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-indigo-400" />
            <p className="text-xs font-semibold text-indigo-300">
              Parsing Statement with Machine Learning Pipeline...
            </p>
            <p className="text-[11px] text-slate-500">
              Cleaning merchant narrations, categorizing spend, and computing anomalies
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                <span className="text-indigo-400 font-bold">Click to browse</span> or drag and drop your statement
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PhonePe, Google Pay (GPay), Paytm, BHIM, CRED, and all Indian Bank CSV &amp; PDF statements
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Summary Pill */}
      {uploadResult && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Statement Processed Successfully</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">
              {uploadResult.records_ingested} records
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Credits (Inflows)</span>
              <strong className="text-emerald-400 font-numeric">{formatINR(uploadResult.total_inflow)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Debits (Outflows)</span>
              <strong className="text-rose-400 font-numeric">{formatINR(uploadResult.total_outflow)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Anomalies Flagged</span>
              <strong className="text-amber-400">{uploadResult.anomalies_flagged}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Date Range</span>
              <strong className="text-slate-200 truncate block text-[11px]">{uploadResult.date_range}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
}
