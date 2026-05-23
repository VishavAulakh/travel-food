"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "./menu-item-card";

export type CategorySectionProps = {
  category: string;
  items: MenuItem[];
  onToggle: (id: string, val: boolean) => void;
  onEdit: (item: MenuItem) => void;
};

export function CategorySection({
  category,
  items,
  onToggle,
  onEdit,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const availableCount = items.filter((i) => i.isAvailable).length;
  const allAvailable = availableCount === items.length;
  const allUnavailable = availableCount === 0;

  const handleBulkToggle = () => {
    const targetState = !allAvailable;
    items.forEach((item) => {
      if (item.isAvailable !== targetState) {
        onToggle(item.id, targetState);
      }
    });
  };

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 flex-1 min-w-0 group text-left"
          aria-expanded={!collapsed}
          aria-label={`Toggle ${category} section`}
        >
          <motion.div
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </motion.div>

          <h2 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
            {category}
          </h2>

          {/* Item count chip */}
          <span
            className={cn(
              "flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5",
              "text-[11px] font-semibold",
              "bg-white/[0.07] text-muted-foreground border border-white/[0.08]"
            )}
          >
            {items.length}
          </span>

          {/* Availability chip */}
          <span
            className={cn(
              "flex-shrink-0 hidden sm:inline-flex items-center rounded-full px-2 py-0.5",
              "text-[11px] font-medium",
              allAvailable
                ? "bg-green-900/30 text-green-400 border border-green-800/30"
                : allUnavailable
                ? "bg-red-900/20 text-red-400 border border-red-800/20"
                : "bg-amber-900/20 text-amber-400 border border-amber-800/20"
            )}
          >
            {availableCount}/{items.length} available
          </span>
        </button>

        {/* Bulk toggle button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-7 px-3 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleBulkToggle}
        >
          {allAvailable ? "All unavailable" : "All available"}
        </Button>
      </div>

      {/* Collapsible grid */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onToggleAvailability={onToggle}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
