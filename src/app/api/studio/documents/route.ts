import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import DocumentModel from "@/lib/models/Document";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const docs = await DocumentModel.find({ userId: user._id }).sort({ updatedAt: -1 }).limit(50);

    return NextResponse.json({
      success: true,
      documents: docs.map((d) => ({
        id: d._id.toString(),
        title: d.title,
        content: d.content,
        category: d.category,
        tags: d.tags,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
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

    const body = await req.json();
    const { title = "Untitled Document", content = "", category = "General", tags = [] } = body;

    await connectToDatabase();
    const newDoc = await DocumentModel.create({
      userId: user._id,
      title: title.trim(),
      content: content,
      category: category,
      tags: tags,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: newDoc._id.toString(),
        title: newDoc.title,
        content: newDoc.content,
        category: newDoc.category,
        tags: newDoc.tags,
        createdAt: newDoc.createdAt,
        updatedAt: newDoc.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
