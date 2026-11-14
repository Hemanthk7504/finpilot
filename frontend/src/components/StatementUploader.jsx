import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, Loader2 } from "lucide-react";
import { uploadBankStatement } from "../services/api";

export default function StatementUploader({ onUploadSuccess }) {
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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-indigo-400" />
            AI Bank Statement Ingestion
          </h2>
          <p className="text-xs text-slate-400">
            Upload CSV or PDF bank statements for automated categorization, reconciliations, and anomaly detection.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Download Sample CSV
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            <p className="text-sm font-semibold text-white">Extracting & Classifying Transactions...</p>
            <p className="text-xs text-slate-400">Running TF-IDF classifier and Isolation Forest anomaly radar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Drag and drop your statement file here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard bank CSV & PDF extracts</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Result Summary */}
      {uploadResult && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{uploadResult.message}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-2 border-t border-emerald-500/20">
            <div>
              <span className="text-slate-400 text-[11px] block">Transactions Parsed</span>
              <strong className="text-white text-sm">{uploadResult.total_transactions_parsed}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Anomalies Detected</span>
              <strong className={uploadResult.anomalies_detected > 0 ? "text-amber-400 text-sm" : "text-white text-sm"}>
                {uploadResult.anomalies_detected}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Total Inflow</span>
              <strong className="text-emerald-400 text-sm">${uploadResult.total_inflow.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Total Outflow</span>
              <strong className="text-rose-400 text-sm">${uploadResult.total_outflow.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
