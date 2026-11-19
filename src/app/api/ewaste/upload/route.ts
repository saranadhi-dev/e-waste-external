import { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import { adminStorage, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { validateUploadedImageFile } from "@/lib/validations/ewaste";

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file uploaded", 400);
    }

    const fileValidationError = validateUploadedImageFile({
      type: file.type,
      size: file.size,
    });

    if (fileValidationError) {
      return apiError(fileValidationError, 400);
    }

    // Owner-scoped storage path to prevent unauthorized file access
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `ewaste/${auth.user.uid}/${timestamp}_${sanitizedName}`;

    if (isFirebaseAdminConfigured()) {
      const bucket = adminStorage.bucket();
      const storageFile = bucket.file(storagePath);

      const buffer = Buffer.from(await file.arrayBuffer());

      await storageFile.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            ownerUid: auth.user.uid,
            originalName: file.name,
          },
        },
      });

      // Get public URL or signed download URL
      const [url] = await storageFile.getSignedUrl({
        action: "read",
        expires: "03-01-2030",
      });

      return apiSuccess({
        path: storagePath,
        url,
      });
    }

    // Development/demo mode fallback: create base64 data URL for preview
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return apiSuccess({
      path: storagePath,
      url: dataUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return apiError("Failed to upload image. Please try again.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const { path } = body;

    if (!path || typeof path !== "string") {
      return apiError("Missing file path", 400);
    }

    // Security check: Must be scoped to current owner's UID
    const expectedPrefix = `ewaste/${auth.user.uid}/`;
    if (!path.startsWith(expectedPrefix)) {
      return apiError("Access denied: You cannot delete files belonging to other users", 403);
    }

    if (isFirebaseAdminConfigured()) {
      const bucket = adminStorage.bucket();
      const storageFile = bucket.file(path);
      const [exists] = await storageFile.exists();
      if (exists) {
        await storageFile.delete();
      }
    }

    return apiSuccess({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return apiError("Failed to delete image", 500);
  }
}
