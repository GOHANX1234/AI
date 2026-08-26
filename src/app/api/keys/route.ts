import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import ApiKey from "@/lib/models/ApiKey";
import crypto from "crypto";
import { checkRateLimitDurable, rateLimitResponse } from "@/lib/rateLimitDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Key creation involves a bcrypt hash and should never be issued in bulk.
const KEY_CREATE_RATE_LIMIT = 10;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const keys = await ApiKey.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      keys: keys.map((k) => ({
        id: k._id.toString(),
        name: k.name,
        keyMask: k.keyMask,
        status: k.status,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const limit = await checkRateLimitDurable(
      `keys:create:${user._id.toString()}`,
      KEY_CREATE_RATE_LIMIT,
      60_000
    );
    if (!limit.success) return rateLimitResponse(limit);

    const body = await req.json().catch(() => ({}));
    const { name = "Production API Key" } = body;

    // Generate random secure key
    const rawSecret = crypto.randomBytes(24).toString("hex");
    const fullApiKey = `cx_live_${rawSecret}`;
    const keyMask = `cx_live_${rawSecret.substring(0, 4)}••••••••${rawSecret.substring(rawSecret.length - 4)}`;
    const hashedKey = await hashPassword(fullApiKey);

    await connectToDatabase();
    const createdKey = await ApiKey.create({
      userId: user._id,
      name: name.trim(),
      keyMask: keyMask,
      hashedKey: hashedKey,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      apiKey: fullApiKey, // Only revealed once upon creation
      keyInfo: {
        id: createdKey._id.toString(),
        name: createdKey.name,
        keyMask: createdKey.keyMask,
        status: createdKey.status,
        createdAt: createdKey.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) return NextResponse.json({ error: "Key ID required" }, { status: 400 });

    await connectToDatabase();
    await ApiKey.findOneAndDelete({ _id: keyId, userId: user._id });

    return NextResponse.json({ success: true, message: "API Key revoked successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
