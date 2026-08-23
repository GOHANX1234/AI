import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/openrouter";

// GET all conversations for the user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const conversations = await Conversation.find({ userId: user._id })
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(60);

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        systemPrompt: c.systemPrompt,
        pinned: c.pinned,
        lastMessage: c.lastMessage,
        totalTokens: c.totalTokens,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new empty conversation
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title = "New Chat", systemPrompt } = body;

    await connectToDatabase();
    const newConv = await Conversation.create({
      userId: user._id,
      title: title.trim(),
      model: "ClerX AI",
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
      totalTokens: 0,
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: newConv._id.toString(),
        title: newConv.title,
        systemPrompt: newConv.systemPrompt,
        pinned: newConv.pinned,
        totalTokens: 0,
        createdAt: newConv.createdAt,
        updatedAt: newConv.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
