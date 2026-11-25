"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { RecycleIcon, AlertCircleIcon } from "@/components/ui/icons";
import {
  loginWithEmail,
  resendVerificationLink,
  EMAIL_NOT_VERIFIED_ERROR,
} from "@/lib/auth/client-auth";
import { validateLogin } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await loginWithEmail({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const message =
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Invalid email or password. Please try again.";
      setServerError(message);
      setShowVerificationModal(message === EMAIL_NOT_VERIFIED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-border shadow-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <RecycleIcon className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Store Owner Login</CardTitle>
      </CardHeader>

      <CardContent>
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="login-email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="text-body font-medium text-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have a store account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Register Store
          </Link>
        </div>
      </CardContent>
      </Card>

      <Modal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        title="Email verification required"
        description={EMAIL_NOT_VERIFIED_ERROR}
        actions={[
          {
            label: "Resend verify link",
            loading: resendingVerification,
            onClick: async () => {
              setResendingVerification(true);
              try {
                await resendVerificationLink({ email, password });
                setShowVerificationModal(false);
                setServerError("A new verification link has been sent to your email.");
              } catch (err: unknown) {
                setServerError(
                  err instanceof Error ? err.message.replace("Firebase: ", "") : "Unable to resend verification link.",
                );
              } finally {
                setResendingVerification(false);
              }
            },
          },
        ]}
      />
    </>
  );
}
