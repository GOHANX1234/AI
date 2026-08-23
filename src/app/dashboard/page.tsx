"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClerXIcon } from "@/components/ui/ClerXLogo";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="h-[100dvh] w-full bg-[#212121] flex items-center justify-center">
      <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white animate-pulse">
        <ClerXIcon size={22} />
      </div>
    </div>
  );
}
