"use client";

import React from "react";
import { Bot, Cpu, Database, Zap, Lock, Sparkles, Code2, LineChart, FileEdit } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-brand-400" />,
      title: "GLM-5.2 Deep Reasoning",
      description: "Harness bilingual, 128k context reasoning tailored for full-stack architecture, algorithm design, and structured outputs.",
      tag: "Flagship Core",
    },
    {
      icon: <Bot className="w-6 h-6 text-cyan-400" />,
      title: "Autonomous Agent Swarms",
      description: "Deploy specialized agents for automated code refactoring, vulnerability audits, whitepaper synthesis, and competitive intelligence.",
      tag: "Autonomous",
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      title: "MongoDB Atlas Memory",
      description: "Infinite conversational recall, structured document persistence, and enterprise database clustering with 99.99% uptime.",
      tag: "Cloud Native",
    },
    {
      icon: <FileEdit className="w-6 h-6 text-purple-400" />,
      title: "AI Document Studio",
      description: "Interactive AI copilot editor for crafting PRDs, documentation, test suites, and executive summaries side-by-side with live AI.",
      tag: "Productivity",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Sub-350ms OpenRouter Hub",
      description: "Ultra-low latency streaming inference through optimized OpenRouter global edge endpoints with instant fallback redundancy.",
      tag: "Speed",
    },
    {
      icon: <Lock className="w-6 h-6 text-pink-400" />,
      title: "Zero-Trust JWT Auth",
      description: "Encrypted HTTP-only cookies, Bcrypt password hashing, rate limiting, and developer API keys with scoped permission tokens.",
      tag: "Security",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engineered for <span className="text-gradient">Maximum Precision</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From raw neural model orchestration to persistent enterprise databases, ClerX AI delivers a seamless developer experience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/15 transition-all -z-10" />

              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                  {feat.icon}
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                  {feat.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
