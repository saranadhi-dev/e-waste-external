import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import { auth, isFirebaseClientConfigured } from "@/lib/firebase/client";

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface VerificationLinkParams {
  user?: User;
  actionCodeSettings?: ActionCodeSettings;
}

export const EMAIL_NOT_VERIFIED_ERROR =
  "Your email isn't verified check registered email inbox or click resend verify link";

/** Send an email verification link for the supplied user or the current user. */
export async function sendVerificationLink({
  user = auth.currentUser ?? undefined,
  actionCodeSettings,
}: VerificationLinkParams = {}) {
  if (!isFirebaseClientConfigured()) return true;
  if (!user) throw new Error("No authenticated user is available for email verification");

  await sendEmailVerification(user, actionCodeSettings);
  return true;
}

/** Re-authenticate only long enough to resend a verification link. */
export async function resendVerificationLink({ email, password }: LoginParams) {
  if (!isFirebaseClientConfigured()) return true;

  const credential = await signInWithEmailAndPassword(auth, email, password);
  try {
    if (credential.user.emailVerified) return true;
    return await sendVerificationLink({ user: credential.user });
  } finally {
    await signOut(auth);
  }
}

/**
 * Register a new user and send a verification link. Unverified users stay signed out.
 */
export async function registerWithEmail({ fullName, email, password }: RegisterParams) {
  if (!isFirebaseClientConfigured()) {
    // Development/demo fallback
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken: `demo-${encodeURIComponent(email)}`,
        fullName,
        email,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create server session");
    }
    return { uid: `demo-${encodeURIComponent(email)}`, email, fullName };
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (credential.user) {
    await updateProfile(credential.user, { displayName: fullName });
    try {
      await sendVerificationLink({ user: credential.user });
    } finally {
      await signOut(auth);
    }
  }

  return credential.user;
}

/**
 * Log in with email & password, obtain ID token, and exchange for server session cookie
 */
export async function loginWithEmail({ email, password }: LoginParams) {
  if (!isFirebaseClientConfigured()) {
    // Development/demo fallback
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken: `demo-${encodeURIComponent(email)}`,
        email,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create server session");
    }
    return { uid: `demo-${encodeURIComponent(email)}`, email };
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!credential.user.emailVerified) {
    try {
      await sendVerificationLink({ user: credential.user });
    } finally {
      await signOut(auth);
    }
    throw new Error(EMAIL_NOT_VERIFIED_ERROR);
  }
  const idToken = await credential.user.getIdToken();

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to establish server session");
  }

  return credential.user;
}

/**
 * Log out user: clears server session cookie and signs out of Firebase client
 */
export async function logoutUser() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Failed to clear server session:", err);
  }

  if (isFirebaseClientConfigured()) {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }
  }
}

/**
 * Trigger Firebase password reset email
 */
export async function resetPassword(email: string) {
  if (!isFirebaseClientConfigured()) {
    // Simulate success in demo mode
    return true;
  }
  await sendPasswordResetEmail(auth, email);
  return true;
}
