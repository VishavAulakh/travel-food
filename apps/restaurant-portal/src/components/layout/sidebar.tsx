"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  UtensilsCrossed,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { restaurant, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex",
        "fixed left-0 top-0 bottom-0 z-40",
        "w-60 flex-col",
        "bg-card border-r border-border"
      )}
    >
      {/* Brand / Restaurant Identity */}
      <div className="flex items-center gap-3 p-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 shrink-0">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {restaurant?.name ?? "Restaurant"}
          </p>
          <p className="text-xs text-muted-foreground">Restaurant Partner</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-all duration-200",
                "relative overflow-hidden",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border-l-2 border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}
