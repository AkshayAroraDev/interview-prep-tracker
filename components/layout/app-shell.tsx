"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { AuthControls } from "@/components/auth/auth-controls";
import { Sidebar } from "@/components/layout/sidebar";
import { SyncStatusBadge } from "@/components/layout/sync-status-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_88%)_0%,transparent_32%),radial-gradient(circle_at_top_right,color-mix(in_oklch,oklch(0.62_0.18_260),transparent_90%)_0%,transparent_28%),linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--background),black_2%)_100%)] bg-background">
      <Sidebar className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_3%)_0%,var(--background)_100%)] px-3.5 backdrop-blur-md md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl border border-border/60 bg-card/50 text-foreground hover:bg-muted md:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <Sidebar onNavigate={() => setMobileOpen(false)} className="border-0" />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block" />

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <SyncStatusBadge className="hidden sm:inline-flex" />
            <AuthControls />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="animate-in fade-in-0 slide-in-from-bottom-1 px-0 duration-300 motion-reduce:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
