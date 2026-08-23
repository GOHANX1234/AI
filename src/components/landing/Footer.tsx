"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#02050b] border-t border-slate-800/80 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="text-base font-bold text-white">ClerX AI</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              Next-generation autonomous AI workspace powered by GLM-5.2, OpenRouter, and MongoDB Atlas.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="hover:text-white">Features</Link></li>
              <li><Link href="#models" className="hover:text-white">GLM-5.2 Hub</Link></li>
              <li><Link href="#playground" className="hover:text-white">Live Playground</Link></li>
              <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard/chat" className="hover:text-white">AI Chat Studio</Link></li>
              <li><Link href="/dashboard/studio" className="hover:text-white">Document Studio</Link></li>
              <li><Link href="/dashboard/agents" className="hover:text-white">Autonomous Agents</Link></li>
              <li><Link href="/dashboard/models" className="hover:text-white">Developer API</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Security & Compliance</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> MongoDB Atlas Cloud</li>
              <li><span>Encrypted JWT Sessions</span></li>
              <li><span>Zero Data Retention for Training</span></li>
              <li><span>Privacy & Terms of Service</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} ClerX AI Inc. All rights reserved.
          </p>
          <p className="text-slate-500 flex items-center gap-1">
            Built with Next.js 15, MongoDB Atlas & OpenRouter.
          </p>
        </div>

      </div>
    </footer>
  );
}
