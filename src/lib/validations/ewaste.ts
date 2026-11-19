import { QUANTITY_UNITS, ITEM_CONDITIONS, type QuantityUnit, type ItemCondition } from "@/types/ewaste";

export interface EwasteValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEwasteInput(data: {
  itemName?: string;
  category?: string;
  description?: string;
  quantity?: number | string;
  unit?: string;
  condition?: string;
  images?: unknown[];
  additionalNotes?: string;
}): EwasteValidationResult {
  const errors: Record<string, string> = {};

  if (!data.itemName || !data.itemName.trim()) {
    errors.itemName = "Item name is required";
  }

  if (!data.category || !data.category.trim()) {
    errors.category = "Category is required";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "Description is required";
  }

  const numQty = typeof data.quantity === "number" ? data.quantity : Number(data.quantity);
  if (isNaN(numQty) || numQty <= 0) {
    errors.quantity = "Quantity must be a positive number greater than 0";
  }

  if (!data.unit || !QUANTITY_UNITS.includes(data.unit as QuantityUnit)) {
    errors.unit = "Please select a valid unit (pieces, kg, or boxes)";
  }

  if (!data.condition || !ITEM_CONDITIONS.includes(data.condition as ItemCondition)) {
    errors.condition = "Please select a valid item condition";
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.images = "At least one image is required (up to 6 images)";
  } else if (data.images.length > 6) {
    errors.images = "A maximum of 6 images is allowed per entry";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateUploadedImageFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Invalid file format. Only JPEG, PNG, and WebP are supported.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "File size exceeds 5MB limit.";
  }
  return null;
}
