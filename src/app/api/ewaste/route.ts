import { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  createEwasteEntry,
  getEwasteEntriesByOwner,
  getStoreByOwner,
} from "@/lib/services/firestore";
import { validateEwasteInput } from "@/lib/validations/ewaste";
import type { EwasteEntryInput } from "@/types/ewaste";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getEwasteEntriesByOwner(auth.user.uid, {
      search,
      category,
      status,
      page,
      limit,
    });

    return apiSuccess(result);
  } catch (error) {
    console.error("Error fetching ewaste entries:", error);
    return apiError("Failed to fetch e-waste entries", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateEwasteInput(body);

    if (!validation.valid) {
      return apiError("Validation failed", 400, validation.errors);
    }

    const store = await getStoreByOwner(auth.user.uid);
    if (!store || !store.storeName?.trim()) {
      return apiError("Please setup your store to add waste entiries", 403);
    }

    const input: EwasteEntryInput = {
      itemName: body.itemName.trim(),
      category: body.category.trim(),
      description: body.description.trim(),
      quantity: Number(body.quantity),
      unit: body.unit,
      condition: body.condition,
      images: body.images,
      additionalNotes: body.additionalNotes?.trim() || "",
    };

    const entry = await createEwasteEntry(auth.user.uid, store.id!, input);
    return apiSuccess({ entry }, 201);
  } catch (error) {
    console.error("Error creating ewaste entry:", error);
    return apiError("Failed to create e-waste entry", 500);
  }
}
