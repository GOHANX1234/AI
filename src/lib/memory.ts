import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";
import Memory, { IMemory } from "./models/Memory";
import User, { IUser } from "./models/User";
import { createChatCompletion, DEFAULT_SYSTEM_PROMPT } from "./openrouter";

export interface MemoryItem {
  id: string;
  content: string;
  category: "preference" | "fact" | "work" | "tech" | "personal" | "instruction" | "general";
  isActive: boolean;
  sourceMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMemorySettings {
  memoryEnabled: boolean;
  customInstructions: {
    enabled: boolean;
    whatToKnow: string;
    howToRespond: string;
  };
}

/**
 * Fetch all active memories for a given user
 */
export async function getUserMemories(
  userId: mongoose.Types.ObjectId | string,
  limit = 50
): Promise<IMemory[]> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  return Memory.find({ userId: uid, isActive: true })
    .sort({ updatedAt: -1 })
    .limit(limit);
}

/**
 * Fetch all memories (active and inactive) for the memory manager UI
 */
export async function getAllUserMemories(
  userId: mongoose.Types.ObjectId | string
): Promise<MemoryItem[]> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const memories = await Memory.find({ userId: uid }).sort({ updatedAt: -1 });

  return memories.map((m) => ({
    id: m._id.toString(),
    content: m.content,
    category: m.category,
    isActive: m.isActive,
    sourceMessage: m.sourceMessage,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

/**
 * Synthesizes persistent memories and custom instructions into a personalized system prompt
 */
export async function getPersonalizedSystemPrompt(
  userId: mongoose.Types.ObjectId | string | null,
  basePersona?: string
): Promise<{ systemPrompt: string; memoryCount: number }> {
  const fallbackPrompt = basePersona || DEFAULT_SYSTEM_PROMPT;
  if (!userId) {
    return { systemPrompt: fallbackPrompt, memoryCount: 0 };
  }

  try {
    await connectToDatabase();
    const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const user = await User.findById(uid);

    if (!user) {
      return { systemPrompt: fallbackPrompt, memoryCount: 0 };
    }

    const memoryEnabled = user.memoryEnabled !== false;
    let memoryBlock = "";
    let memoriesCount = 0;

    if (memoryEnabled) {
      const activeMemories = await getUserMemories(uid, 30);
      memoriesCount = activeMemories.length;

      if (activeMemories.length > 0) {
        const memoryBullets = activeMemories
          .map((m) => `• [${m.category}] ${m.content}`)
          .join("\n");

        memoryBlock = `
[USER MEMORY & LONG-TERM CONTEXT]
You have memory enabled. The following facts, technical background, project details, and personal preferences have been learned about this user from previous conversations:
${memoryBullets}

Guideline for using memories:
- Naturally personalize your code samples, explanations, and advice to match these preferences.
- You do not need to constantly say "According to my memory" or "I remember that"; simply deliver intelligent, context-aware responses as if you are a long-term collaborator.
- If the user asks what you remember about them or asks you to recall something, reference these memories accurately.`;
      }
    }

    // Custom Instructions
    let customInstructionsBlock = "";
    if (user.customInstructions?.enabled !== false) {
      const { whatToKnow, howToRespond } = user.customInstructions || {};
      if (whatToKnow?.trim() || howToRespond?.trim()) {
        customInstructionsBlock = `
[USER CUSTOM INSTRUCTIONS]
The user provided explicit instructions for how they want you to interact:
${whatToKnow?.trim() ? `• What you should know about the user: "${whatToKnow.trim()}"` : ""}
${howToRespond?.trim() ? `• How the user prefers you to respond: "${howToRespond.trim()}"` : ""}
Follow these instructions strictly in all answers.`;
      }
    }

    const fullPrompt = [
      fallbackPrompt,
      memoryBlock,
      customInstructionsBlock,
    ]
      .filter(Boolean)
      .join("\n\n");

    return { systemPrompt: fullPrompt, memoryCount: memoriesCount };
  } catch (err) {
    console.error("Error generating personalized prompt:", err);
    return { systemPrompt: fallbackPrompt, memoryCount: 0 };
  }
}

/**
 * Automatically extracts new lasting facts/preferences from the conversation turn
 * and saves them persistently to MongoDB without duplicates.
 */
export async function extractAndSaveMemories(
  userId: mongoose.Types.ObjectId | string,
  userMessage: string,
  assistantResponse: string,
  conversationId?: string | mongoose.Types.ObjectId
): Promise<Array<{ id: string; content: string; category: string }>> {
  try {
    if (!userMessage || userMessage.trim().length < 5) return [];

    await connectToDatabase();
    const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const user = await User.findById(uid);

    if (!user || user.memoryEnabled === false) return [];

    // Skip generic short greetings or simple commands
    const cleanUserMsg = userMessage.trim();
    const isTrivial =
      /^(hi|hello|hey|test|thanks|thank you|ok|okay|yes|no|good|bye|cool|what is|how to)\b/i.test(
        cleanUserMsg
      ) && cleanUserMsg.length < 25;
    if (isTrivial) return [];

    // Fetch existing memories to avoid duplicate extraction
    const existing = await Memory.find({ userId: uid, isActive: true });
    const existingSummary = existing.map((m) => `- ${m.content}`).join("\n");

    const extractionPrompt = `You are the Memory Extraction Engine for ClerX AI.
Analyze the user's input and extract any NEW, enduring, useful facts, background, work details, technical preferences, or explicit instructions that should be remembered about the user across future sessions.

User Message: "${cleanUserMsg.slice(0, 1500)}"
Assistant Reply Summary: "${(assistantResponse || "").slice(0, 300)}"

Existing Memories Already Stored:
${existingSummary || "(None yet)"}

Extraction Rules:
1. ONLY extract meaningful, persistent information (e.g. tech stack, job role, project context, specific preferences, tools used, coding conventions, personal facts).
2. DO NOT extract transient queries, one-off questions, or conversational filler.
3. DO NOT repeat or re-extract facts that are already in "Existing Memories".
4. If the user explicitly says "Remember that..." or "I prefer...", always extract it.
5. If the user asks to forget something or no new facts exist, return an empty array [].
6. Output MUST be valid JSON only.

JSON Output Schema:
[
  {
    "content": "Short, concise 3rd person factual statement (e.g. 'Uses Next.js 16 and TypeScript for web projects')",
    "category": "preference" | "fact" | "work" | "tech" | "personal" | "instruction" | "general"
  }
]`;

    const completion = await createChatCompletion(
      [{ role: "user", content: extractionPrompt }],
      { temperature: 0.1, maxTokens: 400 }
    );

    let raw = completion.content.trim();
    // Strip possible markdown code fences
    if (raw.startsWith("```json")) raw = raw.slice(7);
    if (raw.startsWith("```")) raw = raw.slice(3);
    if (raw.endsWith("```")) raw = raw.slice(0, -3);
    raw = raw.trim();

    if (!raw.startsWith("[") || !raw.endsWith("]")) {
      return [];
    }

    const parsed: Array<{ content: string; category?: string }> = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    const savedMemories: Array<{ id: string; content: string; category: string }> = [];

    for (const item of parsed) {
      if (!item.content || typeof item.content !== "string") continue;
      const cleanContent = item.content.trim();
      if (cleanContent.length < 5) continue;

      // Check if already exists (fuzzy / normalized check)
      const normalized = cleanContent.toLowerCase().replace(/[^a-z0-9]/g, "");
      const isDuplicate = existing.some(
        (ex) =>
          ex.content.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
          ex.content.toLowerCase().includes(cleanContent.toLowerCase()) ||
          cleanContent.toLowerCase().includes(ex.content.toLowerCase())
      );

      if (isDuplicate) {
        // Just update timestamp on existing
        const matched = existing.find(
          (ex) =>
            ex.content.toLowerCase().includes(cleanContent.toLowerCase()) ||
            cleanContent.toLowerCase().includes(ex.content.toLowerCase())
        );
        if (matched) {
          matched.lastAccessedAt = new Date();
          await matched.save();
        }
        continue;
      }

      const validCategory = [
        "preference",
        "fact",
        "work",
        "tech",
        "personal",
        "instruction",
        "general",
      ].includes(item.category || "")
        ? (item.category as any)
        : "general";

      const created = await Memory.create({
        userId: uid,
        content: cleanContent,
        category: validCategory,
        isActive: true,
        confidence: 0.95,
        sourceConversationId:
          conversationId && mongoose.Types.ObjectId.isValid(conversationId.toString())
            ? new mongoose.Types.ObjectId(conversationId.toString())
            : undefined,
        sourceMessage: cleanUserMsg.slice(0, 300),
        lastAccessedAt: new Date(),
      });

      savedMemories.push({
        id: created._id.toString(),
        content: created.content,
        category: created.category,
      });
    }

    return savedMemories;
  } catch (err) {
    console.error("Memory extraction error:", err);
    return [];
  }
}

/**
 * Manually add a memory from the UI
 */
export async function addManualMemory(
  userId: mongoose.Types.ObjectId | string,
  content: string,
  category: string = "general"
): Promise<MemoryItem> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const validCategory = [
    "preference",
    "fact",
    "work",
    "tech",
    "personal",
    "instruction",
    "general",
  ].includes(category)
    ? (category as any)
    : "general";

  const created = await Memory.create({
    userId: uid,
    content: content.trim(),
    category: validCategory,
    isActive: true,
    confidence: 1.0,
    sourceMessage: "Manually added by user",
    lastAccessedAt: new Date(),
  });

  return {
    id: created._id.toString(),
    content: created.content,
    category: created.category,
    isActive: created.isActive,
    sourceMessage: created.sourceMessage,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

/**
 * Update a memory's content, category, or active status
 */
export async function updateMemory(
  userId: mongoose.Types.ObjectId | string,
  memoryId: string,
  updates: { content?: string; category?: string; isActive?: boolean }
): Promise<boolean> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const res = await Memory.findOneAndUpdate(
    { _id: memoryId, userId: uid },
    { $set: updates },
    { new: true }
  );
  return Boolean(res);
}

/**
 * Delete a specific memory
 */
export async function deleteMemory(
  userId: mongoose.Types.ObjectId | string,
  memoryId: string
): Promise<boolean> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const res = await Memory.findOneAndDelete({ _id: memoryId, userId: uid });
  return Boolean(res);
}

/**
 * Clear all memories for a user
 */
export async function clearAllMemories(
  userId: mongoose.Types.ObjectId | string
): Promise<number> {
  await connectToDatabase();
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const res = await Memory.deleteMany({ userId: uid });
  return res.deletedCount || 0;
}
