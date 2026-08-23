"use client";

import React from "react";
import { ArrowRight, Bot, Cpu, Database, CheckCircle2, Sparkles, Layers } from "lucide-react";

export default function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Prompt & Context Ingestion",
      description: "ClerX ingests multi-turn conversations, uploaded documents, or API queries with auto token-budget calculation.",
    },
    {
      num: "02",
      title: "GLM-5.2 Deep Reasoning",
      description: "Dispatches instructions across OpenRouter with structured prompt conditioning, system roles, and temperature controls.",
    },
    {
      num: "03",
      title: "MongoDB Atlas Memory Sync",
      description: "Persists chat trees, embeddings, telemetry, and user document changes to high-availability Atlas collections.",
    },
    {
      num: "04",
      title: "Multi-Agent Synthesis",
      description: "Specialized agents refine code, verify security vulnerabilities, and generate polished production deliverables.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            How <span className="text-gradient">ClerX AI</span> Powers Your Workflow
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From raw input to persistent structured intelligence in milliseconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-6 border border-slate-800 relative hover:border-brand-500/40 transition-all duration-300 group"
            >
              <div className="text-3xl font-black text-slate-700 group-hover:text-brand-400 transition-colors mb-4 font-mono">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
