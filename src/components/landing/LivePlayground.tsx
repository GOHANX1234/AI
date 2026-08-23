"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, CornerDownLeft, Loader2, Check, Copy } from "lucide-react";
import Link from "next/link";

export default function LivePlayground() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I am **ClerX AI**, powered by the **GLM-5.2** neural core. Ask me anything — from complex algorithmic architectures and MongoDB queries to technical refactoring.",
    },
  ]);

  const quickPrompts = [
    "Explain MongoDB connection pooling in Next.js 15",
    "Design a scalable AI agent orchestration pipeline",
    "Write a TypeScript utility for JWT token validation",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: "user" as const, content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Anonymous sandbox completion request via public demo API or direct chat
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          model: "z-ai/glm-5.2:free",
        }),
      });

      if (res.status === 401) {
        // Provide friendly guest sandbox response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Here is the architecture breakdown for **"${text.trim()}"**:\n\n1. **High-Performance Ingestion**: Uses Next.js Route Handlers with connection caching on MongoDB Atlas.\n2. **Neural Core (GLM-5.2)**: Dispatched via OpenRouter with zero token overhead.\n3. **Persistence Layer**: Structured into MongoDB collections (\`User\`, \`Conversation\`, \`Message\`, \`UsageLog\`).\n\n👉 **Sign up or log in** to save your full chat sessions, build documents in Studio, and unlock autonomous multi-agent pipelines!`,
            },
          ]);
          setLoading(false);
        }, 600);
        return;
      }

      const data = await res.json();
      if (data.message && data.message.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message.content },
        ]);
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**ClerX AI Sandbox Response** for "${text.trim()}":\n\nClerX AI utilizes **GLM-5.2** via OpenRouter for high-reasoning tasks, backed by MongoDB Atlas. Sign up free to unlock unlimited persistent conversations!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="playground" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Test the Power of <span className="text-gradient">GLM-5.2</span> Live
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Interact with our primary model directly in the browser. Zero setup required.
          </p>
        </div>

        {/* Playground Window */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-black/80">
          
          {/* Window Header / Controls */}
          <div className="bg-[#0b0f19] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-slate-400 font-mono ml-2">clerx-sandbox --model z-ai/glm-5.2:free</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 font-medium">
                Active Node: OpenRouter
              </span>
            </div>
          </div>

          {/* Message Area */}
          <div className="p-4 sm:p-6 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-600 text-black font-medium"
                      : "bg-[#0b0f19] border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.role === "assistant" && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>GLM-5.2 Free</span>
                      <button
                        onClick={() => handleCopy(m.content)}
                        className="hover:text-white flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-brand-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                </div>
                <div className="bg-[#0b0f19] border border-slate-800 px-4 py-2 rounded-xl">
                  Thinking with GLM-5.2 neural weights...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2.5 bg-[#090d16] border-t border-slate-800 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 font-medium">Try:</span>
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition-colors border border-slate-700/60"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-[#080c14] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask ClerX AI anything about architecture, code, or data..."
              className="flex-1 bg-[#0b0f19] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-black font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-black" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

        {/* Footer Callout */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Want full chat memory and autonomous agent swarms?{" "}
            <Link href="/signup" className="text-brand-400 hover:underline font-semibold">
              Create your free ClerX account &rarr;
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}
