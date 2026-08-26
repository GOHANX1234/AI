import mongoose, { Schema, Model, Document } from "mongoose";

export interface IMemory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  category: "preference" | "fact" | "work" | "tech" | "personal" | "instruction" | "general";
  isActive: boolean;
  confidence: number;
  sourceConversationId?: mongoose.Types.ObjectId;
  sourceMessage?: string;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Memory content is required"],
      trim: true,
      maxlength: [1000, "Memory content cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      enum: ["preference", "fact", "work", "tech", "personal", "instruction", "general"],
      default: "general",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    confidence: {
      type: Number,
      default: 0.9,
      min: 0,
      max: 1,
    },
    sourceConversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: false,
    },
    sourceMessage: {
      type: String,
      default: "",
      maxlength: 500,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of active memories per user
MemorySchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

export const Memory: Model<IMemory> =
  mongoose.models.Memory || mongoose.model<IMemory>("Memory", MemorySchema);

export default Memory;
