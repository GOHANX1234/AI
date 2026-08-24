import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import Conversation from "@/lib/models/Conversation";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership of conversation
    const conv = await Conversation.findOne({ _id: id, userId: user._id });
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        attachments: m.attachments || [],
        thought: m.thought || "",
        thoughtDurationSec: m.thoughtDurationSec || 0,
        tokens: m.tokens,
        latencyMs: m.latencyMs,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
