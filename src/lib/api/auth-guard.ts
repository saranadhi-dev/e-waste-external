import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth/session";
import type { UserSession } from "@/types/auth";
import { apiError } from "./response";

export type AuthResult =
  | { user: UserSession; errorResponse?: never }
  | { user?: never; errorResponse: ReturnType<typeof apiError> };

export async function authenticateApiRequest(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return {
      errorResponse: apiError("Authentication required. Please log in.", 401),
    };
  }

  const user = await verifySession(sessionCookie);
  if (!user || !user.uid) {
    return {
      errorResponse: apiError("Session expired or invalid. Please log in again.", 401),
    };
  }

  return { user };
}
