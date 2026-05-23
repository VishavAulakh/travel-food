"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  UtensilsCrossed,
  LayoutDashboard,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "md:hidden",
        "fixed bottom-0 left-0 right-0 z-50",
        "h-16 pb-safe",
        "bg-background/95 backdrop-blur-sm border-t border-border",
        "flex items-center justify-around px-2"
      )}
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "relative w-14 h-12 rounded-lg",
              "transition-colors duration-200",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* Active indicator dot above icon */}
            {active && (
              <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
            <Icon
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                active && "scale-110"
              )}
            />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
