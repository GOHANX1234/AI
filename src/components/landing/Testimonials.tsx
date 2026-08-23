"use client";

import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Marcus Vance",
      role: "VP of Engineering @ HyperScale Inc.",
      comment: "ClerX AI completely transformed our software architecture reviews. GLM-5.2's reasoning depth combined with the persistent Atlas database means our teams never lose design context.",
      stars: 5,
    },
    {
      name: "Elena Rostova",
      role: "Chief AI Officer @ NeuralMetrics",
      comment: "The speed is unbelievable. Zero rate limiting hiccups thanks to ClerX's OpenRouter fallback layer. The Autonomous Agent pipelines have saved us 30+ engineering hours weekly.",
      stars: 5,
    },
    {
      name: "Devon Chen",
      role: "Lead Full-Stack Architect @ NexusDev",
      comment: "Document Studio plus GLM-5.2 is pure magic. We draft technical PRDs and generate TypeScript test suites right in the same workspace. Best AI platform of 2026.",
      stars: 5,
    },
  ];

  return (
    <section className="py-24 bg-[#060a12] border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Trusted by <span className="text-gradient">Innovators</span> Worldwide
          </h2>
          <p className="text-slate-400 text-base">
            See what engineering leaders are saying about ClerX AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brand-400 fill-brand-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="font-bold text-white text-sm">{rev.name}</div>
                <div className="text-xs text-slate-500">{rev.role}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
