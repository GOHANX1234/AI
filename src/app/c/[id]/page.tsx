import React, { Suspense } from "react";
import ClerXChat from "@/components/chat/ClerXChat";
import { ClerXIcon } from "@/components/ui/ClerXLogo";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-full bg-[#212121] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white animate-pulse">
              <ClerXIcon size={22} />
            </div>
          </div>
        </div>
      }
    >
      <ClerXChat initialConversationId={id} />
    </Suspense>
  );
}
