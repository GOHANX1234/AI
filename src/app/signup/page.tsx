import React from "react";
import Link from "next/link";
import ClerXLogo from "@/components/ui/ClerXLogo";
import CustomAuthForm from "@/components/auth/CustomAuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Subtle Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="mb-8 hover:opacity-90 transition-opacity z-10">
        <ClerXLogo size="lg" />
      </Link>

      {/* Custom Auth Card */}
      <div className="z-10 w-full max-w-md bg-[#000000] rounded-3xl p-7 sm:p-8 border border-white/[0.12] shadow-2xl relative">
        <CustomAuthForm initialMode="signup" />
      </div>
    </div>
  );
}
