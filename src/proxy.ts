import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Rate limiting is NOT done here. Each serverless instance gets its own memory,
 * so an in-process counter cannot enforce a global limit, and the Next.js proxy
 * is explicitly not intended for database round trips. Sensitive routes call
 * `checkRateLimitDurable` from `@/lib/rateLimitDb` in their own handlers, where
 * the Node runtime can reach MongoDB.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
