"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClerXLogo from "@/components/ui/ClerXLogo";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please provide your name, email, and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setLoading(true);

    const res = await signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Brand Header */}
      <Link href="/" className="mb-8">
        <ClerXLogo size="lg" />
      </Link>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-[#171717] rounded-2xl p-8 border border-white/[0.08] shadow-2xl relative">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Sign up to sync your chat sessions
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                required
                className="w-full bg-[#212121] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-xs text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-medium">
              Log in &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
