import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
          plan: user.plan,
          avatar: user.avatar,
          tokensUsed: user.tokensUsed,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}
