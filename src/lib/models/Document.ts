import mongoose, { Schema, Model } from "mongoose";

export interface IDocument {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
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
      default: "Untitled Document",
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel: Model<IDocument> =
  mongoose.models.DocumentModel || mongoose.model<IDocument>("DocumentModel", DocumentSchema);

export default DocumentModel;
