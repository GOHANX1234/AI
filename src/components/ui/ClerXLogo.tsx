import React from "react";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  className?: string;
  withText?: boolean;
  textClassName?: string;
}

const SIZE_MAP = {
  xs: 18,
  sm: 22,
  md: 26,
  lg: 32,
  xl: 44,
  "2xl": 60,
};

export function ClerXIcon({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  className?: string;
}) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 26;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Precision Topological ClerX Knot */}
      {/* Primary Loop (Top-Left to Bottom-Right) */}
      <path
        d="M20 12C14.5 12 10 16.5 10 22C10 28.5 18 35 32 32C46 29 54 35.5 54 42C54 47.5 49.5 52 44 52C37.5 52 31 44 32 32C33 20 25.5 12 20 12Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Interlocking Secondary Loop (Top-Right to Bottom-Left) */}
      <path
        d="M44 12C49.5 12 54 16.5 54 22C54 28.5 46 35 32 32C18 29 10 35.5 10 42C10 47.5 14.5 52 20 52C26.5 52 33 44 32 32C31 20 38.5 12 44 12Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      {/* Focal Nexus Core */}
      <circle cx="32" cy="32" r="3.5" fill="currentColor" />
    </svg>
  );
}

export default function ClerXLogo({
  size = "md",
  className = "",
  withText = true,
  textClassName = "",
}: LogoProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 26;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-white shadow-sm">
        <ClerXIcon size={pixelSize} />
      </div>

      {withText && (
        <div className={`flex items-center font-semibold text-white ${textClassName}`}>
          <span className="text-[15px] sm:text-base font-semibold tracking-tight text-[#ececec]">
            ClerX
          </span>
        </div>
      )}
    </div>
  );
}
