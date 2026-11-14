import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, User, ArrowRight, Loader2, DollarSign } from "lucide-react";
import { sendChatMessage } from "../services/api";

export default function AICoPilotDrawer({ isOpen, onClose, overview }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello Alex! I am **FinPilot MAX**, your AI financial co-pilot.\n\nI have real-time visibility into your bank statements, spending patterns, budgets, and Financial Health Score. Ask me anything about your finances!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const starterChips = [
    "Can I afford a $1,200 vacation next month?",
    "Where did most of my money go this month?",
    "How can I boost my Health Score to 90?",
    "Are there any duplicate or suspicious charges?",
    "How should I invest $500/month?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">FinPilot AI Advisor</h3>
                <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.2 uppercase">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Context-Aware Financial Co-Pilot</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <span>
            Balance: <strong className="text-white">${overview?.current_balance?.toLocaleString()}</strong>
          </span>
          <span>
            Savings: <strong className="text-emerald-400">{overview?.savings_rate?.toFixed(1)}%</strong>
          </span>
          <span>
            Health Score: <strong className="text-purple-400">{overview?.health_score}/100</strong>
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
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.content}

                {/* Suggested Action Chips inside assistant message */}
                {m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                    {m.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="rounded-lg bg-slate-700/60 hover:bg-slate-700 px-2 py-1 text-[10px] font-medium text-indigo-300 transition"
                      >
                        {act} →
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
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-800/90 p-3 text-slate-300 border border-slate-700/60 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>FinPilot is analyzing cash flow metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900 overflow-x-auto flex gap-1.5 no-scrollbar">
          {starterChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 whitespace-nowrap hover:border-indigo-500 hover:text-white transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about spending, budgets, affordability..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
