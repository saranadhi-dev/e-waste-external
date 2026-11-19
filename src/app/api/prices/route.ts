import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getLiveMarketPrices } from "@/lib/services/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const prices = await getLiveMarketPrices();
    const response = apiSuccess({
      prices,
      lastUpdated: new Date().toISOString(),
    });

    // Ensure no caching for real-time rates
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Error fetching live prices:", error);
    return apiError("Failed to fetch live e-waste prices", 500);
  }
}
