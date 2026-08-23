"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClerXLogo from "@/components/ui/ClerXLogo";
import {
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "AI Chat", href: "/", icon: MessageSquare },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#050811] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      } shrink-0 h-screen sticky top-0`}
    >
      {/* Top Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <ClerXLogo size="sm" withText={!collapsed} />
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Link
            href="/"
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-black" />
            {!collapsed && <span>New Chat</span>}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* User Card & Logout */}
        <div className={`flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 ${collapsed ? "flex-col gap-2" : ""}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "CX"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user?.name || "User"}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
