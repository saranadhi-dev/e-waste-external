"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessDialog } from "@/components/ui/modal";
import { StoreIcon, AlertCircleIcon, SaveIcon } from "@/components/ui/icons";
import { validateStoreInput } from "@/lib/validations/store";
import type { StoreInput } from "@/types/store";

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
        <p className="text-secondary mt-1">
          Configure your individual store information, contact details, and collection address.
        </p>
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
              <CardDescription>
                Details used for verification and collection coordination
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="store-name"
                label="Store Name *"
                placeholder="e.g. Apex Electronics Collection"
                value={formData.storeName}
                onChange={(e) => handleChange("storeName", e.target.value)}
                error={errors.storeName}
                required
              />

              <Input
                id="owner-name"
                label="Owner Name *"
                placeholder="e.g. Jane Doe"
                value={formData.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                error={errors.ownerName}
                required
              />

              <Input
                id="store-email"
                type="email"
                label="Official Email *"
                placeholder="store@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
              />

              <Input
                id="store-phone"
                type="tel"
                label="Mobile Number *"
                placeholder="+1 555-0123"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                required
              />
            </div>

            <Input
              id="store-location"
              label="Location / Area (Optional)"
              placeholder="e.g. North Industrial District, Sector 4"
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              hint="Flexible text input prepared for Google Maps integration"
            />

            <Textarea
              id="store-address"
              label="Complete Street Address *"
              placeholder="Building number, street, landmark..."
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="store-city"
                label="City *"
                placeholder="e.g. San Jose"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                required
              />

              <Input
                id="store-state"
                label="State / Province *"
                placeholder="e.g. California"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                required
              />

              <Input
                id="store-pincode"
                label="Pincode / Postal Code *"
                placeholder="e.g. 95110"
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

      <SuccessDialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Store Profile Updated"
        message="Your store information has been saved successfully."
      />
    </div>
  );
}
