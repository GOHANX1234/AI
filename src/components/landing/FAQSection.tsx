"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      q: "What is ClerX AI and what AI models does it support?",
      a: "ClerX AI is an enterprise-grade autonomous AI workspace. Our default flagship model is z-ai/glm-5.2:free via OpenRouter, paired with leading open models like NVIDIA Nemotron and Google Gemma. You can switch models on the fly.",
    },
    {
      q: "How does MongoDB Atlas integration work?",
      a: "ClerX AI securely persists all your conversations, system prompts, AI Studio documents, and telemetry logs directly into your MongoDB Atlas cloud database with connection pooling and caching.",
    },
    {
      q: "Is ClerX AI free to use?",
      a: "Yes! ClerX AI includes a generous Free Tier with access to GLM-5.2, 250,000 monthly tokens, Document Studio, and persistent conversation history. No credit card is required to sign up.",
    },
    {
      q: "How do Autonomous Agents work in ClerX?",
      a: "Autonomous Agents are pre-trained specialized AI workers that carry out multi-step tasks such as code reviews, security vulnerability scanning, technical copywriting, and data synthesis.",
    },
    {
      q: "Can I use ClerX AI via API?",
      a: "Absolutely. Pro and Enterprise accounts can generate secure API keys in the dashboard and integrate ClerX AI endpoints directly into their backend stacks and CI/CD pipelines.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need to know about ClerX AI.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-white flex items-center justify-between gap-4 hover:text-brand-300"
                >
                  <span className="text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-brand-400" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-slate-300 text-sm leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
