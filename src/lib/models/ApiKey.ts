import mongoose, { Schema, Model } from "mongoose";

export interface IApiKey {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  keyMask: string;
  hashedKey: string;
  status: "active" | "revoked";
  lastUsedAt?: Date;
  createdAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: "Default ClerX API Key",
    },
    keyMask: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
