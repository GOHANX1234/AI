"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Shield, Zap, Terminal, Database, Bot, Cpu } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/20 via-cyan-500/15 to-purple-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Cyber grid overlay */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-40 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span>GLM-5.2 Powered Neural Engine &bull; MongoDB Atlas Native</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Autonomous AI Intelligence for{" "}
            <span className="text-gradient">High-Velocity</span> Engineering Teams.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
            Unleash <strong className="text-white">ClerX AI</strong> — the next-generation neural platform.
            Orchestrate autonomous agent swarms, execute deep code synthesis with <strong className="text-brand-400">GLM-5.2</strong>,
            and store contextual workspace memory seamlessly on MongoDB Atlas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-400 hover:from-brand-400 hover:to-cyan-300 text-black font-extrabold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 group hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
            </Link>

            <Link
              href="#playground"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-md hover:scale-105"
            >
              <Terminal className="w-5 h-5 text-brand-400" />
              <span>Try Live Sandbox</span>
            </Link>
          </div>

          {/* Highlights & Guarantees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 border-t border-slate-800/80 text-left w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">&lt; 350ms Latency</div>
                <div className="text-xs text-slate-400">Real-time inference</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">GLM-5.2 Free</div>
                <div className="text-xs text-slate-400">OpenRouter integration</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">MongoDB Atlas</div>
                <div className="text-xs text-slate-400">Encrypted cloud storage</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">SOC-2 & JWT Auth</div>
                <div className="text-xs text-slate-400">Enterprise security</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
