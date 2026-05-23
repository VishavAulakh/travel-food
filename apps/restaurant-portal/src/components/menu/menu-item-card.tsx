"use client";

import { motion } from "framer-motion";
import { Pencil, UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/types";
import { cn, formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { VegNonvegIndicator } from "./veg-nonveg-indicator";

export type MenuItemCardProps = {
  item: MenuItem;
  onToggleAvailability: (id: string, available: boolean) => void;
  onEdit: (item: MenuItem) => void;
};

export function MenuItemCard({ item, onToggleAvailability, onEdit }: MenuItemCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="glass-card glass-card-hover flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover rounded-t-xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-secondary rounded-t-xl flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 rounded-t-xl bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold tracking-wide uppercase bg-black/50 px-2 py-1 rounded-md">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Name row */}
        <div className="flex items-start gap-2">
          <VegNonvegIndicator isVeg={item.isVeg} className="mt-[3px]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-semibold text-sm leading-tight",
                  !item.isAvailable && "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 rounded-sm whitespace-nowrap">
                {item.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Price + Availability */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-primary font-bold text-sm">
            {formatINR(item.pricePaise)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {item.isAvailable ? "Available" : "Off"}
            </span>
            <Switch
              checked={item.isAvailable}
              onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
              aria-label={`Toggle availability for ${item.name}`}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 border-t border-white/[0.06] pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground w-full justify-start gap-1.5"
          onClick={() => onEdit(item)}
        >
          <Pencil className="w-3 h-3" />
          Edit Item
        </Button>
      </div>
    </motion.div>
  );
}
