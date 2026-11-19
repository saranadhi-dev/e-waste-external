import { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteEwasteEntry,
  getEwasteEntryById,
  updateEwasteEntry,
} from "@/lib/services/firestore";
import { validateEwasteInput } from "@/lib/validations/ewaste";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  if (!id) return apiError("Missing entry ID", 400);

  try {
    const entry = await getEwasteEntryById(id, auth.user.uid);
    if (!entry) {
      return apiError("Entry not found or access denied", 404);
    }

    return apiSuccess({ entry });
  } catch (error) {
    console.error("Error fetching entry:", error);
    return apiError("Failed to fetch e-waste entry", 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  if (!id) return apiError("Missing entry ID", 400);

  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateEwasteInput(body);

    if (!validation.valid) {
      return apiError("Validation failed", 400, validation.errors);
    }

    const updated = await updateEwasteEntry(id, auth.user.uid, {
      itemName: body.itemName.trim(),
      category: body.category.trim(),
      description: body.description.trim(),
      quantity: Number(body.quantity),
      unit: body.unit,
      condition: body.condition,
      images: body.images,
      additionalNotes: body.additionalNotes?.trim() || "",
    });

    if (!updated) {
      return apiError("Entry not found or access denied", 404);
    }

    return apiSuccess({ entry: updated });
  } catch (error) {
    console.error("Error updating entry:", error);
    return apiError("Failed to update e-waste entry", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  if (!id) return apiError("Missing entry ID", 400);

  try {
    const deleted = await deleteEwasteEntry(id, auth.user.uid);
    if (!deleted) {
      return apiError("Entry not found or access denied", 404);
    }

    return apiSuccess({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return apiError("Failed to delete e-waste entry", 500);
  }
}
