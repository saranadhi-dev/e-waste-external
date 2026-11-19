export interface EwasteMarketPrice {
  id: string;
  category: string;
  price: number;
  unit: string;
  currency: string;
  change24h: number; // percentage, e.g. +3.2 or -1.5
  trend: "up" | "down" | "stable";
  updatedAt: string;
}

export interface LivePricesResponse {
  prices: EwasteMarketPrice[];
  lastUpdated: string;
}
