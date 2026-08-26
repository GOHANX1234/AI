import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";
import UsageLog from "@/lib/models/UsageLog";
import {
  createChatCompletion,
  getOpenRouterStreamResponse,
  ChatMessage,
  ChatContentPart,
  DEFAULT_MODEL,
  NEMOTRON_OMNI_MODEL,
  DEFAULT_SYSTEM_PROMPT,
} from "@/lib/openrouter";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      message = "",
      attachments = [],
      model = DEFAULT_MODEL,
      systemPrompt = DEFAULT_SYSTEM_PROMPT,
      temperature = 0.7,
      history = [],
      stream = true,
    } = body;

    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanMessage && !hasAttachments) {
      return NextResponse.json(
        { error: "Please provide a message or upload an image/document." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const startTime = Date.now();

    // Enforce authentication for file & document uploads
    if (hasAttachments && !user) {
      return NextResponse.json(
        { error: "Please log in or create an account to upload photos, PDFs, and documents." },
        { status: 401 }
      );
    }

    // When photos/documents are attached, route directly to Nemotron 3 Nano Omni
    const selectedModel = hasAttachments ? NEMOTRON_OMNI_MODEL : model;

    // Construct user message payload
    let userMsgPayload: string | ChatContentPart[];
    if (hasAttachments) {
      const parts: ChatContentPart[] = [];
      const promptText =
        cleanMessage ||
        "Please analyze and explain the uploaded photo/document in detail.";
      parts.push({ type: "text", text: promptText });

      for (const att of attachments) {
        if (att && att.url) {
          parts.push({
            type: "image_url",
            image_url: { url: att.url },
          });
        }
      }
      userMsgPayload = parts;
    } else {
      userMsgPayload = cleanMessage;
    }

    // Guest Mode
    if (!user) {
      const guestMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ];

      if (Array.isArray(history) && history.length > 0) {
        for (const h of history.slice(-8)) {
          if (h.role === "user" || h.role === "assistant") {
            if (Array.isArray(h.attachments) && h.attachments.length > 0) {
              const hParts: ChatContentPart[] = [
                { type: "text", text: h.content || "Uploaded photo/document" },
              ];
              for (const att of h.attachments) {
                if (att?.url) {
                  hParts.push({ type: "image_url", image_url: { url: att.url } });
                }
              }
              guestMessages.push({ role: h.role, content: hParts });
            } else {
              guestMessages.push({ role: h.role, content: h.content });
            }
          }
        }
      }

      guestMessages.push({ role: "user", content: userMsgPayload });

      if (!stream) {
        const completion = await createChatCompletion(guestMessages, {
          model: selectedModel,
          temperature,
        });
        return NextResponse.json({
          conversationId: null,
          message: {
            id: `guest-${Date.now()}`,
            role: "assistant",
            content: completion.content,
            thought: completion.thought || "",
            thoughtDurationSec: completion.thoughtDurationSec || 0,
            tokens: completion.tokens,
            latencyMs: completion.latencyMs,
            createdAt: new Date().toISOString(),
          },
        });
      }

      // Stream guest response with real tokens
      return createSSEStreamResponse({
        messages: guestMessages,
        model: selectedModel,
        temperature,
        startTime,
        user: null,
      });
    }

    // Authenticated Mode: Find or create conversation in MongoDB
    await connectToDatabase();

    let conv;
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conv = await Conversation.findOne({ _id: conversationId, userId: user._id });
    }

    if (!conv) {
      const initialTitle = cleanMessage
        ? cleanMessage.length > 35
          ? cleanMessage.substring(0, 35) + "..."
          : cleanMessage
        : "Photo / Document Analysis";

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
        if (Array.isArray(pm.attachments) && pm.attachments.length > 0) {
          const prevParts: ChatContentPart[] = [
            { type: "text", text: pm.content || "Uploaded photo/document" },
          ];
          for (const att of pm.attachments) {
            if (att?.url) {
              prevParts.push({ type: "image_url", image_url: { url: att.url } });
            }
          }
          openRouterMessages.push({
            role: pm.role,
            content: prevParts,
          });
        } else {
          openRouterMessages.push({
            role: pm.role,
            content: pm.content,
          });
        }
      }
    }

    openRouterMessages.push({
      role: "user",
      content: userMsgPayload,
    });

    // Save user message to database
    const userMsgDoc = await Message.create({
      conversationId: conv._id,
      userId: user._id,
      role: "user",
      content: cleanMessage || (hasAttachments ? "Uploaded photo/document" : ""),
      attachments: attachments || [],
      model: "ClerX AI",
      tokens: Math.ceil(((cleanMessage.length || 20) + (attachments?.length || 0) * 500) / 4),
    });

    if (!stream) {
      const completion = await createChatCompletion(openRouterMessages, {
        model: selectedModel,
        temperature,
      });

      const assistantMsgDoc = await Message.create({
        conversationId: conv._id,
        userId: user._id,
        role: "assistant",
        content: completion.content,
        thought: completion.thought || "",
        thoughtDurationSec: completion.thoughtDurationSec || 0,
        model: "ClerX AI",
        tokens: completion.tokens,
        latencyMs: completion.latencyMs,
      });

      await Conversation.findByIdAndUpdate(conv._id, {
        $inc: { totalTokens: completion.tokens },
        $set: { updatedAt: new Date() },
      });

      await UsageLog.create({
        userId: user._id,
        conversationId: conv._id,
        tokensUsed: completion.tokens,
        model: "ClerX AI",
        endpoint: "/api/chat",
        latencyMs: completion.latencyMs,
      });

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
          thought: assistantMsgDoc.thought || "",
          thoughtDurationSec: assistantMsgDoc.thoughtDurationSec || 0,
          tokens: assistantMsgDoc.tokens,
          latencyMs: assistantMsgDoc.latencyMs,
          createdAt: assistantMsgDoc.createdAt.toISOString(),
        },
        userMessageId: userMsgDoc._id.toString(),
      });
    }

    // Stream authenticated response with real tokens and save on completion
    return createSSEStreamResponse({
      messages: openRouterMessages,
      model: selectedModel,
      temperature,
      startTime,
      user,
      conv,
      userMsgDoc,
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

/**
 * Creates a Server-Sent Events stream from OpenRouter with real-time thinking and token dispatch
 */
async function createSSEStreamResponse({
  messages,
  model,
  temperature,
  startTime,
  user,
  conv,
  userMsgDoc,
}: {
  messages: ChatMessage[];
  model?: string;
  temperature: number;
  startTime: number;
  user: any;
  conv?: any;
  userMsgDoc?: any;
}) {
  const upstreamResponse = await getOpenRouterStreamResponse(messages, { model, temperature });
  const upstreamReader = upstreamResponse.body?.getReader();

  if (!upstreamReader) {
    throw new Error("Failed to initialize upstream token stream.");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let fullContent = "";
  let fullThought = "";
  let insideThinkTag = false;
  let thinkStartTime = startTime;
  let thinkEndTime = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial meta event if conversation exists
      if (conv) {
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              conversationId: conv._id.toString(),
              userMessageId: userMsgDoc ? userMsgDoc._id.toString() : null,
            })}\n\n`
          )
        );
      }

      let buffer = "";

      try {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;

            const payload = trimmed.replace(/^data:\s*/, "");
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;

              if (!delta) continue;

              // 1. Check reasoning / thought fields from OpenRouter delta
              const reasoningToken =
                delta.reasoning || delta.reasoning_content || delta.thought || "";
              if (reasoningToken) {
                fullThought += reasoningToken;
                thinkEndTime = Date.now();
                controller.enqueue(
                  encoder.encode(
                    `event: thought\ndata: ${JSON.stringify({ token: reasoningToken })}\n\n`
                  )
                );
              }

              // 2. Check content field
              let contentToken = delta.content || "";
              if (contentToken) {
                // Parse <think> and </think> tags inside streaming content
                if (contentToken.includes("<think>")) {
                  insideThinkTag = true;
                  const parts = contentToken.split("<think>");
                  if (parts[0]) {
                    fullContent += parts[0];
                    controller.enqueue(
                      encoder.encode(
                        `event: content\ndata: ${JSON.stringify({ token: parts[0] })}\n\n`
                      )
                    );
                  }
                  contentToken = parts[1] || "";
                }

                if (insideThinkTag) {
                  if (contentToken.includes("</think>")) {
                    insideThinkTag = false;
                    const parts = contentToken.split("</think>");
                    if (parts[0]) {
                      fullThought += parts[0];
                      thinkEndTime = Date.now();
                      controller.enqueue(
                        encoder.encode(
                          `event: thought\ndata: ${JSON.stringify({ token: parts[0] })}\n\n`
                        )
                      );
                    }
                    if (parts[1]) {
                      fullContent += parts[1];
                      controller.enqueue(
                        encoder.encode(
                          `event: content\ndata: ${JSON.stringify({ token: parts[1] })}\n\n`
                        )
                      );
                    }
                  } else {
                    fullThought += contentToken;
                    thinkEndTime = Date.now();
                    controller.enqueue(
                      encoder.encode(
                        `event: thought\ndata: ${JSON.stringify({ token: contentToken })}\n\n`
                      )
                    );
                  }
                } else {
                  fullContent += contentToken;
                  controller.enqueue(
                    encoder.encode(
                      `event: content\ndata: ${JSON.stringify({ token: contentToken })}\n\n`
                    )
                  );
                }
              }
            } catch {
              // Ignore non-JSON line chunks
            }
          }
        }

        const totalLatencyMs = Date.now() - startTime;
        const thoughtDurationSec = fullThought
          ? Math.max(1, Math.round(((thinkEndTime || Date.now()) - thinkStartTime) / 1000))
          : 0;
        const totalTokens = Math.max(
          1,
          Math.ceil(((fullContent + fullThought).length + JSON.stringify(messages).length) / 4)
        );

        let savedAssistantMsgId = `msg-${Date.now()}`;

        // Save assistant message to MongoDB if authenticated
        if (user && conv) {
          try {
            const assistantMsgDoc = await Message.create({
              conversationId: conv._id,
              userId: user._id,
              role: "assistant",
              content: fullContent.trim() || (fullThought ? "" : "I am ClerX AI, ready to assist you."),
              thought: fullThought.trim(),
              thoughtDurationSec,
              model: "ClerX AI",
              tokens: totalTokens,
              latencyMs: totalLatencyMs,
            });

            savedAssistantMsgId = assistantMsgDoc._id.toString();

            await Conversation.findByIdAndUpdate(conv._id, {
              $inc: { totalTokens },
              $set: { updatedAt: new Date() },
            });

            await UsageLog.create({
              userId: user._id,
              conversationId: conv._id,
              tokensUsed: totalTokens,
              model: "ClerX AI",
              endpoint: "/api/chat",
              latencyMs: totalLatencyMs,
            });

            await User.findByIdAndUpdate(user._id, {
              $inc: {
                "stats.totalMessages": 2,
                "stats.totalTokens": totalTokens,
              },
            });
          } catch (dbErr) {
            console.error("Failed to persist streaming message to DB:", dbErr);
          }
        }

        // Send final metadata event
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              messageId: savedAssistantMsgId,
              conversationId: conv ? conv._id.toString() : null,
              thoughtDurationSec,
              tokens: totalTokens,
              latencyMs: totalLatencyMs,
            })}\n\n`
          )
        );

        // Send done event
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      } catch (streamErr: any) {
        console.error("SSE stream processing error:", streamErr);
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              error: streamErr.message || "Streaming error occurred",
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
