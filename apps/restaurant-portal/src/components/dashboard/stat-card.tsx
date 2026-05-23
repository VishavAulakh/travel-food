"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  accent?: "orange" | "green" | "amber" | "red" | "default";
  loading?: boolean;
};

const accentStyles: Record<
  NonNullable<StatCardProps["accent"]>,
  { bg: string; text: string; iconBg: string }
> = {
  orange: {
    bg: "bg-primary/10",
    text: "text-primary",
    iconBg: "bg-primary/10",
  },
  green: {
    bg: "bg-green-400/10",
    text: "text-green-400",
    iconBg: "bg-green-400/10",
  },
  amber: {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    iconBg: "bg-amber-400/10",
  },
  red: {
    bg: "bg-red-400/10",
    text: "text-red-400",
    iconBg: "bg-red-400/10",
  },
  default: {
    bg: "bg-white/[0.06]",
    text: "text-muted-foreground",
    iconBg: "bg-white/[0.06]",
  },
};

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  accent = "default",
  loading = false,
}: StatCardProps) {
  const styles = accentStyles[accent];

  if (loading) {
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20 mt-1" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className="metric-card">
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", styles.iconBg)}>
          <Icon className={cn("h-4 w-4", styles.text)} />
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive
                ? "bg-green-400/10 text-green-400"
                : "bg-red-400/10 text-red-400"
            )}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.positive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      {/* Value */}
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>

      {/* Sub value */}
      {subValue && (
        <p className="text-xs text-muted-foreground">{subValue}</p>
      )}
    </div>
  );
}
