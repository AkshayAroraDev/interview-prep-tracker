"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, LayoutDashboard, Plus, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";

import { ImportBackupDialog } from "@/components/shared/import-backup-dialog";
import { useTracker } from "@/components/providers/tracker-provider";
import { BrandMark } from "@/components/layout/brand-mark";
import { TechnologyFormDialog } from "@/components/technology/technology-form-dialog";
import { TechnologyIcon } from "@/components/technology/technology-icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getTechnologyProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { state, isHydrated, resetToSeed, exportProgress } = useTracker();
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const isOverview = pathname === "/";

  return (
    <aside
      className={cn(
        "flex h-full w-[17rem] shrink-0 flex-col overflow-hidden border-r border-sidebar-border/80 bg-[linear-gradient(180deg,var(--sidebar)_0%,color-mix(in_oklch,var(--sidebar),black_4%)_100%)] text-sidebar-foreground lg:w-72",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5.5">
        <BrandMark size={36} iconSize={18} />
        <div className="min-w-0">
          <p className="truncate text-fluid-label font-semibold tracking-tight text-sidebar-foreground">
            Prep Tracker
          </p>
          <p className="truncate text-fluid-helper text-muted-foreground/90">Interview study</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border/80" />

      <ScrollArea className="flex-1 overflow-hidden px-3 py-4.5">
        <nav className="space-y-1.5 pr-1">
          <SidebarLink
            href="/"
            active={isOverview}
            icon={LayoutDashboard}
            label="Overview"
            onNavigate={onNavigate}
          />

          <p className="px-2 pb-1.5 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground/90">
            Technologies
          </p>

          {!isHydrated ? (
            <div className="space-y-1.5 px-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-sidebar-accent/60"
                />
              ))}
            </div>
          ) : state.technologies.length === 0 ? (
            <p className="px-2.5 py-2 text-fluid-helper text-muted-foreground">
              No technologies yet. Add one to get started.
            </p>
          ) : (
            state.technologies.map((technology) => {
              const href = `/technology/${technology.id}`;
              const active = pathname === href;
              const progress = getTechnologyProgress(technology);

              return (
                <Link
                  key={technology.id}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group block w-full overflow-hidden rounded-xl border border-transparent px-2.5 py-2.5 text-fluid-body transition-all duration-200 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
                    active
                      ? "border-[color-mix(in_oklch,var(--sidebar-primary),var(--primary)_24%)] bg-[linear-gradient(95deg,color-mix(in_oklch,var(--sidebar-primary),transparent_68%)_0%,color-mix(in_oklch,var(--sidebar-accent),transparent_10%)_100%)] text-sidebar-accent-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--sidebar-primary),transparent_54%),0_0_26px_-12px_color-mix(in_oklch,var(--primary),transparent_34%),0_12px_26px_-22px_color-mix(in_oklch,var(--primary),transparent_10%),inset_0_0_0_1px_color-mix(in_oklch,var(--sidebar-border),transparent_42%)]"
                      : "text-sidebar-foreground/90 hover:border-sidebar-border/60 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <TechnologyIcon
                      technology={technology}
                      className="text-sidebar-foreground/75"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {technology.name}
                    </span>
                    <span
                      className={cn(
                        "text-fluid-helper font-medium tabular-nums",
                        active
                          ? "text-sidebar-accent-foreground/80"
                          : "text-muted-foreground/90",
                      )}
                    >
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-sidebar-accent/80">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,color-mix(in_oklch,var(--sidebar-primary),white_6%)_0%,var(--sidebar-primary)_100%)] transition-all duration-200 ease-in-out motion-reduce:transition-none"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border/90 px-3 pb-3 pt-2.5">
        <div className="rounded-2xl border border-[color-mix(in_oklch,var(--sidebar-primary),transparent_78%)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--sidebar-accent),transparent_28%)_0%,color-mix(in_oklch,var(--sidebar),black_3%)_100%)] p-2.5 shadow-[0_0_0_1px_color-mix(in_oklch,var(--sidebar-primary),transparent_78%),0_18px_34px_-28px_color-mix(in_oklch,var(--primary),transparent_22%)] backdrop-blur-sm">
          <p className="px-1.5 pb-2 text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground/90">
            Manage
          </p>
          <div className="space-y-1.5">
        <Button
          className="w-full justify-start rounded-xl"
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Add technology
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl text-muted-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-foreground"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="size-4" />
          Import backup
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl text-muted-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-foreground"
          onClick={() => exportProgress()}
        >
          <Download className="size-4" />
          Export progress
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl text-muted-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-foreground"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="size-4" />
          Reset demo data
        </Button>
          </div>
        </div>
      </div>

      <TechnologyFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ImportBackupDialog open={importOpen} onOpenChange={setImportOpen} />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset to demo data?"
        description="This replaces all technologies, sections, and topics with the default seed data."
        confirmLabel="Reset"
        onConfirm={resetToSeed}
      />
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-2.5 overflow-hidden rounded-xl border px-2.5 py-2.5 text-fluid-body transition-all duration-200 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
        active
          ? "border-sidebar-border/80 bg-[linear-gradient(95deg,color-mix(in_oklch,var(--sidebar-primary),transparent_76%)_0%,color-mix(in_oklch,var(--sidebar-accent),transparent_20%)_100%)] text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--sidebar-border),transparent_45%)]"
          : "border-transparent text-sidebar-foreground/90 hover:border-sidebar-border/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-75" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
