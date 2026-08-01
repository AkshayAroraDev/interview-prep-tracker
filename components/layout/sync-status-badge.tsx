"use client";

import { Loader2 } from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Synced:
    "border-emerald-500/25 bg-[linear-gradient(180deg,color-mix(in_oklch,oklch(0.72_0.16_160),transparent_88%)_0%,color-mix(in_oklch,oklch(0.72_0.16_160),transparent_93%)_100%)] text-emerald-700 dark:text-emerald-300",
  Syncing:
    "border-blue-500/25 bg-[linear-gradient(180deg,color-mix(in_oklch,oklch(0.68_0.13_250),transparent_88%)_0%,color-mix(in_oklch,oklch(0.68_0.13_250),transparent_93%)_100%)] text-blue-700 dark:text-blue-300",
  Offline:
    "border-amber-500/25 bg-[linear-gradient(180deg,color-mix(in_oklch,oklch(0.78_0.12_84),transparent_86%)_0%,color-mix(in_oklch,oklch(0.78_0.12_84),transparent_92%)_100%)] text-amber-700 dark:text-amber-300",
  Error:
    "border-destructive/25 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--destructive),transparent_86%)_0%,color-mix(in_oklch,var(--destructive),transparent_92%)_100%)] text-destructive",
};

export function SyncStatusBadge({ className }: { className?: string }) {
  const { syncStatus } = useTracker();

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full border px-2.5 py-1 text-[0.73rem] font-medium tracking-[0.01em] shadow-[0_8px_20px_-16px_black]",
        statusStyles[syncStatus],
        className,
      )}
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
