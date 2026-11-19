export const EWASTE_CATEGORIES = [
  "Smartphones & Mobile Phones",
  "Chargers",
  "Cables",
  "Batteries",
  "Laptops",
  "Desktops",
  "Computer Accessories",
  "Monitors",
  "Televisions",
  "Printers",
  "Circuit Boards",
  "Electronic Components",
  "Other",
] as const;

export type EwasteCategory = (typeof EWASTE_CATEGORIES)[number];

export const QUANTITY_UNITS = ["pieces", "kg", "boxes"] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export const ITEM_CONDITIONS = ["working", "non-working", "damaged", "mixed"] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ENTRY_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "purchased",
] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export interface EwasteImage {
  path: string;
  url: string;
}

export interface EwasteEntry {
  id: string;
  storeId: string;
  ownerUid: string;
  itemName: string;
  category: string;
  description: string;
  quantity: number;
  unit: QuantityUnit;
  condition: ItemCondition;
  images: EwasteImage[];
  additionalNotes?: string;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
}

export type EwasteEntryInput = Omit<
  EwasteEntry,
  "id" | "storeId" | "ownerUid" | "status" | "createdAt" | "updatedAt"
>;

export interface EwasteFilterOptions {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  purchasedEntries: number;
}
