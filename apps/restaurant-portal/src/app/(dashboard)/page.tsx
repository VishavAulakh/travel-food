"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  Timer,
  TrendingUp,
  ClipboardList,
  UtensilsCrossed,
  BarChart2,
  Settings,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  todayStats,
  weeklyRevenue,
  topItems,
  recentOrders,
} from "@/lib/mock/analytics";
import { formatINR, formatRelativeTime, cn } from "@/lib/utils";

// ─── Inline SVG Area Chart ──────────────────────────────────────────────────

function RevenueChart() {
  const data = weeklyRevenue;
  const maxVal = Math.max(...data.map((d) => d.revenuePaise));
  const W = 600;
  const H = 180;
  const PAD_LEFT = 48;
  const PAD_RIGHT = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 32;

  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => ({
    x: PAD_LEFT + (i / (data.length - 1)) * chartW,
    y: PAD_TOP + chartH - (d.revenuePaise / maxVal) * chartH,
    label: d.day,
    value: d.revenuePaise,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + chartH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD_TOP + chartH).toFixed(1)} Z`;

  const yTicks = [0, 0.5, 1].map((t) => ({
    y: PAD_TOP + chartH - t * chartH,
    label: formatINR(maxVal * t),
  }));

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "auto", maxHeight: 220 }}
        aria-label="Weekly revenue chart"
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FC5F30" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FC5F30" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y-axis labels */}
        {yTicks.map((tick, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={PAD_LEFT}
              y1={tick.y}
              x2={W - PAD_RIGHT}
              y2={tick.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 6}
              y={tick.y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#revenueGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#FC5F30"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#FC5F30" />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={`x-${i}`}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fill={i === data.length - 1 ? "#FC5F30" : "rgba(255,255,255,0.4)"}
            fontSize="10"
            fontWeight={i === data.length - 1 ? "600" : "400"}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Animation variants ─────────────────────────────────────────────────────

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});

// ─── Quick action cards ─────────────────────────────────────────────────────

const quickActions = [
  { label: "View Orders", emoji: "📋", href: "/orders" },
  { label: "Manage Menu", emoji: "🍽️", href: "/menu" },
  { label: "Insights", emoji: "📊", href: "/insights" },
  { label: "Settings", emoji: "⚙️", href: "/settings" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const restaurant = useAuthStore((s) => s.restaurant);
  const [accepting, setAccepting] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const maxItemOrders = Math.max(...topItems.map((i) => i.orders));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* ── Offline banner ─────────────────────────────────────────────── */}
      {!accepting && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-3"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="flex-1 text-sm text-amber-200">
            You are currently{" "}
            <span className="font-semibold text-amber-400">not accepting</span>{" "}
            delivery orders
          </p>
          <Button
            size="sm"
            className="shrink-0 bg-amber-500 text-black hover:bg-amber-400 font-semibold"
            onClick={() => setAccepting(true)}
          >
            <Wifi className="h-3.5 w-3.5" />
            Go Online
          </Button>
        </motion.div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            {greeting},{" "}
            <span className="text-primary">
              {restaurant?.name ?? "Paradise Biryani"}
            </span>{" "}
            👋
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* Accepting orders toggle */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
            accepting
              ? "border-green-500/30 bg-green-400/5"
              : "border-amber-500/30 bg-amber-400/5"
          )}
        >
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">
              Accepting Orders
            </span>
            <span
              className={cn(
                "text-xs",
                accepting ? "text-green-400" : "text-amber-400"
              )}
            >
              {accepting ? "Online" : "Offline"}
            </span>
          </div>
          <Switch
            checked={accepting}
            onCheckedChange={setAccepting}
            aria-label="Toggle accepting orders"
          />
        </div>
      </motion.div>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Orders Today"
          value={String(todayStats.totalOrders)}
          subValue={`${todayStats.completedOrders} completed`}
          icon={ShoppingBag}
          accent="orange"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Revenue"
          value={formatINR(todayStats.totalRevenuePaise)}
          subValue={`Avg ${formatINR(todayStats.avgOrderValuePaise)}/order`}
          icon={IndianRupee}
          accent="green"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          label="Pending"
          value={String(todayStats.pendingOrders)}
          subValue="awaiting action"
          icon={Clock}
          accent={todayStats.pendingOrders > 5 ? "red" : "amber"}
        />
        <StatCard
          label="Avg Prep Time"
          value={`${todayStats.avgPrepMinutes} min`}
          subValue={`Peak: ${todayStats.peakHour}`}
          icon={Timer}
          accent="default"
        />
      </motion.div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.1)}>
        <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-95"
            >
              <span>{action.emoji}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Revenue chart ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.15)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Weekly Revenue
            </h2>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-primary">
              {formatINR(todayStats.totalRevenuePaise)}
            </p>
            <p className="text-xs text-green-400">+8% vs last week</p>
          </div>
        </div>
        <RevenueChart />
      </motion.div>

      {/* ── Top items ────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.2)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Top Items This Week
          </h2>
        </div>

        {/* Mobile: card list / Desktop: table-like rows */}
        <div className="hidden md:block">
          <div className="mb-2 grid grid-cols-[1fr_80px_100px] gap-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Item</span>
            <span className="text-center">Orders</span>
            <span className="text-right">Revenue</span>
          </div>
          <div className="flex flex-col gap-1">
            {topItems.map((item, i) => (
              <div
                key={item.name}
                className={cn(
                  "grid grid-cols-[1fr_80px_100px] items-center gap-2 rounded-lg px-2 py-2.5",
                  i === 0 ? "bg-primary/5 border border-primary/15" : "hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      i === 0
                        ? "bg-primary text-white"
                        : "bg-white/[0.08] text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      i === 0 ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                </div>
                <span className="text-center text-sm text-muted-foreground">
                  {item.orders}
                </span>
                <span className="text-right text-sm font-medium text-foreground">
                  {formatINR(item.revenuePaise)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view */}
        <div className="flex flex-col gap-3 md:hidden">
          {topItems.map((item, i) => (
            <div key={item.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                      i === 0
                        ? "bg-primary text-white"
                        : "bg-white/[0.08] text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      i === 0 ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {formatINR(item.revenuePaise)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.orders} orders
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    i === 0 ? "bg-primary" : "bg-white/20"
                  )}
                  style={{ width: `${(item.orders / maxItemOrders) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent orders ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.25)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Orders
          </h2>
          <Link
            href="/orders"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-white/[0.05]">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {order.customerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {order.items[0].name}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {formatINR(order.totalPaise)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(order.deliveredAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
