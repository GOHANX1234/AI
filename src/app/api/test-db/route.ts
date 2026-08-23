import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    const startTime = Date.now();
    await connectToDatabase();
    const pingTime = Date.now() - startTime;
    const dbState = mongoose.connection.readyState;

    return NextResponse.json({
      status: "online",
      database: "MongoDB Atlas (x_db)",
      connectionState: dbState === 1 ? "connected" : "connecting",
      pingMs: pingTime,
      timestamp: new Date().toISOString(),
      service: "ClerX AI Backend",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "offline",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
