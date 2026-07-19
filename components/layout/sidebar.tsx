"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, GraduationCap, LayoutDashboard, Plus, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";

import { ImportBackupDialog } from "@/components/shared/import-backup-dialog";
import { useTracker } from "@/components/providers/tracker-provider";
import { TechnologyFormDialog } from "@/components/technology/technology-form-dialog";
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
        "flex h-full w-[17rem] shrink-0 flex-col overflow-hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground lg:w-72",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <GraduationCap className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-fluid-label font-semibold tracking-tight">Prep Tracker</p>
          <p className="truncate text-fluid-helper text-muted-foreground/90">Interview study</p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 overflow-hidden px-2.5 py-4">
        <nav className="space-y-1.5 pr-0.5">
          <SidebarLink
            href="/"
            active={isOverview}
            icon={LayoutDashboard}
            label="Overview"
            onNavigate={onNavigate}
          />

          <p className="px-2.5 pb-1.5 pt-4 text-fluid-helper font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
                    "group block w-full overflow-hidden rounded-lg border px-2.5 py-3 text-fluid-body transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
                    active
                      ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
                      : "border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: technology.color }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {technology.name}
                    </span>
                    <span
                      className={cn(
                        "text-fluid-helper font-medium tabular-nums",
                        active
                          ? "text-sidebar-accent-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-sidebar-accent/90">
                    <div
                      className="h-full rounded-full bg-sidebar-primary transition-all duration-150"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </nav>
      </ScrollArea>

      <div className="space-y-3 border-t border-sidebar-border/90 p-3.5">
        <Button
          className="w-full justify-start"
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Add technology
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="size-4" />
          Import backup
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => exportProgress()}
        >
          <Download className="size-4" />
          Export progress
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="size-4" />
          Reset demo data
        </Button>
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
        "flex w-full items-center gap-2.5 overflow-hidden rounded-lg border px-2.5 py-3 text-fluid-body transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
        active
          ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
          : "border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-75" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
