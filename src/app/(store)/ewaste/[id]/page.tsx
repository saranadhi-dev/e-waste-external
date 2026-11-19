"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog, SuccessDialog } from "@/components/ui/modal";
import { ImageUploader } from "@/components/forms/image-uploader";
import {
  PackageIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  AlertCircleIcon,
  SaveIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";
import {
  EWASTE_CATEGORIES,
  QUANTITY_UNITS,
  ITEM_CONDITIONS,
  type EwasteEntry,
  type EwasteImage,
  type EwasteEntryInput,
} from "@/types/ewaste";
import { validateEwasteInput } from "@/lib/validations/ewaste";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EwasteDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEditMode = searchParams.get("edit") === "true";

  const [entry, setEntry] = useState<EwasteEntry | null>(null);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form edit state
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

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntry() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/ewaste/${id}`);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Failed to load entry");
        }
        const json = await res.json();
        if (json.data?.entry) {
          const e = json.data.entry;
          setEntry(e);
          setFormData({
            itemName: e.itemName,
            category: e.category,
            description: e.description,
            quantity: e.quantity,
            unit: e.unit,
            condition: e.condition,
            images: e.images || [],
            additionalNotes: e.additionalNotes || "",
          });
        }
      } catch (err: unknown) {
        console.error("Load entry error:", err);
        setError(err instanceof Error ? err.message : "Error loading entry");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEntry();
    }
  }, [id]);

  const handleChange = (field: keyof EwasteEntryInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateEwasteInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/ewaste/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update entry");
        return;
      }

      setEntry(json.data.entry);
      setIsEditing(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Update error:", err);
      setError("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/ewaste/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to delete entry");
      }
      setShowDeleteModal(false);
      router.push("/ewaste");
    } catch (err: unknown) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-card border border-border" />
      </div>
    );
  }

  if (error && !entry) {
    return (
      <Card className="border-destructive/30 py-12 text-center">
        <CardContent className="flex flex-col items-center">
          <AlertCircleIcon className="size-10 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Entry Not Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Link href="/ewaste" className="mt-6">
            <Button variant="secondary">Back to Entries</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!entry) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back button and page actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ewaste">
            <Button variant="ghost" size="icon" className="size-9" aria-label="Back">
              <ChevronLeftIcon className="size-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-page-title text-foreground">{entry.itemName}</h1>
              <Badge variant={entry.status as any}>{entry.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-secondary text-xs mt-0.5">
              ID: {entry.id} &bull; Created {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon className="size-4" />
                <span>Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="size-4" />
                <span>Delete</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  itemName: entry.itemName,
                  category: entry.category,
                  description: entry.description,
                  quantity: entry.quantity,
                  unit: entry.unit,
                  condition: entry.condition,
                  images: entry.images || [],
                  additionalNotes: entry.additionalNotes || "",
                });
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        /* Edit Form */
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Edit E-Waste Entry</CardTitle>
            <CardDescription>Update details, quantities, or uploaded photos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="edit-item-name"
                  label="Item Name *"
                  value={formData.itemName}
                  onChange={(e) => handleChange("itemName", e.target.value)}
                  error={errors.itemName}
                  required
                />

                <Select
                  id="edit-item-category"
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
                id="edit-item-description"
                label="Item Description *"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                error={errors.description}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  id="edit-item-quantity"
                  type="number"
                  min={1}
                  label="Quantity *"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  error={errors.quantity}
                  required
                />

                <Select
                  id="edit-item-unit"
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
                  id="edit-item-condition"
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
                id="edit-additional-notes"
                label="Additional Notes"
                value={formData.additionalNotes || ""}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  className="gap-2 px-6"
                >
                  <SaveIcon className="size-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Details View */
        <div className="space-y-6">
          {/* Images Section */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Uploaded Images ({entry.images?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entry.images && entry.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {entry.images.map((img, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary cursor-pointer"
                      onClick={() => setSelectedImagePreview(img.url)}
                    >
                      <img
                        src={img.url}
                        alt={`${entry.itemName} photo ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">
                        Click to view
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photos uploaded for this entry.</p>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="border-border">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">{entry.category}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {entry.quantity} {entry.unit}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Item Condition
                </p>
                <p className="mt-2 text-base font-semibold text-foreground capitalize">
                  {entry.condition}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
                {entry.description}
              </p>
            </CardContent>
          </Card>

          {/* Additional Notes Card */}
          {entry.additionalNotes && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-secondary-foreground whitespace-pre-wrap">
                  {entry.additionalNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-background p-2">
            <img
              src={selectedImagePreview}
              alt="Full preview"
              className="max-h-[85vh] max-w-full rounded object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full"
              onClick={() => setSelectedImagePreview(null)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete E-Waste Entry"
        message={`Are you sure you want to permanently delete "${entry.itemName}"? This action cannot be reversed.`}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
        onConfirm={handleDelete}
        loading={deleting}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Entry Updated"
        message="Your changes have been saved successfully."
      />
    </div>
  );
}
