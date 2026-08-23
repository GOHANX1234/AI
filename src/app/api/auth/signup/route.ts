import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, company, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      company: company?.trim() || "ClerX Workspace",
      role: role || "Member",
      plan: "Free",
      tokensUsed: 0,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });

    // Create default welcome conversation
    const welcomeConv = await Conversation.create({
      userId: user._id,
      title: "Welcome to ClerX AI",
      model: "ClerX AI",
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      lastMessage: "Welcome to ClerX AI! What would you like to explore today?",
    });

    await Message.create({
      conversationId: welcomeConv._id,
      userId: user._id,
      role: "assistant",
      content: `Hello **${user.name}**! 👋\n\nWelcome to **ClerX AI** — your intelligent AI assistant.\n\nHere are a few things you can ask me to do:\n- 💻 **Code & Debug** — Generate algorithms, review TypeScript, or debug errors\n- 📝 **Write & Edit** — Draft emails, documentation, or technical summaries\n- 💡 **Brainstorm Ideas** — Explore product strategies and innovative concepts\n- 📊 **Analyze & Synthesize** — Break down complex topics into clear answers\n\nWhat can I help you with today?`,
      model: "ClerX AI",
    });

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
      { status: 201 }
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
