import { cookies } from "next/headers";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { UserSession } from "@/types/auth";

export const SESSION_COOKIE_NAME = "__session";
// 5 days in milliseconds
export const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

export interface SessionCookieOptions {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
}

export function getSessionCookieOptions(value: string, maxAge = SESSION_EXPIRES_IN / 1000): SessionCookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value,
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

/**
 * Creates a Firebase session cookie from an ID token.
 */
export async function createSessionFromIdToken(idToken: string): Promise<string> {
  if (isFirebaseAdminConfigured()) {
    return await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN,
    });
  }

  // Fallback for development without configured credentials
  // Encode dummy session token with payload
  const demoPayload = {
    uid: idToken.startsWith("demo-") ? idToken : `user_${Date.now()}`,
    email: "storeowner@example.com",
    created: Date.now(),
  };
  return Buffer.from(JSON.stringify(demoPayload)).toString("base64url");
}

/**
 * Verifies a session cookie string and returns the user session.
 */
export async function verifySession(sessionCookie: string): Promise<UserSession | null> {
  if (!sessionCookie) return null;

  if (isFirebaseAdminConfigured()) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email || "",
        name: decodedClaims.name || "",
      };
    } catch (error) {
      console.error("Session verification failed:", error);
      return null;
    }
  }

  // Development fallback for unconfigured environment
  try {
    const raw = Buffer.from(sessionCookie, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.uid) {
      return {
        uid: parsed.uid,
        email: parsed.email || "storeowner@example.com",
        name: parsed.name || "Store Owner",
      };
    }
  } catch {
    // invalid token
  }

  return null;
}

/**
 * Helper to get the current verified user session from Next.js server context.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return await verifySession(sessionCookie);
}
