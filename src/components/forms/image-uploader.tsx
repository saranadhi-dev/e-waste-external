"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, TrashIcon, AlertCircleIcon } from "@/components/ui/icons";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  validateUploadedImageFile,
} from "@/lib/validations/ewaste";
import type { EwasteImage } from "@/types/ewaste";

interface ImageUploaderProps {
  images: EwasteImage[];
  onChange: (images: EwasteImage[]) => void;
  maxImages?: number;
  error?: string;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 6,
  error,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    setUploading(true);

    const newUploadedImages: EwasteImage[] = [...images];

    try {
      for (const file of filesToUpload) {
        const validationErr = validateUploadedImageFile({
          type: file.type,
          size: file.size,
        });

        if (validationErr) {
          setUploadError(`${file.name}: ${validationErr}`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/ewaste/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Failed to upload ${file.name}`);
        }

        const json = await res.json();
        if (json.data?.url && json.data?.path) {
          newUploadedImages.push({
            path: json.data.path,
            url: json.data.url,
          });
        }
      }

      onChange(newUploadedImages);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    const target = images[index];
    if (!target) return;

    const remaining = images.filter((_, i) => i !== index);
    onChange(remaining);

    // Call server to delete storage file in background
    try {
      await fetch("/api/ewaste/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: target.path }),
      });
    } catch (err) {
      console.warn("Storage delete failed in background:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-body font-medium text-foreground">
          Item Images * ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-muted-foreground">
          JPEG, PNG, WebP up to 5MB each
        </span>
      </div>

      {(error || uploadError) && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Grid of uploaded image thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <img
                src={img.url}
                alt={`Uploaded image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute right-1.5 top-1.5 rounded-full bg-foreground/80 p-1 text-background hover:bg-destructive transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop/Button Area */}
      {images.length < maxImages && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 hover:border-foreground/40 transition-colors bg-secondary/30">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-file-input"
            disabled={uploading}
          />
          <div className="grid size-10 place-items-center rounded-full bg-secondary text-foreground">
            {uploading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <UploadIcon className="size-5" />
            )}
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {uploading ? "Uploading images through server..." : "Click to select and upload images"}
          </p>
          <p className="text-caption mt-0.5">
            You can upload between 1 and 6 photos per e-waste item
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
