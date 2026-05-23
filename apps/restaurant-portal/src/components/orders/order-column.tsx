"use client";

import React from "react";
import { cn } from "@/lib/utils";

type AccentColor = "amber" | "blue" | "green";

export type OrderColumnProps = {
  title: string;
  count: number;
  accentColor: AccentColor;
  orders: import("@/types").DeliveryOrder[];
  emptyMessage: string;
  children: React.ReactNode;
};

const accentMap: Record<AccentColor, { border: string; badge: string; text: string; emptyIcon: string }> = {
  amber: {
    border: "border-l-amber-400",
    badge: "bg-amber-400/10 text-amber-400",
    text: "text-amber-400",
    emptyIcon: "⏳",
  },
  blue: {
    border: "border-l-blue-400",
    badge: "bg-blue-400/10 text-blue-400",
    text: "text-blue-400",
    emptyIcon: "🍳",
  },
  green: {
    border: "border-l-green-400",
    badge: "bg-green-400/10 text-green-400",
    text: "text-green-400",
    emptyIcon: "✅",
  },
};

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl select-none">{icon}</span>
      <p className="text-sm text-muted-foreground max-w-[160px] leading-relaxed">{message}</p>
    </div>
  );
}

// ── Column wrapper (desktop only) ──────────────────────────────────────────────

export function OrderColumn({
  title,
  count,
  accentColor,
  orders,
  emptyMessage,
  children,
}: OrderColumnProps) {
  const accent = accentMap[accentColor];

  return (
    <>
      {/* ── Desktop column ───────────────────────────────────────── */}
      <div
        className={cn(
          "hidden md:flex flex-col animate-fade-in",
          "border-l-2 pl-4",
          accent.border
        )}
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        {/* Column header */}
        <div className="flex items-center gap-2 mb-4 sticky top-0 py-1 z-10 bg-background/80 backdrop-blur-sm">
          <h2 className={cn("font-semibold text-sm uppercase tracking-wider", accent.text)}>
            {title}
          </h2>
          {count > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                accent.badge
              )}
            >
              {count}
            </span>
          )}
        </div>

        {/* Scrollable card list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {orders.length === 0 ? (
            <EmptyState icon={accent.emptyIcon} message={emptyMessage} />
          ) : (
            children
          )}
        </div>
      </div>

      {/* ── Mobile: render children directly (no column wrapper) ──── */}
      <div className="md:hidden space-y-3">
        {orders.length === 0 ? (
          <EmptyState icon={accent.emptyIcon} message={emptyMessage} />
        ) : (
          children
        )}
      </div>
    </>
  );
}
