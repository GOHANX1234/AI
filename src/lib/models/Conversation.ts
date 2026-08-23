import mongoose, { Schema, Model } from "mongoose";

export interface IConversation {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  model: string;
  systemPrompt?: string;
  pinned: boolean;
  lastMessage?: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Chat",
    },
    model: {
      type: String,
      default: "ClerX AI",
    },
    systemPrompt: {
      type: String,
      default: "You are ClerX AI, a helpful, intelligent, versatile, and precise AI assistant.",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
