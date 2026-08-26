import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  getAllUserMemories,
  addManualMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories,
} from "@/lib/memory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/memory
 * Retrieves all memories, memoryEnabled status, and custom instructions for authenticated user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const dbUser = await User.findById(user._id);

    const memories = await getAllUserMemories(user._id);

    return NextResponse.json({
      memories,
      memoryEnabled: dbUser?.memoryEnabled !== false,
      customInstructions: dbUser?.customInstructions || {
        enabled: true,
        whatToKnow: "",
        howToRespond: "",
      },
    });
  } catch (err: any) {
    console.error("GET /api/memory error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve memories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory
 * Adds a new manual memory or updates settings
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, content, category, memoryEnabled, customInstructions } = body;

    await connectToDatabase();

    // Action: Update user memory settings or custom instructions
    if (action === "update-settings") {
      const updateObj: any = {};
      if (typeof memoryEnabled === "boolean") {
        updateObj.memoryEnabled = memoryEnabled;
      }
      if (customInstructions) {
        updateObj.customInstructions = {
          enabled: customInstructions.enabled !== false,
          whatToKnow: (customInstructions.whatToKnow || "").slice(0, 1500),
          howToRespond: (customInstructions.howToRespond || "").slice(0, 1500),
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateObj },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        memoryEnabled: updatedUser?.memoryEnabled !== false,
        customInstructions: updatedUser?.customInstructions,
      });
    }

    // Action: Add new memory manually
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Memory content cannot be empty" },
        { status: 400 }
      );
    }

    const newMemory = await addManualMemory(
      user._id,
      content.trim(),
      category || "general"
    );

    return NextResponse.json({ success: true, memory: newMemory });
  } catch (err: any) {
    console.error("POST /api/memory error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save memory" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/memory
 * Update a specific memory or toggle active status
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, content, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (typeof content === "string") updates.content = content.trim();
    if (typeof category === "string") updates.category = category;
    if (typeof isActive === "boolean") updates.isActive = isActive;

    const ok = await updateMemory(user._id, id, updates);
    if (!ok) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/memory error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update memory" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memory
 * Delete single memory (?id=...) or clear all memories (?all=true)
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    if (all === "true") {
      const count = await clearAllMemories(user._id);
      return NextResponse.json({ success: true, cleared: count });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID or 'all=true' required" },
        { status: 400 }
      );
    }

    const ok = await deleteMemory(user._id, id);
    if (!ok) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/memory error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete memory" },
      { status: 500 }
    );
  }
}
