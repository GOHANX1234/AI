import mongoose, { Schema, Model } from "mongoose";

export interface IRateLimit {
  _id: string;
  count: number;
  expiresAt: Date;
}

/**
 * Fixed-window rate limit counter shared across all serverless instances.
 *
 * The document `_id` is `${identifier}:${windowStart}`, so each window gets its
 * own document and increments are a single atomic `$inc` upsert. Expired
 * windows are reaped by MongoDB's TTL monitor via the `expiresAt` index.
 */
const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: MongoDB removes the document once expiresAt passes
      expires: 0,
    },
  },
  {
    versionKey: false,
    // _id is a caller-supplied string, not an ObjectId
    _id: false,
  }
);

export const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
