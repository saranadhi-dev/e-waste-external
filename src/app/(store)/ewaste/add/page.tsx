"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, SuccessDialog } from "@/components/ui/modal";
import { ImageUploader } from "@/components/forms/image-uploader";
import { PackageIcon, AlertCircleIcon, ArrowRightIcon } from "@/components/ui/icons";
import {
  EWASTE_CATEGORIES,
  QUANTITY_UNITS,
  ITEM_CONDITIONS,
  type EwasteEntryInput,
  type EwasteImage,
} from "@/types/ewaste";
import { validateEwasteInput } from "@/lib/validations/ewaste";

export default function AddEwastePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<EwasteEntryInput>({
    itemName: "",
    category: EWASTE_CATEGORIES[0],
    description: "",
    quantity: 1,
    unit: "pieces",
    condition: "working",
    images: [],
    additionalNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStoreSetupModal, setShowStoreSetupModal] = useState(false);

  const handleChange = (field: keyof EwasteEntryInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateEwasteInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/ewaste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403 && json.error === "Please setup your store to add waste entiries") {
          setShowStoreSetupModal(true);
          return;
        }
        setServerError(json.error || "Failed to submit entry");
        return;
      }

      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Submit e-waste error:", err);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Add New Entry</h1>
        </div>
        <Link href="/ewaste">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
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
              <PackageIcon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Item Specification</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="item-name"
                label="Item Name *"
                value={formData.itemName}
                onChange={(e) => handleChange("itemName", e.target.value)}
                error={errors.itemName}
                required
              />

              <Select
                id="item-category"
                label="Category *"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                error={errors.category}
                required
              >
                {EWASTE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              id="item-description"
              label="Item Description *"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={errors.description}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="item-quantity"
                type="number"
                min={1}
                label="Quantity *"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                error={errors.quantity}
                required
              />

              <Select
                id="item-unit"
                label="Quantity Unit *"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                error={errors.unit}
                required
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u.toUpperCase()}
                  </option>
                ))}
              </Select>

              <Select
                id="item-condition"
                label="Condition *"
                value={formData.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                error={errors.condition}
                required
              >
                {ITEM_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <ImageUploader
              images={formData.images}
              onChange={(imgs: EwasteImage[]) => handleChange("images", imgs)}
              error={errors.images}
            />

            <Textarea
              id="additional-notes"
              label="Additional Notes (Optional)"
              value={formData.additionalNotes || ""}
              onChange={(e) => handleChange("additionalNotes", e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/ewaste">
                <Button variant="secondary" type="button" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="gap-2 px-6"
              >
                <span>Submit Entry</span>
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SuccessDialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Entry Submitted"
        message="Your e-waste collection entry has been registered successfully with Pending status."
        onConfirm={() => router.push("/ewaste")}
      />

      <Modal
        open={showStoreSetupModal}
        onOpenChange={setShowStoreSetupModal}
        title="Store setup required"
        description="Please setup your store to add waste entiries"
        actions={[{
          label: "Setup store",
          onClick: () => router.push("/settings"),
        }]}
      />
    </div>
  );
}
