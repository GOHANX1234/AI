import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export default clerkMiddleware(async (_auth, req) => {
  const path = req.nextUrl.pathname;

  // Apply server-side IP rate limiting only on sensitive custom API routes
  if (path.startsWith("/api/keys") || path.startsWith("/api/studio/generate")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = checkRateLimit(`api:${ip}`, 60, 60_000); // 60 req/min per IP

    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Please retry in ${rateLimit.resetInSeconds} seconds.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.resetInSeconds),
          },
        }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
