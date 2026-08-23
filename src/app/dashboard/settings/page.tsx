"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Settings,
  User,
  Building,
  Mail,
  ShieldCheck,
  Database,
  Sliders,
  Save,
  Check,
  RefreshCw,
} from "lucide-react";
import ClerXLogo from "@/components/ui/ClerXLogo";

export default function SettingsPage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [role, setRole] = useState(user?.role || "Member");
  const [systemPersona, setSystemPersona] = useState(
    "You are ClerX AI, a helpful, intelligent, versatile, and precise AI assistant."
  );
  const [creativityLevel, setCreativityLevel] = useState("Balanced");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [testingDb, setTestingDb] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCompany(user.company || "");
      setRole(user.role || "Member");
    }
  }, [user]);

  const handleTestDb = async () => {
    setTestingDb(true);
    try {
      const res = await fetch("/api/test-db");
      const data = await res.json();
      setDbStatus(data);
    } catch (e: any) {
      setDbStatus({ status: "offline", error: e.message });
    } finally {
      setTestingDb(false);
    }
  };

  useEffect(() => {
    handleTestDb();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-3 border border-slate-700">
          <Settings className="w-3.5 h-3.5 text-emerald-400" />
          <span>Preferences & Workspace Controls</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Settings & Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account profile, assistant behavior, and chat memory.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>User Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-[#050810] border border-slate-800 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Company / Workspace
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4 text-black" />}
            <span>{savedSuccess ? "Saved Successfully" : "Save Profile"}</span>
          </button>
        </div>
      </form>

      {/* Assistant Persona */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Assistant Persona & Tone</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Default System Instructions
            </label>
            <textarea
              value={systemPersona}
              onChange={(e) => setSystemPersona(e.target.value)}
              rows={3}
              className="w-full bg-[#080c16] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Custom instructions ClerX will keep in mind across all your chat sessions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Response Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Precise & Concise", "Balanced", "Creative & Exploratory"].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setCreativityLevel(style)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    creativityLevel === style
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold"
                      : "bg-[#080c16] border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Database Diagnostic Check */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Cloud Chat Storage Diagnostic</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connection health to MongoDB Atlas cloud cluster
            </p>
          </div>

          <button
            onClick={handleTestDb}
            disabled={testingDb}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? "animate-spin text-emerald-400" : ""}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {dbStatus && (
          <div className="p-4 rounded-xl bg-[#080c16] border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Status:</span>
              <span className={dbStatus.status === "online" ? "text-emerald-400 font-bold" : "text-red-400"}>
                {dbStatus.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database Target:</span>
              <span className="text-white">{dbStatus.database || "MongoDB Atlas"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ping Latency:</span>
              <span className="text-cyan-400">{dbStatus.pingMs}ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
