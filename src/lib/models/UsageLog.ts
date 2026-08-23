import mongoose, { Schema, Model } from "mongoose";

export interface IUsageLog {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  feature: "chat" | "studio" | "agent" | "api";
  createdAt: Date;
}

const UsageLogSchema = new Schema<IUsageLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      default: "ClerX AI",
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    feature: {
      type: String,
      enum: ["chat", "studio", "agent", "api"],
      default: "chat",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const UsageLog: Model<IUsageLog> =
  mongoose.models.UsageLog || mongoose.model<IUsageLog>("UsageLog", UsageLogSchema);

export default UsageLog;
