import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { connectToDatabase } from "./mongodb";
import User, { IUser } from "./models/User";

const JWT_SECRET = process.env.JWT_SECRET || "clerx_ai_super_secret_jwt_key_2026_x984920491823901823908";
const key = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "clerx_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  plan?: string;
  exp?: number;
}

/**
 * Hash plain password using bcryptjs
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
 * Sign a JWT token using jose
 */
export async function signToken(payload: { userId: string; email: string; name: string; plan?: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get authenticated user payload from server-side cookies
 */
export async function getSessionUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Get full user document from MongoDB for current session
 */
export async function getCurrentUser(): Promise<IUser | null> {
  const session = await getSessionUser();
  if (!session || !session.userId) return null;

  await connectToDatabase();
  const user = await User.findById(session.userId).select("-password");
  return user;
}

/**
 * Extract token from NextRequest in middleware or route handlers
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}
