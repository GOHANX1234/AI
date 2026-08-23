"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Terminal, Menu, X, Layers, Zap } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030712]/80 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1.5px] shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                ClerX
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-slate-400" />
            Features
          </Link>
          <Link href="#models" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            GLM-5.2 Hub
          </Link>
          <Link href="#playground" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-slate-400" />
            Playground
          </Link>
          <Link href="#pricing" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-slate-400" />
            Pricing
          </Link>
        </nav>

        {/* Actions / Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-semibold transition-all hover:scale-105"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-black text-sm font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-105"
              >
                <span>Launch Free</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090d16] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-brand-400 py-2"
          >
            Features
          </Link>
          <Link
            href="#models"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-brand-400 py-2"
          >
            GLM-5.2 Hub
          </Link>
          <Link
            href="#playground"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-brand-400 py-2"
          >
            Playground
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-brand-400 py-2"
          >
            Pricing
          </Link>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full text-center py-2.5 rounded-lg bg-brand-500 text-black font-semibold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-lg bg-slate-800 text-white font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center py-2.5 rounded-lg bg-brand-500 text-black font-semibold"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
