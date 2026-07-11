"use client";

import { Loader2 } from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Synced: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Syncing: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Offline: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Error: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function SyncStatusBadge({ className }: { className?: string }) {
  const { syncStatus } = useTracker();

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border px-2.5 py-1 text-xs font-medium", statusStyles[syncStatus], className)}
    >
      {syncStatus === "Syncing" ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <span className="size-2 rounded-full bg-current" />
      )}
      <span>{syncStatus}</span>
    </Badge>
  );
}
