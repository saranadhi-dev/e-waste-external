"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessDialog } from "@/components/ui/modal";
import { StoreIcon, AlertCircleIcon, SaveIcon, LogOutIcon } from "@/components/ui/icons";
import { validateStoreInput } from "@/lib/validations/store";
import type { StoreInput } from "@/types/store";
import { logoutUser } from "@/lib/auth/client-auth";
import { useRouter } from "next/navigation";

export default function StoreSettingsPage() {
  const [formData, setFormData] = useState<StoreInput>({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        const res = await fetch("/api/store");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.store) {
            const s = json.data.store;
            setFormData({
              storeName: s.storeName || "",
              ownerName: s.ownerName || "",
              email: s.email || "",
              phone: s.phone || "",
              location: s.location || "",
              address: s.address || "",
              city: s.city || "",
              state: s.state || "",
              pincode: s.pincode || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load store profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  const handleChange = (field: keyof StoreInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateStoreInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error || "Failed to update store details");
        return;
      }

      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Save store error:", err);
      setServerError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="border-border">
          <CardContent className="p-8 space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-page-title text-foreground">Store Profile & Settings</h1>
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-secondary text-foreground">
              <StoreIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Store Information</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="store-name"
                label="Store Name *"
                value={formData.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                error={errors.storeName}
                required
              />

              <Input
                id="owner-name"
                label="Owner Name *"
                value={formData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                error={errors.ownerName}
                required
              />

              <Input
                id="store-email"
                type="email"
                label="Official Email *"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
              />

              <Input
                id="store-phone"
                type="tel"
                label="Mobile Number *"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                required
              />
            </div>

            <Input
              id="store-location"
              label="Location / Area (Optional)"
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              hint="Flexible text input prepared for Google Maps integration"
            />

            <Textarea
              id="store-address"
              label="Complete Street Address *"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="store-city"
                label="City *"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                required
              />

              <Input
                id="store-state"
                label="State / Province *"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                required
              />

              <Input
                id="store-pincode"
                label="Pincode / Postal Code *"
                value={formData.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                error={errors.pincode}
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                className="gap-2 px-6"
              >
                <SaveIcon className="size-4" />
                <span>Save Store Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-2">
        <div>
          <p className="text-sm font-medium text-foreground">Sign out</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You can sign back in anytime using your account credentials.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleLogout}
          className="w-full gap-2 sm:w-auto"
        >
          <LogOutIcon className="size-4" />
          <span>Sign out</span>
        </Button>
      </div>

      <SuccessDialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Store Profile Updated"
        message="Your store information has been saved successfully."
      />
    </div>
  );
}
