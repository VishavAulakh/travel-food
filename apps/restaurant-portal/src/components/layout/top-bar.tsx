"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header
      className={cn(
        "md:hidden",
        "flex items-center justify-between",
        "h-14 px-4",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        "sticky top-0 z-40"
      )}
    >
      <div className="flex flex-col min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {/* Notification indicator */}
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
      </Button>
    </header>
  );
}
