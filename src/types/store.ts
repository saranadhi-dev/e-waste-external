export interface StoreProfile {
  id?: string;
  ownerUid: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  location?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
}

export type StoreInput = Omit<StoreProfile, "id" | "ownerUid" | "createdAt" | "updatedAt">;
