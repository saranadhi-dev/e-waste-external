"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PackageIcon,
  PlusIcon,
  SettingsIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BoltIcon,
  ArrowRightIcon,
  StoreIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
} from "@/components/ui/icons";
import type { DashboardStats, EwasteEntry } from "@/types/ewaste";
import type { StoreProfile } from "@/types/store";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    pendingEntries: 0,
    approvedEntries: 0,
    purchasedEntries: 0,
  });
  const [recentEntries, setRecentEntries] = useState<EwasteEntry[]>([]);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data.stats);
          setRecentEntries(json.data.recentEntries || []);
          setStore(json.data.store);
        }
      } catch (err: unknown) {
        console.error("Dashboard load error:", err);
        setError("Unable to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Total E-Waste Entries",
      value: stats.totalEntries,
      icon: PackageIcon,
      description: "Lifetime submitted items",
    },
    {
      title: "Pending Entries",
      value: stats.pendingEntries,
      icon: AlertCircleIcon,
      description: "Awaiting review or pickup",
    },
    {
      title: "Approved Entries",
      value: stats.approvedEntries,
      icon: CheckCircleIcon,
      description: "Verified collection entries",
    },
    {
      title: "Purchased Entries",
      value: stats.purchasedEntries,
      icon: BoltIcon,
      description: "Completed transactions",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Welcome</h1>
        </div>
       
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border-border">
              <CardContent className="px-5 py-2">

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <div className="grid size-9 place-items-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-5" />
                  </div>
                </div>

                <div className="mt-1">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {loading ? (
                      <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted" />
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                  <p className="text-caption mt-1">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Entries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-section-title font-semibold text-foreground">
            Recent E-Waste Entries
          </h2>
          <Link
            href="/ewaste"
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            <span>View all</span>
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 w-full animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <Card className="border-dashed border-border py-12 text-center">
            <CardContent className="flex flex-col items-center">
              <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                <PackageIcon className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">No entries yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                You haven&apos;t added any e-waste items yet. Start adding items to begin tracking collections.
              </p>
              <Link href="/ewaste/add" className="mt-5">
                <Button variant="primary" className="gap-2">
                  <PlusIcon className="size-4" />
                  <span>Add First Entry</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <Link key={entry.id} href={`/ewaste/${entry.id}`} className="block">
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
                      <PackageIcon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{entry.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.category} &bull; {entry.quantity} {entry.unit} &bull; Condition: {entry.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Badge variant={entry.status as any}>{entry.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
