import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bayef85829_db_user:B19PExYFETX7O7lU@cluster0.bazlqbd.mongodb.net/x_db?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log(" Connected to MongoDB Atlas (ClerX DB)");
      return m;
    }).catch((err) => {
      console.error(" MongoDB connection error:", err);
      cached!.promise = null;
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
