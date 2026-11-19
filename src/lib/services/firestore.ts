import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { UserProfile } from "@/types/auth";
import type { StoreProfile, StoreInput } from "@/types/store";
import type { EwasteEntry, EwasteEntryInput, DashboardStats } from "@/types/ewaste";
import type { EwasteMarketPrice } from "@/types/price";

// In-memory store for development/testing when Firebase Admin credentials are not set
const memoryDb = {
  users: new Map<string, UserProfile>(),
  stores: new Map<string, StoreProfile>(),
  ewaste: new Map<string, EwasteEntry>(),
  prices: new Map<string, EwasteMarketPrice>(),
};

/**
 * ============================================================================
 * USERS SERVICE
 * ============================================================================
 */
export async function createOrUpdateUserDocument(
  uid: string,
  email: string,
  fullName?: string
): Promise<UserProfile> {
  const now = new Date().toISOString();

  if (isFirebaseAdminConfigured()) {
    const userRef = adminFirestore.collection("users").doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      await userRef.update({
        email,
        fullName: fullName || existing.data()?.fullName || "",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return {
        uid,
        email,
        fullName: fullName || existing.data()?.fullName || "",
        createdAt: existing.data()?.createdAt?.toDate?.()?.toISOString() || now,
        updatedAt: now,
      };
    } else {
      const data = {
        uid,
        email,
        fullName: fullName || "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await userRef.set(data);
      return {
        uid,
        email,
        fullName: fullName || "",
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  // Memory fallback
  const existing = memoryDb.users.get(uid);
  const userProfile: UserProfile = {
    uid,
    email,
    fullName: fullName || existing?.fullName || "Store Owner",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  memoryDb.users.set(uid, userProfile);
  return userProfile;
}

export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  if (isFirebaseAdminConfigured()) {
    const doc = await adminFirestore.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      uid: doc.id,
      email: data.email || "",
      fullName: data.fullName || "",
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  return memoryDb.users.get(uid) || null;
}

/**
 * ============================================================================
 * STORES SERVICE
 * ============================================================================
 */
export async function getStoreByOwner(ownerUid: string): Promise<StoreProfile | null> {
  if (isFirebaseAdminConfigured()) {
    const snapshot = await adminFirestore
      .collection("stores")
      .where("ownerUid", "==", ownerUid)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ownerUid: data.ownerUid,
      storeName: data.storeName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      location: data.location || "",
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  // Memory fallback
  for (const store of memoryDb.stores.values()) {
    if (store.ownerUid === ownerUid) {
      return store;
    }
  }
  return null;
}

export async function saveStoreProfile(
  ownerUid: string,
  input: StoreInput
): Promise<StoreProfile> {
  const now = new Date().toISOString();

  if (isFirebaseAdminConfigured()) {
    const existing = await getStoreByOwner(ownerUid);

    if (existing?.id) {
      const storeRef = adminFirestore.collection("stores").doc(existing.id);
      await storeRef.update({
        ...input,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return {
        ...existing,
        ...input,
        updatedAt: now,
      };
    } else {
      const docRef = adminFirestore.collection("stores").doc();
      const newStore = {
        ownerUid,
        ...input,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await docRef.set(newStore);
      return {
        id: docRef.id,
        ownerUid,
        ...input,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  // Memory fallback
  let target = Array.from(memoryDb.stores.values()).find((s) => s.ownerUid === ownerUid);
  if (target) {
    const updated: StoreProfile = {
      ...target,
      ...input,
      updatedAt: now,
    };
    memoryDb.stores.set(target.id!, updated);
    return updated;
  }

  const id = `store_${Date.now()}`;
  const created: StoreProfile = {
    id,
    ownerUid,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  memoryDb.stores.set(id, created);
  return created;
}

/**
 * ============================================================================
 * E-WASTE ENTRIES SERVICE
 * ============================================================================
 */
export async function createEwasteEntry(
  ownerUid: string,
  storeId: string,
  input: EwasteEntryInput
): Promise<EwasteEntry> {
  const now = new Date().toISOString();

  if (isFirebaseAdminConfigured()) {
    const docRef = adminFirestore.collection("ewaste_entries").doc();
    const entryData = {
      storeId,
      ownerUid,
      itemName: input.itemName,
      category: input.category,
      description: input.description,
      quantity: Number(input.quantity),
      unit: input.unit,
      condition: input.condition,
      images: input.images || [],
      additionalNotes: input.additionalNotes || "",
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await docRef.set(entryData);

    return {
      id: docRef.id,
      storeId,
      ownerUid,
      itemName: input.itemName,
      category: input.category,
      description: input.description,
      quantity: Number(input.quantity),
      unit: input.unit,
      condition: input.condition,
      images: input.images || [],
      additionalNotes: input.additionalNotes || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
  }

  // Memory fallback
  const id = `ewaste_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const entry: EwasteEntry = {
    id,
    storeId,
    ownerUid,
    itemName: input.itemName,
    category: input.category,
    description: input.description,
    quantity: Number(input.quantity),
    unit: input.unit,
    condition: input.condition,
    images: input.images || [],
    additionalNotes: input.additionalNotes || "",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  memoryDb.ewaste.set(id, entry);
  return entry;
}

export async function getEwasteEntriesByOwner(
  ownerUid: string,
  options?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ entries: EwasteEntry[]; total: number; page: number; totalPages: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const search = options?.search?.toLowerCase().trim();
  const category = options?.category?.trim();
  const status = options?.status?.trim();

  let allEntries: EwasteEntry[] = [];

  if (isFirebaseAdminConfigured()) {
    let query: FirebaseFirestore.Query = adminFirestore
      .collection("ewaste_entries")
      .where("ownerUid", "==", ownerUid);

    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    allEntries = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        storeId: data.storeId,
        ownerUid: data.ownerUid,
        itemName: data.itemName,
        category: data.category,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        condition: data.condition,
        images: data.images || [],
        additionalNotes: data.additionalNotes || "",
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    // In-memory sort by createdAt desc
    allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Memory fallback
    allEntries = Array.from(memoryDb.ewaste.values())
      .filter((e) => e.ownerUid === ownerUid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (category && category !== "all") {
      allEntries = allEntries.filter((e) => e.category === category);
    }
    if (status && status !== "all") {
      allEntries = allEntries.filter((e) => e.status === status);
    }
  }

  // Client search by item name
  if (search) {
    allEntries = allEntries.filter((e) =>
      e.itemName.toLowerCase().includes(search) ||
      e.description.toLowerCase().includes(search)
    );
  }

  const total = allEntries.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = allEntries.slice(startIndex, startIndex + limit);

  return {
    entries: paginated,
    total,
    page,
    totalPages,
  };
}

export async function getEwasteEntryById(
  id: string,
  ownerUid: string
): Promise<EwasteEntry | null> {
  if (isFirebaseAdminConfigured()) {
    const doc = await adminFirestore.collection("ewaste_entries").doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    // Strict ownership verification!
    if (data.ownerUid !== ownerUid) {
      return null;
    }
    return {
      id: doc.id,
      storeId: data.storeId,
      ownerUid: data.ownerUid,
      itemName: data.itemName,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      condition: data.condition,
      images: data.images || [],
      additionalNotes: data.additionalNotes || "",
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  // Memory fallback
  const entry = memoryDb.ewaste.get(id);
  if (!entry || entry.ownerUid !== ownerUid) return null;
  return entry;
}

export async function updateEwasteEntry(
  id: string,
  ownerUid: string,
  updates: Partial<EwasteEntryInput>
): Promise<EwasteEntry | null> {
  const existing = await getEwasteEntryById(id, ownerUid);
  if (!existing) return null;

  const now = new Date().toISOString();

  if (isFirebaseAdminConfigured()) {
    const docRef = adminFirestore.collection("ewaste_entries").doc(id);
    const sanitizedUpdates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (updates.itemName) sanitizedUpdates.itemName = updates.itemName;
    if (updates.category) sanitizedUpdates.category = updates.category;
    if (updates.description) sanitizedUpdates.description = updates.description;
    if (updates.quantity) sanitizedUpdates.quantity = Number(updates.quantity);
    if (updates.unit) sanitizedUpdates.unit = updates.unit;
    if (updates.condition) sanitizedUpdates.condition = updates.condition;
    if (updates.images) sanitizedUpdates.images = updates.images;
    if (updates.additionalNotes !== undefined) sanitizedUpdates.additionalNotes = updates.additionalNotes;

    await docRef.update(sanitizedUpdates);
    return {
      ...existing,
      ...updates,
      updatedAt: now,
    } as EwasteEntry;
  }

  // Memory fallback
  const updated: EwasteEntry = {
    ...existing,
    ...updates,
    updatedAt: now,
  } as EwasteEntry;
  memoryDb.ewaste.set(id, updated);
  return updated;
}

export async function deleteEwasteEntry(
  id: string,
  ownerUid: string
): Promise<boolean> {
  const existing = await getEwasteEntryById(id, ownerUid);
  if (!existing) return false;

  if (isFirebaseAdminConfigured()) {
    await adminFirestore.collection("ewaste_entries").doc(id).delete();
    return true;
  }

  memoryDb.ewaste.delete(id);
  return true;
}

export async function getDashboardStats(ownerUid: string): Promise<DashboardStats> {
  const { entries } = await getEwasteEntriesByOwner(ownerUid, { limit: 10000 });

  const totalEntries = entries.length;
  let pendingEntries = 0;
  let approvedEntries = 0;
  let purchasedEntries = 0;

  for (const entry of entries) {
    if (entry.status === "pending") pendingEntries++;
    else if (entry.status === "approved") approvedEntries++;
    else if (entry.status === "purchased") purchasedEntries++;
  }

  return {
    totalEntries,
    pendingEntries,
    approvedEntries,
    purchasedEntries,
  };
}

/**
 * ============================================================================
 * LIVE E-WASTE MARKET PRICES SERVICE (READ-ONLY)
 * ============================================================================
 */
const DEFAULT_MARKET_PRICES: Omit<EwasteMarketPrice, "updatedAt">[] = [
  {
    id: "price-smartphones",
    category: "Smartphones",
    price: 14.80,
    unit: "kg",
    currency: "$",
    change24h: 3.2,
    trend: "up",
  },
  {
    id: "price-laptops",
    category: "Laptops",
    price: 27.50,
    unit: "kg",
    currency: "$",
    change24h: 1.8,
    trend: "up",
  },
  {
    id: "price-circuit-boards",
    category: "High-Grade Circuit Boards",
    price: 34.20,
    unit: "kg",
    currency: "$",
    change24h: 4.5,
    trend: "up",
  },
  {
    id: "price-motherboards",
    category: "Standard Motherboards",
    price: 19.40,
    unit: "kg",
    currency: "$",
    change24h: 2.1,
    trend: "up",
  },
  {
    id: "price-cables",
    category: "Copper Cables & Wiring",
    price: 8.60,
    unit: "kg",
    currency: "$",
    change24h: -0.7,
    trend: "down",
  },
  {
    id: "price-batteries-li",
    category: "Li-ion Batteries",
    price: 4.40,
    unit: "kg",
    currency: "$",
    change24h: 0.0,
    trend: "stable",
  },
  {
    id: "price-chargers",
    category: "AC Adapters & Chargers",
    price: 5.10,
    unit: "kg",
    currency: "$",
    change24h: 1.2,
    trend: "up",
  },
  {
    id: "price-monitors",
    category: "LCD/LED Panels",
    price: 6.20,
    unit: "piece",
    currency: "$",
    change24h: -1.2,
    trend: "down",
  },
  {
    id: "price-ram",
    category: "RAM Gold-Fingered Sticks",
    price: 48.00,
    unit: "kg",
    currency: "$",
    change24h: 5.8,
    trend: "up",
  },
  {
    id: "price-cpu",
    category: "Computer Processors (CPUs)",
    price: 85.00,
    unit: "kg",
    currency: "$",
    change24h: 2.4,
    trend: "up",
  },
  {
    id: "price-hard-drives",
    category: "HDD / SSD Storage",
    price: 11.30,
    unit: "kg",
    currency: "$",
    change24h: -0.5,
    trend: "down",
  },
  {
    id: "price-printers",
    category: "Printers & Scanners",
    price: 3.20,
    unit: "kg",
    currency: "$",
    change24h: 0.0,
    trend: "stable",
  },
];

export async function getLiveMarketPrices(): Promise<EwasteMarketPrice[]> {
  const now = new Date().toISOString();

  if (isFirebaseAdminConfigured()) {
    try {
      const snapshot = await adminFirestore.collection("market_prices").get();

      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            category: d.category || "Unknown",
            price: Number(d.price) || 0,
            unit: d.unit || "kg",
            currency: d.currency || "$",
            change24h: Number(d.change24h) || 0,
            trend: (d.trend as "up" | "down" | "stable") || "stable",
            updatedAt: d.updatedAt?.toDate?.()?.toISOString() || now,
          };
        });
      }

      // Initialize default prices in Firestore if collection is empty
      const batch = adminFirestore.batch();
      const initialized: EwasteMarketPrice[] = [];

      for (const item of DEFAULT_MARKET_PRICES) {
        const ref = adminFirestore.collection("market_prices").doc(item.id);
        const data = {
          ...item,
          updatedAt: FieldValue.serverTimestamp(),
        };
        batch.set(ref, data);
        initialized.push({ ...item, updatedAt: now });
      }

      await batch.commit();
      return initialized;
    } catch (err) {
      console.warn("Error reading market_prices from Firestore, falling back to in-memory:", err);
    }
  }

  // Fallback Development Mode:
  // Initialize memory map if empty
  if (memoryDb.prices.size === 0) {
    for (const item of DEFAULT_MARKET_PRICES) {
      memoryDb.prices.set(item.id, {
        ...item,
        updatedAt: now,
      });
    }
  } else {
    // Simulate slight live market fluctuations in development mode
    for (const [id, item] of memoryDb.prices.entries()) {
      // 30% chance of small +/- 0.5% fluctuation per fetch to reflect real-time activity
      if (Math.random() < 0.35) {
        const delta = (Math.random() - 0.48) * 0.15;
        const newPrice = Math.max(1, Math.round((item.price + delta) * 100) / 100);
        const newChange = Math.round((item.change24h + (delta > 0 ? 0.2 : -0.2)) * 10) / 10;
        const newTrend: "up" | "down" | "stable" = delta > 0.02 ? "up" : delta < -0.02 ? "down" : "stable";

        memoryDb.prices.set(id, {
          ...item,
          price: newPrice,
          change24h: newChange,
          trend: newTrend,
          updatedAt: now,
        });
      }
    }
  }

  return Array.from(memoryDb.prices.values());
}

