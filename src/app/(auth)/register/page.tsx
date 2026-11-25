"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecycleIcon, AlertCircleIcon } from "@/components/ui/icons";
import { registerWithEmail } from "@/lib/auth/client-auth";
import { validateRegistration } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateRegistration({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await registerWithEmail({ fullName, email, password });
      router.push("/login");
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      const message =
        err instanceof Error
          ? err.message.replace("Firebase: ", "")
          : "Registration failed. Please try again.";
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
        <CardTitle className="text-xl font-bold tracking-tight">Register Store Owner</CardTitle>
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
            id="reg-fullname"
            type="text"
            label="Full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
            }}
            error={errors.fullName}
            required
            autoComplete="name"
          />

          <Input
            id="reg-email"
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

          <Input
            id="reg-password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <Input
            id="reg-confirm-password"
            type="password"
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
