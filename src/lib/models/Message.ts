import mongoose, { Schema, Model } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokens?: number;
  latencyMs?: number;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: "ClerX AI",
    },
    tokens: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
