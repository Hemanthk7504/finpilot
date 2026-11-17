import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, User, Loader2, ArrowRight, CornerDownLeft } from "lucide-react";
import { sendChatMessage } from "../services/api";
import { formatINR } from "../utils/currency";

export default function AICoPilotDrawer({ isOpen, onClose, overview, currentUser, theme }) {
  const userName = currentUser?.name || "Friend";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${userName}! I am **FinPilot MAX**, your conversational AI financial advisor.\n\nI have real-time visibility into your balance, cash flows, ML-categorized transactions, and Financial Health Score.\n\nFeel free to ask me anything in natural language — from *"Can I afford a ₹60,000 purchase?"* to *"Should I choose the Old or New Tax Regime?"* or *"Calculate my SIP returns"*!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const starterChips = [
    "Can I afford a ₹50,000 purchase?",
    "Compare Old vs New Tax Regime",
    "Calculate SIP for ₹10,000/month",
    "How does Section 80C save tax?",
    "Where did my money go this month?",
    "How to reach a 95+ Health Score?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(text, messages);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          suggested_actions: response.suggested_actions || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue analyzing your financial records. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const balance = overview?.current_balance ?? 5420.0;
  const savingsRate = overview?.savings_rate ?? 100.0;
  const healthScore = Math.round(overview?.health_score ?? 81);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 border-l ${
          theme === "light"
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#090D18] border-slate-800 text-slate-100"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between transition-colors ${
            theme === "light" ? "border-slate-200 bg-slate-50/80" : "border-slate-800 bg-slate-900/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">FinPilot AI Advisor</h3>
                <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Hugging Face AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">FLAN-T5 &amp; MiniLM Semantic RAG Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Metrics Context Strip */}
        <div
          className={`px-4 py-2.5 border-b flex items-center justify-between text-xs ${
            theme === "light"
              ? "bg-slate-100/70 border-slate-200 text-slate-700"
              : "bg-slate-900/50 border-slate-800 text-slate-300"
          }`}
        >
          <span>
            Balance: <strong className="font-numeric text-indigo-500">{formatINR(balance)}</strong>
          </span>
          <span>
            Savings: <strong className="font-numeric text-emerald-500">{savingsRate.toFixed(1)}%</strong>
          </span>
          <span>
            Score: <strong className="font-numeric text-purple-500">{healthScore}/100</strong>
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shrink-0 text-white mt-0.5 shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                    : theme === "light"
                    ? "bg-slate-100/90 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap"
                    : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-2">
                  {m.content}
                </div>

                {/* Suggested Action Chips */}
                {m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex flex-wrap gap-1.5">
                    {m.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition flex items-center gap-1 ${
                          theme === "light"
                            ? "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200"
                            : "bg-slate-800 text-indigo-300 hover:bg-slate-700 border border-slate-700"
                        }`}
                      >
                        <span>{act}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="h-7 w-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="h-7 w-7 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div
                className={`rounded-2xl rounded-tl-none p-3 border flex items-center gap-2 ${
                  theme === "light"
                    ? "bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-slate-900 border-slate-800 text-slate-300"
                }`}
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                <span>FinPilot is reasoning across your finances...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        {messages.length <= 2 && (
          <div
            className={`p-3 border-t overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 ${
              theme === "light" ? "bg-slate-50 border-slate-200" : "bg-slate-900/40 border-slate-800"
            }`}
          >
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border transition ${
                  theme === "light"
                    ? "bg-white border-slate-200 text-slate-700 hover:border-purple-400 hover:text-purple-600"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-300"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          className={`p-3 border-t ${
            theme === "light" ? "bg-white border-slate-200" : "bg-slate-900/90 border-slate-800"
          }`}
        >
          <div
            className={`relative flex items-center rounded-2xl border transition ${
              theme === "light"
                ? "bg-slate-100 border-slate-200 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20"
                : "bg-slate-800/80 border-slate-700 focus-within:border-purple-500 focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-purple-500/20"
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any finance question (e.g. 80C, SIP, budget, afford)..."
              className="w-full resize-none bg-transparent px-3.5 py-3 text-xs outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 max-h-32"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="mr-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1 text-amber-400/90 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Hugging Face FLAN-T5</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
