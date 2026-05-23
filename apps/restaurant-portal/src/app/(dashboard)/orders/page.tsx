"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ClipboardList, PackageCheck, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOrdersSocket } from "@/lib/hooks/use-orders-socket";
import { OrderCard } from "@/components/orders/order-card";
import { OrderColumn } from "@/components/orders/order-column";
import { useAuthStore } from "@/lib/stores/auth-store";
import api from "@/lib/api";
import type { DeliveryOrder, OrderStatus } from "@/types";

// ─── Tab definition ───────────────────────────────────────────────────────────

type Tab = "new" | "active" | "history";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "new", label: "New Orders", icon: Bell },
  { id: "active", label: "In Kitchen", icon: UtensilsCrossed },
  { id: "history", label: "History", icon: PackageCheck },
];

// ─── Live indicator ───────────────────────────────────────────────────────────

function LiveIndicator({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          connected ? "bg-green-400" : "bg-muted-foreground"
        )}
      >
        {connected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        )}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          connected ? "text-green-400" : "text-muted-foreground"
        )}
      >
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const notifPermRef = useRef(false);

  // Request browser notification permission on mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default" &&
      !notifPermRef.current
    ) {
      notifPermRef.current = true;
      Notification.requestPermission().catch(() => {/* swallow */});
    }
  }, []);

  // Fetch orders from API
  useEffect(() => {
    if (!token || !user?.branchId) return;
    api
      .get(`/delivery/restaurant/orders?branchId=${user.branchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch(console.error);
  }, [token, user?.branchId]);

  // ── Derived order slices ────────────────────────────────────────────────────
  const newOrders = orders.filter((o) => o.status === "placed");
  const activeOrders = orders.filter((o) =>
    (["confirmed", "preparing", "ready_for_pickup"] as OrderStatus[]).includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    (["delivered", "cancelled"] as OrderStatus[]).includes(o.status)
  );

  // ── Socket integration ──────────────────────────────────────────────────────
  const { isConnected } = useOrdersSocket(
    user?.branchId ?? null,
    (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order from ${newOrder.customerName}!`, {
        description: `#${newOrder.orderId}`,
        duration: 6000,
      });
      // Browser notification
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification("New Order!", {
          body: `${newOrder.customerName} placed an order — #${newOrder.orderId}`,
          icon: "/icon-192.png",
        });
      }
      // Switch to new-orders tab so the user sees it
      setActiveTab("new");
    },
    (orderId, status) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as OrderStatus } : o))
      );
    }
  );

  // ── Action handlers ─────────────────────────────────────────────────────────
  const handleConfirm = async (id: string, prepMinutes: number) => {
    try {
      await api.patch(
        `/delivery/restaurant/orders/${id}/status`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status: "confirmed" as OrderStatus,
                estimatedPrepMinutes: prepMinutes,
                confirmedAt: new Date().toISOString(),
              }
            : o
        )
      );
      toast.success("Order confirmed!", { description: `Prep time: ${prepMinutes} min` });
    } catch {
      toast.error("Failed to confirm order");
    }
  };

  const handleMarkReady = async (id: string) => {
    try {
      await api.patch(
        `/delivery/restaurant/orders/${id}/status`,
        { status: 'ready_for_pickup' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status: "ready_for_pickup" as OrderStatus, readyAt: new Date().toISOString() }
            : o
        )
      );
      toast.success("Order marked as ready!", { description: "Notifying rider now." });
    } catch {
      toast.error("Failed to update order");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.patch(
        `/delivery/restaurant/orders/${id}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o))
      );
      toast.error("Order declined");
    } catch {
      toast.error("Failed to decline order");
    }
  };

  // ── Shared card renderer ────────────────────────────────────────────────────
  const renderCard = (order: DeliveryOrder) => (
    <OrderCard
      key={order.id}
      order={order}
      onConfirm={handleConfirm}
      onMarkReady={handleMarkReady}
      onDecline={handleDecline}
    />
  );

  // ── Mobile tab content ──────────────────────────────────────────────────────
  const tabContent: Record<Tab, { orders: DeliveryOrder[]; empty: string }> = {
    new: { orders: newOrders, empty: "No new orders right now.\nSit tight!" },
    active: { orders: activeOrders, empty: "Nothing in the kitchen.\nOrders will appear here." },
    history: { orders: historyOrders, empty: "No completed orders today." },
  };

  const currentTabData = tabContent[activeTab];

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Live Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time order management</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <LiveIndicator connected={isConnected} />
          <div className="glass-card px-3 py-1.5 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{orders.length}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">total</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE layout — tabs
      ══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col flex-1">
        {/* Tab bar */}
        <div className="flex border-b border-white/[0.08] mb-4">
          {TABS.map((tab) => {
            const count =
              tab.id === "new"
                ? newOrders.length
                : tab.id === "active"
                ? activeOrders.length
                : historyOrders.length;

            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden xs:inline">{tab.label}</span>

                {/* New-orders pulsing amber dot */}
                {tab.id === "new" && count > 0 && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                  </span>
                )}

                {/* Count badge (non-new tabs) */}
                {tab.id !== "new" && count > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-[10px] font-bold text-foreground ml-0.5">
                    {count}
                  </span>
                )}

                {/* New orders: show count in badge too */}
                {tab.id === "new" && count > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 h-4 rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-400 ml-0.5">
                    {count}
                  </span>
                )}

                {/* Active underline */}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 pb-24"
            >
              {currentTabData.orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <span className="text-5xl select-none">
                    {activeTab === "new" ? "⏳" : activeTab === "active" ? "🍳" : "✅"}
                  </span>
                  <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed whitespace-pre-line">
                    {currentTabData.empty}
                  </p>
                </div>
              ) : (
                currentTabData.orders.map(renderCard)
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP layout — Kanban 3-column grid
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:grid grid-cols-3 gap-6 flex-1">
        {/* Column 1 — New Orders (amber) */}
        <OrderColumn
          title="New Orders"
          count={newOrders.length}
          accentColor="amber"
          orders={newOrders}
          emptyMessage="No new orders. New orders will appear here in real-time."
        >
          <AnimatePresence>
            {newOrders.map(renderCard)}
          </AnimatePresence>
        </OrderColumn>

        {/* Column 2 — In Kitchen (blue) */}
        <OrderColumn
          title="In Kitchen"
          count={activeOrders.filter((o) => o.status !== "ready_for_pickup").length}
          accentColor="blue"
          orders={activeOrders.filter((o) => o.status !== "ready_for_pickup")}
          emptyMessage="No orders being prepared right now."
        >
          <AnimatePresence>
            {activeOrders
              .filter((o) => o.status !== "ready_for_pickup")
              .map(renderCard)}
          </AnimatePresence>
        </OrderColumn>

        {/* Column 3 — Ready / Out for delivery (green) */}
        <OrderColumn
          title="Ready / Out"
          count={
            orders.filter((o) =>
              (["ready_for_pickup", "picked_up", "delivered"] as OrderStatus[]).includes(o.status)
            ).length
          }
          accentColor="green"
          orders={orders.filter((o) =>
            (["ready_for_pickup", "picked_up", "delivered"] as OrderStatus[]).includes(o.status)
          )}
          emptyMessage="Orders ready for pickup or delivered today will appear here."
        >
          <AnimatePresence>
            {orders
              .filter((o) =>
                (["ready_for_pickup", "picked_up", "delivered"] as OrderStatus[]).includes(
                  o.status
                )
              )
              .map(renderCard)}
          </AnimatePresence>
        </OrderColumn>
      </div>
    </div>
  );
}
