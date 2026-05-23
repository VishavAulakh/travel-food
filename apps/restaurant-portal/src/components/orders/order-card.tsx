"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, User } from "lucide-react";
import { cn, formatINR, formatRelativeTime } from "@/lib/utils";
import { getStatusMeta } from "@/lib/mock/orders";
import type { DeliveryOrder } from "@/types";

// ─── Prep-time chips ──────────────────────────────────────────────────────────

const PREP_OPTIONS = [15, 20, 25, 30] as const;

type PrepTimePickerProps = {
  onConfirm: (minutes: number) => void;
  onCancel: () => void;
};

function PrepTimePicker({ onConfirm, onCancel }: PrepTimePickerProps) {
  const [selected, setSelected] = useState<number>(20);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-3"
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        Estimated prep time
      </p>
      <div className="flex gap-2 flex-wrap">
        {PREP_OPTIONS.map((min) => (
          <button
            key={min}
            onClick={() => setSelected(min)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150",
              selected === min
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground"
            )}
          >
            {min} min
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(selected)}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          Confirm Order
        </button>
      </div>
    </motion.div>
  );
}

// ─── Veg / Non-veg dot ────────────────────────────────────────────────────────

function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full flex-shrink-0 mt-[3px]",
        isVeg ? "bg-green-400" : "bg-red-400"
      )}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export type OrderCardProps = {
  order: DeliveryOrder;
  onConfirm?: (id: string, prepMinutes: number) => void;
  onMarkPreparing?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onDecline?: (id: string) => void;
  compact?: boolean;
};

export function OrderCard({
  order,
  onConfirm,
  onMarkPreparing,
  onMarkReady,
  onDecline,
  compact = false,
}: OrderCardProps) {
  const [showPrepPicker, setShowPrepPicker] = useState(false);

  const meta = getStatusMeta(order.status);
  const visibleItems = compact ? order.items.slice(0, 2) : order.items.slice(0, 3);
  const extraCount = order.items.length - visibleItems.length;

  const handleAcceptClick = () => setShowPrepPicker(true);
  const handlePrepConfirm = (minutes: number) => {
    setShowPrepPicker(false);
    onConfirm?.(order.id, minutes);
  };
  const handlePrepCancel = () => setShowPrepPicker(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "glass-card glass-card-hover p-4 md:p-5 space-y-3",
        order.status === "placed" && "border-amber-400/20"
      )}
    >
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-foreground text-sm md:text-base truncate">
            #{order.orderId}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeTime(order.placedAt)}
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0",
            meta.bg,
            meta.color
          )}
        >
          {meta.label}
        </span>
      </div>

      {/* ── Customer row ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
          <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span>{order.customerName}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span>{order.customerPhone}</span>
        </div>
      </div>

      {/* ── Items list ──────────────────────────────────────────────────── */}
      {!compact && (
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <VegDot isVeg={item.isVeg} />
              <span className="text-foreground/80">
                {item.name}
                <span className="text-muted-foreground"> ×{item.qty}</span>
              </span>
            </div>
          ))}
          {extraCount > 0 && (
            <p className="text-xs text-muted-foreground pl-4">
              +{extraCount} more item{extraCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Compact: just item count */}
      {compact && (
        <p className="text-xs text-muted-foreground">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Address row ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/70" />
        <span className="truncate leading-relaxed">{order.deliveryAddress}</span>
      </div>

      {/* ── Divider + total ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        {order.estimatedPrepMinutes ? (
          <span className="text-xs text-muted-foreground">
            Prep: {order.estimatedPrepMinutes} min
          </span>
        ) : (
          <span />
        )}
        <span className="font-bold text-primary text-sm md:text-base">
          {formatINR(order.totalPaise)}
        </span>
      </div>

      {/* ── Prep time picker (shown when accepting a "placed" order) ─────── */}
      {showPrepPicker && (
        <PrepTimePicker onConfirm={handlePrepConfirm} onCancel={handlePrepCancel} />
      )}

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      {!showPrepPicker && (
        <div className="flex gap-2 pt-1">
          {/* PLACED → Decline + Accept */}
          {order.status === "placed" && (
            <>
              <button
                onClick={() => onDecline?.(order.id)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptClick}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Accept Order
              </button>
            </>
          )}

          {/* CONFIRMED or PREPARING → Mark Ready */}
          {(order.status === "confirmed" || order.status === "preparing") && (
            <button
              onClick={() => onMarkReady?.(order.id)}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold border border-green-400/40 text-green-400 hover:bg-green-400/10 transition-all"
            >
              Mark Ready
            </button>
          )}

          {/* READY FOR PICKUP → informational badge */}
          {order.status === "ready_for_pickup" && (
            <div className="w-full px-3 py-2 rounded-lg text-sm font-medium text-center bg-green-400/10 text-green-400 border border-green-400/20">
              Awaiting Rider
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
