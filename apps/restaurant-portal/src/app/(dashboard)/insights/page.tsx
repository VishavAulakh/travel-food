"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  XCircle,
  Zap,
  BarChart2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  todayStats,
  weeklyRevenue,
  topItems,
} from "@/lib/mock/analytics";
import { formatINR, cn } from "@/lib/utils";

// ─── Period tabs ─────────────────────────────────────────────────────────────

type Period = "today" | "week" | "month";

const periodLabels: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

// ─── Mock metrics per period ─────────────────────────────────────────────────

const periodMetrics: Record<
  Period,
  {
    totalOrders: number;
    totalRevenuePaise: number;
    avgOrderValuePaise: number;
    cancelledOrders: number;
    ordersChange: number;
    revenueChange: number;
    aovChange: number;
    cancelChange: number;
  }
> = {
  today: {
    totalOrders: todayStats.totalOrders,
    totalRevenuePaise: todayStats.totalRevenuePaise,
    avgOrderValuePaise: todayStats.avgOrderValuePaise,
    cancelledOrders: todayStats.cancelledOrders,
    ordersChange: 12,
    revenueChange: 8,
    aovChange: 3,
    cancelChange: -25,
  },
  week: {
    totalOrders: 148,
    totalRevenuePaise: 12727500,
    avgOrderValuePaise: 85997,
    cancelledOrders: 9,
    ordersChange: 18,
    revenueChange: 22,
    aovChange: 5,
    cancelChange: -10,
  },
  month: {
    totalOrders: 612,
    totalRevenuePaise: 52740000,
    avgOrderValuePaise: 86176,
    cancelledOrders: 34,
    ordersChange: 31,
    revenueChange: 28,
    aovChange: 7,
    cancelChange: -8,
  },
};

const periodRevenueData: Record<Period, typeof weeklyRevenue> = {
  today: weeklyRevenue,
  week: weeklyRevenue,
  month: [
    { day: "W1", revenuePaise: 8900000 },
    { day: "W2", revenuePaise: 11200000 },
    { day: "W3", revenuePaise: 13450000 },
    { day: "W4", revenuePaise: 19190000 },
  ],
};

// ─── Inline SVG Area Chart ──────────────────────────────────────────────────

function RevenueAreaChart({ data }: { data: typeof weeklyRevenue }) {
  const maxVal = Math.max(...data.map((d) => d.revenuePaise));
  const W = 600;
  const H = 200;
  const PAD_LEFT = 52;
  const PAD_RIGHT = 12;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 32;

  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => ({
    x: PAD_LEFT + (i / Math.max(data.length - 1, 1)) * chartW,
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

  const ySteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "auto", maxHeight: 240 }}
        aria-label="Revenue chart"
      >
        <defs>
          <linearGradient id="insightsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FC5F30" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FC5F30" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {ySteps.map((t) => {
          const y = PAD_TOP + chartH - t * chartH;
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={W - PAD_RIGHT}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.3)"
                fontSize="8"
              >
                {formatINR(maxVal * t)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill="url(#insightsGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#FC5F30"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#FC5F30" />
            <circle
              cx={p.x}
              cy={p.y}
              r="7"
              fill="transparent"
              stroke="#FC5F30"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </g>
        ))}

        {/* X-axis */}
        {points.map((p, i) => (
          <text
            key={`x-${i}`}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Horizontal bar chart (div-based) ───────────────────────────────────────

function TopItemsBars() {
  const maxOrders = Math.max(...topItems.map((i) => i.orders));
  return (
    <div className="flex flex-col gap-3">
      {topItems.map((item, i) => (
        <div key={item.name} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                "font-medium",
                i === 0 ? "text-primary" : "text-foreground"
              )}
            >
              {item.name}
            </span>
            <span className="text-muted-foreground">{item.orders} orders</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className={cn(
                "absolute left-0 top-0 h-full rounded-full",
                i === 0 ? "bg-primary" : "bg-primary/40"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${(item.orders / maxOrders) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Order distribution ──────────────────────────────────────────────────────

function OrderDistribution({ metrics }: { metrics: (typeof periodMetrics)[Period] }) {
  const total = metrics.totalOrders;
  const completed = total - metrics.cancelledOrders - todayStats.pendingOrders;
  const pending = todayStats.pendingOrders;
  const cancelled = metrics.cancelledOrders;

  const pctCompleted = Math.round((completed / total) * 100);
  const pctPending = Math.round((pending / total) * 100);
  const pctCancelled = Math.round((cancelled / total) * 100);

  const rows = [
    {
      label: "Completed",
      count: completed,
      pct: pctCompleted,
      color: "bg-green-400",
      text: "text-green-400",
    },
    {
      label: "Pending",
      count: pending,
      pct: pctPending,
      color: "bg-amber-400",
      text: "text-amber-400",
    },
    {
      label: "Cancelled",
      count: cancelled,
      pct: pctCancelled,
      color: "bg-red-400",
      text: "text-red-400",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${pctCompleted}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.div
          className="bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${pctPending}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.div
          className="bg-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${pctCancelled}%` }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </div>

      {/* Legend rows */}
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("h-2.5 w-2.5 rounded-full", row.color)} />
              <span className="text-sm text-muted-foreground">{row.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm font-semibold", row.text)}>
                {row.count}
              </span>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {row.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const metrics = periodMetrics[period];
  const revenueData = periodRevenueData[period];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance overview for your restaurant
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(Object.entries(periodLabels) as [Period, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  period === key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* ── Key metrics ──────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={String(metrics.totalOrders)}
          icon={ShoppingBag}
          accent="orange"
          trend={{ value: metrics.ordersChange, positive: metrics.ordersChange > 0 }}
          subValue="vs previous period"
        />
        <StatCard
          label="Total Revenue"
          value={formatINR(metrics.totalRevenuePaise)}
          icon={IndianRupee}
          accent="green"
          trend={{ value: metrics.revenueChange, positive: metrics.revenueChange > 0 }}
          subValue="vs previous period"
        />
        <StatCard
          label="Avg Order Value"
          value={formatINR(metrics.avgOrderValuePaise)}
          icon={TrendingUp}
          accent="default"
          trend={{ value: metrics.aovChange, positive: metrics.aovChange > 0 }}
          subValue="per order"
        />
        <StatCard
          label="Cancelled"
          value={String(metrics.cancelledOrders)}
          icon={XCircle}
          accent="red"
          trend={{
            value: Math.abs(metrics.cancelChange),
            positive: metrics.cancelChange < 0,
          }}
          subValue="orders cancelled"
        />
      </motion.div>

      {/* ── Revenue chart ────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.1)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Revenue Trend
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {periodLabels[period]}
            </p>
          </div>
          <span className="text-base font-bold text-primary">
            {formatINR(metrics.totalRevenuePaise)}
          </span>
        </div>
        <RevenueAreaChart data={revenueData} />
      </motion.div>

      {/* ── Top selling items ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.15)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Top Selling Items
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">by orders</span>
        </div>
        <TopItemsBars />
      </motion.div>

      {/* ── Order distribution ───────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.2)} className="glass-card p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Order Distribution
          </h2>
        </div>
        <OrderDistribution metrics={metrics} />
      </motion.div>

      {/* ── Peak hours insight ───────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.25)} className="glass-card p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Peak Hours Insight
            </h2>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-foreground font-medium">
                  Peak hour: {todayStats.peakHour} – 2:00 PM
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-muted-foreground">
                  Most orders come on weekends (Fri–Sat)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="text-muted-foreground">
                  Saturday is consistently your highest revenue day
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span className="text-muted-foreground">
                  Tuesday sees the lowest order volume — consider running promotions
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
