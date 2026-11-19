import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionFromIdToken,
  getSessionCookieOptions,
  getCurrentUser,
} from "@/lib/auth/session";
import {
  createOrUpdateUserDocument,
  getUserDocument,
} from "@/lib/services/firestore";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, fullName, email } = body;

    if (!idToken) {
      return apiError("Missing ID token", 400);
    }

    const sessionCookie = await createSessionFromIdToken(idToken);
    const cookieStore = await cookies();
    const cookieOpts = getSessionCookieOptions(sessionCookie);

    cookieStore.set(cookieOpts.name, cookieOpts.value, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      maxAge: cookieOpts.maxAge,
      path: cookieOpts.path,
    });

    // If registration or profile info is provided, ensure user document exists
    const userSession = await getCurrentUser();
    if (userSession?.uid) {
      await createOrUpdateUserDocument(
        userSession.uid,
        email || userSession.email,
        fullName || userSession.name
      );
    }

    return apiSuccess({
      message: "Session created successfully",
      user: userSession,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return apiError("Failed to create authenticated session", 500);
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const profile = await getUserDocument(user.uid);

    return apiSuccess({
      user: {
        uid: user.uid,
        email: user.email,
        fullName: profile?.fullName || user.name || "Store Owner",
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return apiError("Failed to verify session", 500);
  }
}
