"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import ClerXLogo from "@/components/ui/ClerXLogo";

export default function ModelsShowcase() {
  return (
    <section className="py-16 bg-[#060a12] border-t border-slate-800/80 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <ClerXLogo size="lg" className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">ClerX Conversational Intelligence</h2>
        <p className="text-slate-400 text-sm mb-6">
          High-performance reasoning and coding assistance with zero setup.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Start Chatting</span>
        </Link>
      </div>
    </section>
  );
}
