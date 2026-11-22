"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshIcon,
  SearchIcon,
  BoltIcon,
  PlusIcon,
  AlertCircleIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { EwasteMarketPrice } from "@/types/price";

export default function PricingPage() {
  const [prices, setPrices] = useState<EwasteMarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [trendFilter, setTrendFilter] = useState("all");

  const fetchPrices = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.prices) {
          setPrices(json.data.prices);
          setLastUpdated(json.data.lastUpdated);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live prices:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => {
      fetchPrices();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const matchesSearch = item.category.toLowerCase().includes(search.toLowerCase().trim());
      const matchesUnit = unitFilter === "all" || item.unit === unitFilter;
      const matchesTrend = trendFilter === "all" || item.trend === trendFilter;
      return matchesSearch && matchesUnit && matchesTrend;
    });
  }, [prices, search, unitFilter, trendFilter]);

  // Key stats
  const highestPriced = useMemo(() => {
    if (prices.length === 0) return null;
    return [...prices].sort((a, b) => b.price - a.price)[0];
  }, [prices]);

  const topGainer = useMemo(() => {
    if (prices.length === 0) return null;
    return [...prices].sort((a, b) => b.change24h - a.change24h)[0];
  }, [prices]);

  const averagePriceKg = useMemo(() => {
    const kgItems = prices.filter((p) => p.unit === "kg");
    if (kgItems.length === 0) return 0;
    const sum = kgItems.reduce((acc, curr) => acc + curr.price, 0);
    return (sum / kgItems.length).toFixed(2);
  }, [prices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row gap-4 items-center justify-between sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Live Rates</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchPrices(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshIcon className={cn("size-3.5", refreshing && "animate-spin")} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Input
            id="search-prices"
            placeholder="Search category or material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Filter by unit"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option value="all">All Units</option>
            <option value="kg">Per Kilogram (kg)</option>
            <option value="piece">Per Piece</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Filter by trend"
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option value="all">All Trends</option>
            <option value="up">Trending Up (Gaining)</option>
            <option value="down">Trending Down (Declining)</option>
            <option value="stable">Stable</option>
          </select>

          {(search || unitFilter !== "all" || trendFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setUnitFilter("all");
                setTrendFilter("all");
              }}
              className="shrink-0 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Pricing Grid */}
      {loading && prices.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Card key={n} className="border-border animate-pulse h-40">
              <CardContent className="p-5" />
            </Card>
          ))}
        </div>
      ) : filteredPrices.length === 0 ? (
        <Card className="border-dashed border-border py-12 text-center">
          <CardContent className="flex flex-col items-center">
            <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <AlertCircleIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No matching categories found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search terms or clearing the active unit/trend filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPrices.map((item) => (
            <Card
              key={item.id}
              className="border-border transition-all hover:border-foreground/30 hover:shadow-xs group"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Per {item.unit}
                    </span>
                    {/* <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border",
                        item.trend === "up" && "bg-secondary text-foreground border-border",
                        item.trend === "down" && "bg-muted text-muted-foreground border-border",
                        item.trend === "stable" && "bg-secondary text-muted-foreground border-border"
                      )}
                    >
                      {item.trend === "up" ? (
                        <>
                          <TrendingUpIcon className="size-3" />
                          <span>+{item.change24h}%</span>
                        </>
                      ) : item.trend === "down" ? (
                        <>
                          <TrendingDownIcon className="size-3" />
                          <span>{item.change24h}%</span>
                        </>
                      ) : (
                        <span>0.0%</span>
                      )}
                    </span> */}
                  </div>

                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.category}
                  </h3>
                </div>

                <div className="mt-2 pt-2 border-t border-border flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {item.currency}{item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {item.unit}
                    </span>
                  </div>

                  <Link href={`/ewaste/add?category=${encodeURIComponent(item.category)}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2" title="Add this item">
                      Add Item
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
        {lastUpdated && (
          <span className="mt-1 sm:mt-0">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
