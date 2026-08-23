import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";
import UsageLog from "@/lib/models/UsageLog";
import {
  createChatCompletion,
  ChatMessage,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
} from "@/lib/openrouter";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      message,
      model = DEFAULT_MODEL,
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      temperature = 0.7,
      history = [],
      stream = false,
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Guest Mode: Allow immediate chatting without requiring login
    if (!user) {
      const guestMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ];

      if (Array.isArray(history) && history.length > 0) {
        for (const h of history.slice(-8)) {
          if (h.role === "user" || h.role === "assistant") {
            guestMessages.push({ role: h.role, content: h.content });
          }
        }
      }

      guestMessages.push({ role: "user", content: message.trim() });

      const completion = await createChatCompletion(guestMessages, { temperature });

      return NextResponse.json({
        conversationId: null,
        message: {
          id: `guest-${Date.now()}`,
          role: "assistant",
          content: completion.content,
          tokens: completion.tokens,
          latencyMs: completion.latencyMs,
          createdAt: new Date().toISOString(),
        },
      });
    }

    await connectToDatabase();

    // Authenticated Mode: Find or create conversation in MongoDB
    let conv;
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conv = await Conversation.findOne({ _id: conversationId, userId: user._id });
    }

    if (!conv) {
      const initialTitle = message.length > 35 ? message.substring(0, 35) + "..." : message;
      conv = await Conversation.create({
        userId: user._id,
        title: initialTitle,
        model: "ClerX AI",
        systemPrompt: systemPrompt,
        totalTokens: 0,
      });
    }

    // Retrieve previous 14 messages for conversational context
    const previousMessages = await Message.find({ conversationId: conv._id })
      .sort({ createdAt: 1 })
      .limit(14);

    const openRouterMessages: ChatMessage[] = [
      { role: "system", content: conv.systemPrompt || systemPrompt || DEFAULT_SYSTEM_PROMPT },
    ];

    for (const pm of previousMessages) {
      if (pm.role === "user" || pm.role === "assistant" || pm.role === "system") {
        openRouterMessages.push({
          role: pm.role,
          content: pm.content,
        });
      }
    }

    openRouterMessages.push({
      role: "user",
      content: message.trim(),
    });

    // Save user message to database
    const userMsgDoc = await Message.create({
      conversationId: conv._id,
      userId: user._id,
      role: "user",
      content: message.trim(),
      model: "ClerX AI",
      tokens: Math.ceil(message.length / 4),
    });

    // Generate AI completion
    const completion = await createChatCompletion(openRouterMessages, {
      temperature,
    });

    // Save assistant message to database
    const assistantMsgDoc = await Message.create({
      conversationId: conv._id,
      userId: user._id,
      role: "assistant",
      content: completion.content,
      model: "ClerX AI",
      tokens: completion.tokens,
      latencyMs: completion.latencyMs,
    });

    // Update conversation metadata & token count
    await Conversation.findByIdAndUpdate(conv._id, {
      $inc: { totalTokens: completion.tokens },
      $set: { updatedAt: new Date() },
    });

    // Log usage
    await UsageLog.create({
      userId: user._id,
      conversationId: conv._id,
      tokensUsed: completion.tokens,
      model: "ClerX AI",
      endpoint: "/api/chat",
      latencyMs: completion.latencyMs,
    });

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        "stats.totalMessages": 2,
        "stats.totalTokens": completion.tokens,
      },
    });

    return NextResponse.json({
      conversationId: conv._id.toString(),
      message: {
        id: assistantMsgDoc._id.toString(),
        role: "assistant",
        content: assistantMsgDoc.content,
        tokens: assistantMsgDoc.tokens,
        latencyMs: assistantMsgDoc.latencyMs,
        createdAt: assistantMsgDoc.createdAt.toISOString(),
      },
      userMessageId: userMsgDoc._id.toString(),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate chat response. Please try again.",
      },
      { status: 500 }
    );
  }
}
