import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import DocumentModel from "@/lib/models/Document";
import UsageLog from "@/lib/models/UsageLog";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const [totalConversations, totalMessages, totalDocs, usageLogs] = await Promise.all([
      Conversation.countDocuments({ userId: user._id }),
      Message.countDocuments({ userId: user._id }),
      DocumentModel.countDocuments({ userId: user._id }),
      UsageLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(100),
    ]);

    const totalTokensUsed = user.tokensUsed || 0;
    const avgLatency = usageLogs.length
      ? Math.round(usageLogs.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) / usageLogs.length)
      : 840;

    // Feature breakdown
    const featureBreakdown = {
      chat: usageLogs.filter((u) => u.feature === "chat").length,
      studio: usageLogs.filter((u) => u.feature === "studio").length,
      agent: usageLogs.filter((u) => u.feature === "agent").length,
      api: usageLogs.filter((u) => u.feature === "api").length,
    };

    return NextResponse.json({
      success: true,
      stats: {
        tokensUsed: totalTokensUsed,
        tokenLimit: user.plan === "Enterprise" ? 10000000 : user.plan === "Pro" ? 2000000 : 250000,
        totalConversations,
        totalMessages,
        totalDocuments: totalDocs,
        avgLatencyMs: avgLatency,
        plan: user.plan,
        featureBreakdown,
        recentLogs: usageLogs.slice(0, 10).map((l) => ({
          id: l._id.toString(),
          model: l.model,
          tokens: l.totalTokens,
          latencyMs: l.durationMs,
          feature: l.feature,
          createdAt: l.createdAt,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
