import { NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Look up user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [cleanEmail],
    });

    if (!users.data || users.data.length === 0) {
      return NextResponse.json(
        { error: `No account found with ${cleanEmail}. Please sign up.` },
        { status: 404 }
      );
    }

    const user = users.data[0];

    // 2. Verify password with Clerk Backend SDK
    let isVerified = false;
    try {
      const verifyResult = await clerkClient.users.verifyPassword({
        userId: user.id,
        password: password,
      });
      isVerified = Boolean(verifyResult.verified);
    } catch (verifyErr) {
      isVerified = false;
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify your credentials or use 'Forgot password?'." },
        { status: 401 }
      );
    }

    // 3. Create short-lived ticket/token for instant client session activation
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 120,
    });

    return NextResponse.json({
      success: true,
      token: signInToken.token,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Sign-in API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process sign in." },
      { status: 500 }
    );
  }
}
