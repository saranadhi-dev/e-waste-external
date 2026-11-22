"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tooltip } from "@/components/ui/tooltip";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshIcon,
  BoltIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { EwasteMarketPrice } from "@/types/price";

interface LivePricesProps {
  collapsed?: boolean;
}

export function LivePrices({ collapsed = false }: LivePricesProps) {
  const [prices, setPrices] = useState<EwasteMarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
    // Real-time polling every 15 seconds
    const interval = setInterval(() => {
      fetchPrices();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (collapsed) {
    const topItem = prices[0];
    const tooltipText = topItem
      ? `Live Rates: ${topItem.category} ${topItem.currency}${topItem.price}/${topItem.unit} (Click to view grid)`
      : "Live E-Waste Market Rates (Click to view grid)";

    return (
      <Tooltip label={tooltipText} enabled={collapsed}>
        <Link
          href="/pricing"
          className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
          aria-label="View all live e-waste prices in grid layout"
        >
          <BoltIcon className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-foreground animate-ping" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-foreground" />
        </Link>
      </Tooltip>
    );
  }

  return (
    <div className="my-2 rounded-xl border border-border bg-card/60 p-2.5 text-card-foreground">
      {/* Section Header with Link */}
      <div className="flex items-center justify-between px-1 pb-2 border-b border-border/80">
        <Link
          href="/pricing"
          className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          title="Open Live Pricing Grid"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-foreground" />
          </span>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground group-hover:underline">
            Live Market Rates
          </span>
        </Link>
        <button
          type="button"
          onClick={() => fetchPrices(true)}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
          title="Refresh prices"
          aria-label="Refresh live prices"
        >
          <RefreshIcon className={cn("size-3", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Clickable Price Ticker List */}
      <Link
        href="/pricing"
        className="block focus-visible:outline-ring rounded-lg group"
        title="Click to view all rates in grid layout"
      >
        <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {loading && prices.length === 0 ? (
            <div className="space-y-1.5 py-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-7 w-full animate-pulse rounded bg-muted/70"
                />
              ))}
            </div>
          ) : prices.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No live rates available.
            </p>
          ) : (
            prices.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-2 py-1.5 text-xs transition-colors group-hover:bg-secondary/80 hover:bg-secondary"
              >
                <div className="min-w-0 pr-1">
                  <p className="truncate font-medium text-foreground">{item.category}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Per {item.unit}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold text-foreground">
                    {item.currency}{item.price.toFixed(2)}
                  </span>
                  {/* <div className="flex items-center justify-end gap-0.5 text-[10px] font-medium">
                    {item.trend === "up" ? (
                      <>
                        <TrendingUpIcon className="size-2.5 text-foreground" />
                        <span className="text-foreground">+{item.change24h}%</span>
                      </>
                    ) : item.trend === "down" ? (
                      <>
                        <TrendingDownIcon className="size-2.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.change24h}%</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">0.0%</span>
                    )}
                  </div> */}
                </div>
              </div>
            ))
          )}
        </div>
      </Link>

      {/* Footer Link to View All In Grid */}
      <div className="mt-2 pt-2 border-t border-border/80 flex items-center justify-between px-1">
        <Link
          href="/pricing"
          className="flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline"
        >
          <span>View All</span>
          <ArrowRightIcon className="size-3" />
        </Link>
      </div>
    </div>
  );
}
