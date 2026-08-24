import mongoose, { Schema, Model } from "mongoose";

export interface IMessageAttachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: IMessageAttachment[];
  thought?: string;
  thoughtDurationSec?: number;
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
    attachments: {
      type: [
        {
          type: { type: String, default: "image" },
          url: { type: String, required: true },
          name: { type: String },
          size: { type: Number },
          mimeType: { type: String },
        },
      ],
      default: [],
    },
    thought: {
      type: String,
      default: "",
    },
    thoughtDurationSec: {
      type: Number,
      default: 0,
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
