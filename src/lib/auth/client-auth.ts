import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
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

/**
 * Register a new user with email & password, establish server session, and create user document
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
    const idToken = await credential.user.getIdToken();

    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, fullName, email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to establish server session");
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
