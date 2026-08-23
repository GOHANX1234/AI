"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Plus, Database, CheckCircle2 } from "lucide-react";
import ClerXLogo from "@/components/ui/ClerXLogo";

export default function Header() {
  const { user } = useAuth();
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/test-db")
      .then((res) => res.json())
      .then((data) => setDbConnected(data.status === "online"))
      .catch(() => setDbConnected(false));
  }, []);

  return (
    <header className="h-14 bg-[#040711]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ClerX AI Ready</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>MongoDB Atlas</span>
          {dbConnected === true && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-black" />
          <span>New Chat</span>
        </Link>
      </div>
    </header>
  );
}
