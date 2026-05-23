"use client";

import { useState, useMemo } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import { menuItems, CATEGORIES, getItemsByCategory } from "@/lib/mock/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CategorySection } from "@/components/menu/category-section";
import { AddEditProductSheet } from "@/components/menu/add-edit-product-sheet";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvailabilityFilter = "all" | "available" | "unavailable";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] =
    useState<AvailabilityFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // ─── Derived stats ──────────────────────────────────────────────────────────

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.isAvailable).length;
  const unavailableItems = totalItems - availableItems;

  // ─── Filtered items ─────────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;

      const matchesAvailability =
        filterAvailability === "all" ||
        (filterAvailability === "available" && item.isAvailable) ||
        (filterAvailability === "unavailable" && !item.isAvailable);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [items, search, filterCategory, filterAvailability]);

  // Items grouped by category (only when not searching)
  const isSearching = Boolean(search);

  const groupedItems = useMemo(() => {
    if (isSearching) return {};
    const groups: Record<string, MenuItem[]> = {};
    for (const cat of CATEGORIES) {
      const catItems = filteredItems.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        groups[cat] = catItems;
      }
    }
    return groups;
  }, [filteredItems, isSearching]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleToggle = (id: string, available: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isAvailable: available } : i))
    );
    toast.success(
      available ? "Item is now available" : "Item marked unavailable"
    );
    // TODO: PATCH /products/:id { isAvailable }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setSheetOpen(true);
  };

  const handleSave = (data: Omit<MenuItem, "id"> & { id?: string }) => {
    if (data.id) {
      setItems((prev) =>
        prev.map((i) => (i.id === data.id ? { ...i, ...data } as MenuItem : i))
      );
    } else {
      const newItem: MenuItem = { ...data, id: `item-${Date.now()}` };
      setItems((prev) => [...prev, newItem]);
    }
    setSheetOpen(false);
    setEditingItem(null);
    // TODO: POST/PATCH /products
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setSheetOpen(true);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-6 pb-10">
        {/* ── Sticky page header ── */}
        <div className="sticky top-0 z-20 -mx-4 px-4 pt-4 pb-3 bg-background/80 backdrop-blur-md border-b border-white/[0.06]">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Menu
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalItems} items
              </p>
            </div>
            <Button size="sm" onClick={handleAddNew} className="gap-1.5 flex-shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          {/* Search + availability filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <select
                value={filterAvailability}
                onChange={(e) =>
                  setFilterAvailability(e.target.value as AvailabilityFilter)
                }
                className={cn(
                  "h-10 appearance-none rounded-md border border-input bg-secondary/40 pl-8 pr-3",
                  "text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  "cursor-pointer transition-colors hover:border-primary/50"
                )}
                aria-label="Filter by availability"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Total Items", value: totalItems },
            {
              label: "Available",
              value: availableItems,
              valueClass: "text-green-400",
            },
            {
              label: "Unavailable",
              value: unavailableItems,
              valueClass: unavailableItems > 0 ? "text-amber-400" : "text-muted-foreground",
            },
          ].map(({ label, value, valueClass }) => (
            <div
              key={label}
              className="glass-card px-3 py-2.5 flex flex-col items-center text-center gap-0.5"
            >
              <span className={cn("text-lg font-bold leading-none", valueClass)}>
                {value}
              </span>
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Category filter chips (horizontal scroll) ── */}
        <div className="-mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {[{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c, label: c }))].map(
              ({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilterCategory(id)}
                  className={cn(
                    "flex-shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-medium",
                    "border transition-all duration-150 whitespace-nowrap",
                    filterCategory === id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                      : "bg-transparent border-white/[0.12] text-muted-foreground hover:border-white/25 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* ── Content area ── */}
        {isSearching ? (
          /* Search mode: flat grid */
          filteredItems.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onToggleAvailability={handleToggle}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState query={search} onReset={() => setSearch("")} />
          )
        ) : /* Category mode: grouped sections */
        Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-8">
            {CATEGORIES.filter((cat) => groupedItems[cat]?.length > 0).map(
              (cat) => (
                <CategorySection
                  key={cat}
                  category={cat}
                  items={groupedItems[cat]}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              )
            )}
          </div>
        ) : (
          <EmptyState onReset={() => { setFilterCategory("all"); setFilterAvailability("all"); }} />
        )}
      </div>

      {/* ── Add / Edit Sheet ── */}
      <AddEditProductSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        item={editingItem}
        onSave={handleSave}
      />
    </>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  query,
  onReset,
}: {
  query?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
        <Search className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {query ? `No results for "${query}"` : "No items found"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {query
            ? "Try a different search term"
            : "Adjust your filters or add new items"}
        </p>
      </div>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
