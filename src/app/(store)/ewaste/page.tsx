"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, SuccessDialog } from "@/components/ui/modal";
import {
  PackageIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
} from "@/components/ui/icons";
import {
  EWASTE_CATEGORIES,
  ENTRY_STATUSES,
  type EwasteEntry,
} from "@/types/ewaste";

export default function EwasteListingPage() {
  const [entries, setEntries] = useState<EwasteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<EwasteEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "all") params.set("category", category);
      if (status !== "all") params.set("status", status);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`/api/ewaste?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load e-waste entries");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setEntries(json.data.entries || []);
        setTotalPages(json.data.totalPages || 1);
        setTotalCount(json.data.total || 0);
      }
    } catch (err: unknown) {
      console.error("Listing load error:", err);
      setError("Unable to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/ewaste/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to delete item");
      }

      setDeleteTarget(null);
      setShowSuccessModal(true);
      fetchEntries();
    } catch (err: unknown) {
      console.error("Delete entry error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title text-foreground">E-Waste Entries</h1>
          <p className="text-secondary mt-1">
            Browse, search, and manage your collection items ({totalCount} items total).
          </p>
        </div>
        <Link href="/ewaste/add">
          <Button variant="primary" className="gap-2">
            <PlusIcon className="size-4" />
            <span>Add New Entry</span>
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Input
                id="search-input"
                placeholder="Search by item name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            </div>

            <Select
              id="category-filter"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {EWASTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              {ENTRY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </Select>

            {(search || category !== "all" || status !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setStatus("all");
                  setPage(1);
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed border-border py-16 text-center">
          <CardContent className="flex flex-col items-center">
            <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <PackageIcon className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No entries found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search || category !== "all" || status !== "all"
                ? "No items match your filter criteria. Try adjusting your search."
                : "You have not added any e-waste items to your store collection yet."}
            </p>
            <div className="mt-6">
              <Link href="/ewaste/add">
                <Button variant="primary" className="gap-2">
                  <PlusIcon className="size-4" />
                  <span>Add E-Waste Entry</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Item Name
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Quantity
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Condition
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Date Created
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      <Link
                        href={`/ewaste/${item.id}`}
                        className="hover:underline flex items-center gap-2"
                      >
                        {item.images?.[0]?.url && (
                          <img
                            src={item.images[0].url}
                            alt=""
                            className="size-8 rounded object-cover border border-border shrink-0"
                          />
                        )}
                        <span className="truncate max-w-xs">{item.itemName}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{item.category}</td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-5 py-4 capitalize text-muted-foreground">{item.condition}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={item.status as any}>{item.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/ewaste/${item.id}`} title="View Details">
                          <Button variant="ghost" size="icon" className="size-8">
                            <EyeIcon className="size-4" />
                          </Button>
                        </Link>
                        <Link href={`/ewaste/${item.id}?edit=true`} title="Edit Entry">
                          <Button variant="ghost" size="icon" className="size-8">
                            <EditIcon className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete Entry"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="space-y-3 md:hidden">
            {entries.map((item) => (
              <Card key={item.id} className="border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {item.images?.[0]?.url && (
                      <img
                        src={item.images[0].url}
                        alt=""
                        className="size-12 rounded-lg object-cover border border-border shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <Link
                        href={`/ewaste/${item.id}`}
                        className="font-semibold text-foreground text-sm hover:underline truncate block"
                      >
                        {item.itemName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.category} &bull; {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        Condition: {item.condition}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.status as any}>{item.status.replace("_", " ")}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/ewaste/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        View
                      </Button>
                    </Link>
                    <Link href={`/ewaste/${item.id}?edit=true`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeftIcon className="size-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="gap-1"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete E-Waste Entry"
        message={`Are you sure you want to delete "${deleteTarget?.itemName}"? This action cannot be undone.`}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {/* Success Dialog after Deletion */}
      <SuccessDialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Entry Deleted"
        message="The e-waste entry has been deleted successfully."
      />
    </div>
  );
}
