"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
  "2xl": "w-28 h-28 text-3xl",
};

// Luxury gradient palettes for high-quality avatar fallbacks
const GRADIENTS = [
  "from-violet-600 via-indigo-600 to-purple-800",
  "from-cyan-500 via-blue-600 to-indigo-900",
  "from-emerald-500 via-teal-600 to-slate-900",
  "from-amber-500 via-rose-600 to-purple-900",
  "from-fuchsia-500 via-pink-600 to-rose-900",
  "from-blue-600 via-indigo-700 to-neutral-900",
  "from-teal-400 via-emerald-600 to-neutral-900",
  "from-rose-500 via-indigo-600 to-slate-950",
];

function getGradientIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENTS.length;
}

export default function UserAvatar({
  src,
  name,
  email,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const seed = (email || name || "User").toLowerCase();
  const gradientClass = GRADIENTS[getGradientIndex(seed)];

  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (email?.[0] || "U").toUpperCase();

  // If valid image provided and not failed
  if (src && !imgError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm bg-[#181818] ${sizeClasses[size]} ${className}`}
      >
        <img
          src={src}
          alt={name || "User avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover select-none"
        />
      </div>
    );
  }

  // High quality gradient mesh avatar fallback
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border border-white/15 shadow-md flex items-center justify-center font-bold text-white bg-gradient-to-tr ${gradientClass} ${sizeClasses[size]} ${className} select-none`}
    >
      {/* Specular lighting overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />
      <span className="relative z-10 font-semibold tracking-wider drop-shadow-sm">
        {initials}
      </span>
    </div>
  );
}
