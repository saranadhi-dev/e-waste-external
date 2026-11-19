import { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getStoreByOwner, saveStoreProfile } from "@/lib/services/firestore";
import { validateStoreInput } from "@/lib/validations/store";
import type { StoreInput } from "@/types/store";

export async function GET() {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const store = await getStoreByOwner(auth.user.uid);
    return apiSuccess({ store });
  } catch (error) {
    console.error("Error fetching store:", error);
    return apiError("Failed to fetch store details", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const validation = validateStoreInput(body);

    if (!validation.valid) {
      return apiError("Validation failed", 400, validation.errors);
    }

    const storeInput: StoreInput = {
      storeName: body.storeName.trim(),
      ownerName: body.ownerName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      location: body.location?.trim() || "",
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      pincode: body.pincode.trim(),
    };

    const savedStore = await saveStoreProfile(auth.user.uid, storeInput);
    return apiSuccess({ store: savedStore }, 201);
  } catch (error) {
    console.error("Error creating store:", error);
    return apiError("Failed to save store profile", 500);
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
