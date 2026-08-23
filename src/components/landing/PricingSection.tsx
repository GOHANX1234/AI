"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter Free",
      price: "$0",
      cadence: "forever",
      badge: "Get Started",
      description: "Perfect for developers and AI enthusiasts exploring GLM-5.2 reasoning.",
      features: [
        "Unlimited chats with GLM-5.2 Free",
        "250,000 monthly token quota",
        "Persistent MongoDB conversation history",
        "Document Studio workspace",
        "5 Autonomous Agent runs/day",
        "Community support",
      ],
      ctaText: "Get Started Free",
      ctaLink: "/signup",
      popular: false,
    },
    {
      name: "Pro Engineer",
      price: annual ? "$24" : "$29",
      cadence: "per month",
      badge: "Most Popular",
      description: "For professionals who need high throughput, multi-agent swarms, and API access.",
      features: [
        "Everything in Starter Free",
        "2,000,000 monthly token quota",
        "Priority OpenRouter edge inference",
        "Unlimited Autonomous Agent executions",
        "Developer API Keys & Webhooks",
        "Export chats in Markdown, JSON, PDF",
        "Priority 24/7 technical support",
      ],
      ctaText: "Upgrade to Pro",
      ctaLink: "/signup",
      popular: true,
    },
    {
      name: "Enterprise Dedicated",
      price: "Custom",
      cadence: "tailored billing",
      badge: "Enterprise",
      description: "Dedicated cluster provisioning, custom fine-tuned weights, and SLA guarantees.",
      features: [
        "Dedicated MongoDB Atlas DB cluster",
        "Custom enterprise AI model routing",
        "10,000,000+ monthly token limits",
        "SOC-2 & HIPAA compliance guarantee",
        "Custom SAML SSO & RBAC permissions",
        "Dedicated AI Solutions Architect",
        "Custom SLAs & 99.99% uptime guarantee",
      ],
      ctaText: "Contact Sales",
      ctaLink: "/signup",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Predictable Plans for <span className="text-gradient">Every Scale</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mb-8">
            Start completely free with zero credit card required. Upgrade as your agent swarms grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !annual ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                annual ? "bg-brand-500 text-black shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-mono font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? "bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#070b14] border-2 border-brand-500 shadow-2xl shadow-brand-500/15 lg:-translate-y-2"
                  : "glass-card border border-slate-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/{plan.cadence}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800 mb-8">
                  {plan.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={plan.ctaLink}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-brand-500 hover:bg-brand-400 text-black shadow-lg shadow-brand-500/25"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
