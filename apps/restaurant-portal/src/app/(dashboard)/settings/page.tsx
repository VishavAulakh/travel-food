"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Power,
  Clock,
  Truck,
  ShieldCheck,
  User,
  LogOut,
  Save,
  MapPin,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/auth-store";
import { openingHoursDefault } from "@/lib/mock/analytics";
import type { OpeningHours } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Day labels ──────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Collapsible section wrapper ─────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  danger,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        "glass-card overflow-hidden",
        danger && "border-red-500/20"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 md:p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              danger ? "bg-red-400/10" : "bg-primary/10"
            )}
          >
            <Icon
              className={cn("h-4 w-4", danger ? "text-red-400" : "text-primary")}
            />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-white/[0.05] px-4 pb-4 pt-4 md:px-5 md:pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Opening hours row ───────────────────────────────────────────────────────

function HoursRow({
  day,
  onChange,
}: {
  day: OpeningHours;
  onChange: (updated: OpeningHours) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-3 transition-all sm:flex-row sm:items-center",
        day.isOpen
          ? "border-white/[0.08] bg-white/[0.02]"
          : "border-white/[0.04] bg-transparent opacity-60"
      )}
    >
      {/* Day name + toggle */}
      <div className="flex items-center justify-between sm:w-36 sm:justify-start sm:gap-3">
        <span className="text-sm font-medium text-foreground w-20">
          {DAY_NAMES[day.dayOfWeek]}
        </span>
        <Switch
          checked={day.isOpen}
          onCheckedChange={(v) => onChange({ ...day, isOpen: v })}
          aria-label={`Toggle ${DAY_NAMES[day.dayOfWeek]}`}
        />
      </div>

      {/* Time inputs */}
      {day.isOpen ? (
        <div className="flex items-center gap-2 flex-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Opens at
            </label>
            <input
              type="time"
              value={day.opensAt}
              onChange={(e) => onChange({ ...day, opensAt: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
            />
          </div>
          <span className="mt-5 text-muted-foreground text-xs">–</span>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Closes at
            </label>
            <input
              type="time"
              value={day.closesAt}
              onChange={(e) => onChange({ ...day, closesAt: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
            />
          </div>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">Closed</span>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Section 1: Restaurant status
  const [accepting, setAccepting] = useState(true);

  // Section 2: Opening hours
  const [hours, setHours] = useState<OpeningHours[]>(openingHoursDefault);

  // Section 3: Minimum order
  const [minOrder, setMinOrder] = useState(150);

  const updateHoursDay = (dayOfWeek: number, updated: OpeningHours) => {
    setHours((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? updated : d))
    );
  };

  const handleSaveHours = () => {
    // TODO: PUT /opening-hours/:branchId
    toast.success("Opening hours saved!");
  };

  const handleSaveMinOrder = () => {
    // TODO: PATCH /branch/:branchId
    toast.success("Minimum order updated!");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 pb-24 md:pb-8 max-w-2xl mx-auto">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-2"
      >
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your restaurant configuration
        </p>
      </motion.div>

      {/* ── Section 1: Restaurant Status ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Section icon={Power} title="Restaurant Status">
          <div
            className={cn(
              "flex flex-col gap-4 rounded-xl border p-4 transition-all",
              accepting
                ? "border-green-500/25 bg-green-400/5"
                : "border-red-500/25 bg-red-400/5"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  Accepting Delivery Orders
                </span>
                <span
                  className={cn(
                    "text-xs",
                    accepting ? "text-green-400" : "text-red-400"
                  )}
                >
                  {accepting
                    ? "Currently accepting orders from customers"
                    : "You are offline — customers cannot place orders"}
                </span>
              </div>
              <Switch
                checked={accepting}
                onCheckedChange={setAccepting}
                aria-label="Toggle accepting delivery orders"
                className="shrink-0"
              />
            </div>

            {!accepting && (
              <div className="flex items-start gap-2 rounded-lg bg-red-400/10 border border-red-500/20 px-3 py-2.5">
                <Power className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">
                  Your restaurant is currently offline. Toggle the switch above
                  to start receiving orders.
                </p>
              </div>
            )}
          </div>
        </Section>
      </motion.div>

      {/* ── Section 2: Opening Hours ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Section icon={Clock} title="Opening Hours">
          <div className="flex flex-col gap-2.5">
            {hours.map((day) => (
              <HoursRow
                key={day.dayOfWeek}
                day={day}
                onChange={(updated) => updateHoursDay(day.dayOfWeek, updated)}
              />
            ))}
            <Button
              className="mt-2 w-full sm:w-auto sm:self-end"
              onClick={handleSaveHours}
            >
              <Save className="h-4 w-4" />
              Save Hours
            </Button>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 3: Minimum Order ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Section icon={ShieldCheck} title="Minimum Order">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Set the minimum cart value required to place a delivery order.
            </p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="min-order"
                className="text-sm font-medium text-foreground whitespace-nowrap"
              >
                Minimum for delivery
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
                <span className="px-3 text-sm font-semibold text-muted-foreground border-r border-white/[0.08]">
                  ₹
                </span>
                <input
                  id="min-order"
                  type="number"
                  min={0}
                  step={10}
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-28 bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
            <Button
              className="w-full sm:w-auto sm:self-start"
              onClick={handleSaveMinOrder}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 4: Delivery Info ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Section icon={Truck} title="Delivery Info">
          <div className="flex flex-col gap-3">
            {/* Info rows */}
            {[
              { label: "Platform Commission", value: "15%" },
              { label: "Delivery Fee", value: "Set by zone" },
              { label: "Payout", value: "Weekly via bank transfer" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
            ))}

            {/* Manage Zones — coming soon */}
            <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground/50">
                  Manage Zones
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px] opacity-60">
                Coming soon
              </Badge>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* ── Section 5: Account ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Section icon={User} title="Account" danger>
          <div className="flex flex-col gap-4">
            {/* Restaurant name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Restaurant Name
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <span className="text-sm text-foreground">
                  {user?.restaurantName ?? user?.name ?? "Paradise Biryani"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground/50 italic">
                  read-only
                </span>
              </div>
            </div>

            {/* Phone number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone Number
              </label>
              <div className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <span className="text-sm text-foreground">
                  {user?.phone ?? "+91 98765 00000"}
                </span>
                <span className="ml-auto text-xs text-muted-foreground/50 italic">
                  read-only
                </span>
              </div>
            </div>

            {/* Log out */}
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-400/10 hover:border-red-500/50 mt-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </Section>
      </motion.div>
    </div>
  );
}
