import { authenticateApiRequest } from "@/lib/api/auth-guard";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getDashboardStats,
  getEwasteEntriesByOwner,
  getStoreByOwner,
} from "@/lib/services/firestore";

export async function GET() {
  const auth = await authenticateApiRequest();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const stats = await getDashboardStats(auth.user.uid);
    const { entries: recentEntries } = await getEwasteEntriesByOwner(auth.user.uid, {
      limit: 5,
    });
    const store = await getStoreByOwner(auth.user.uid);

    return apiSuccess({
      stats,
      recentEntries,
      store,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return apiError("Failed to load dashboard statistics", 500);
  }
}
