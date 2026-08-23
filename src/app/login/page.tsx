"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClerXLogo from "@/components/ui/ClerXLogo";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || "Failed to sign in. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#171717] rounded-2xl p-8 border border-white/[0.08] shadow-2xl relative">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Sign in to access your chat history
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-[#212121] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-neutral-300">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#212121] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
        <p className="text-xs text-neutral-400 mb-1">Don't have an account?</p>
        <Link
          href="/signup"
          className="text-sm font-medium text-white hover:underline transition-all"
        >
          Sign up &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#212121] flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      <Link href="/" className="mb-8">
        <ClerXLogo size="lg" />
      </Link>

      <Suspense fallback={<div className="text-neutral-400 text-xs">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
