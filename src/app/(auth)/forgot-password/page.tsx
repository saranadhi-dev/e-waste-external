"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecycleIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/ui/icons";
import { resetPassword } from "@/lib/auth/client-auth";
import { validateEmail } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const message =
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Unable to send password reset email. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <RecycleIcon className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Reset Password</CardTitle>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <CheckCircleIcon className="size-5 shrink-0 text-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Password reset email sent</p>
                <p className="mt-1 text-muted-foreground">
                  If an account exists for <span className="font-semibold text-foreground">{email}</span>,
                  you will receive an email with instructions to reset your password.
                </p>
              </div>
            </div>

            <Link href="/login" className="block w-full">
              <Button variant="primary" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <Input
              id="reset-email"
              type="email"
              label="Registered email address"
              placeholder="storeowner@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
            >
              Send Reset Instructions
            </Button>

            <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
              >
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
