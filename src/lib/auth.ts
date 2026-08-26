import { auth, currentUser } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import User, { IUser } from "./models/User";

/**
 * Hash plain password / api key string using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get full user document from MongoDB for current Clerk session.
 * Automatically synchronizes or provisions the user record in MongoDB upon first login,
 * and keeps name & avatar synced with Clerk in real-time.
 */
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    await connectToDatabase();
    let user = await User.findOne({ clerkId });
    const clerkUser = await currentUser();

    if (!user) {
      if (!clerkUser) return null;

      const email =
        clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        `${clerkId}@clerk.user`;

      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        email.split("@")[0] ||
        "User";

      const avatar = clerkUser.imageUrl || "";

      // Check if user exists by email (e.g. from previous email signup or linked auth)
      user = await User.findOne({ email });
      if (user) {
        user.clerkId = clerkId;
        user.avatar = avatar;
        if ((!user.name || user.name === "User") && fullName) user.name = fullName;
        await user.save();
      } else {
        user = await User.create({
          clerkId,
          email,
          name: fullName,
          avatar,
          plan: "Free",
          company: "ClerX Workspace",
          role: "AI Engineer",
          tokensUsed: 0,
        });
      }
    } else if (clerkUser) {
      // Sync latest Clerk avatar and name to MongoDB in real-time
      let changed = false;
      if (clerkUser.imageUrl && user.avatar !== clerkUser.imageUrl) {
        user.avatar = clerkUser.imageUrl;
        changed = true;
      }
      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username;
      if (fullName && user.name !== fullName) {
        user.name = fullName;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
