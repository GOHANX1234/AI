import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createChatCompletion, DEFAULT_MODEL } from "@/lib/openrouter";
import User from "@/lib/models/User";
import UsageLog from "@/lib/models/UsageLog";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, text, instruction, model = DEFAULT_MODEL } = body;

    if (!text && !instruction) {
      return NextResponse.json({ error: "Text or instruction is required" }, { status: 400 });
    }

    let prompt = "";
    let system = "You are ClerX AI Studio Copilot, an elite technical editor, synthesizer, and code engineer.";

    switch (action) {
      case "summarize":
        prompt = `Please provide a clear, high-impact executive summary of the following text with key bullet points and conclusions:\n\n${text}`;
        break;
      case "expand":
        prompt = `Expand in rich detail, add technical precision, practical examples, and comprehensive structure to the following text:\n\n${text}`;
        break;
      case "rewrite":
        prompt = `Rewrite the following text to make it extremely clear, polished, professional, and engaging:\n\n${text}`;
        break;
      case "fix-code":
        prompt = `Analyze the following code, find any bugs/edge-cases, refactor for optimal performance, and provide the corrected code with explanatory comments:\n\n${text}`;
        break;
      case "generate-tests":
        prompt = `Generate comprehensive unit and integration test suites with edge cases for the following code:\n\n${text}`;
        break;
      case "translate-code":
        prompt = `Convert the following code into ${instruction || "TypeScript"} following best modern design practices:\n\n${text}`;
        break;
      case "custom":
      default:
        prompt = `${instruction || "Improve and build upon the following content"}:\n\n${text}`;
        break;
    }

    const aiResult = await createChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      { model, temperature: 0.5 }
    );

    await connectToDatabase();
    await User.findByIdAndUpdate(user._id, {
      $inc: { tokensUsed: aiResult.tokens },
    });

    await UsageLog.create({
      userId: user._id,
      model: aiResult.model,
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(aiResult.content.length / 4),
      totalTokens: aiResult.tokens,
      durationMs: aiResult.latencyMs,
      feature: "studio",
    });

    return NextResponse.json({
      success: true,
      result: aiResult.content,
      model: aiResult.model,
      tokens: aiResult.tokens,
      latencyMs: aiResult.latencyMs,
    });
  } catch (error: any) {
    console.error("Studio generate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
