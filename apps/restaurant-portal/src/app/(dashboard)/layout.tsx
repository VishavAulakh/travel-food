"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/lib/query-client";
import { PageTitleProvider, usePageTitle } from "@/lib/page-title-context";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { title, subtitle } = usePageTitle();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: sidebar + content */}
      <Sidebar />

      {/* Mobile: top bar */}
      <TopBar title={title} subtitle={subtitle} />

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-auto",
          // Push content right on desktop to account for sidebar
          "md:ml-60",
          // Add bottom padding on mobile for bottom nav
          "pb-20 md:pb-6",
          "px-4 md:px-6 py-4 md:py-6"
        )}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace("/auth");
    }
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <PageTitleProvider>
        <AuthGuard>
          <DashboardInner>{children}</DashboardInner>
        </AuthGuard>
      </PageTitleProvider>
    </ReactQueryProvider>
  );
}
