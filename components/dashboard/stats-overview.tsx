"use client";

import {
  BookOpen,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { getOverallStats } from "@/lib/progress";
import { useTracker } from "@/components/providers/tracker-provider";

export function StatsOverview() {
  const { state, isHydrated } = useTracker();
  const stats = getOverallStats(state);

  if (!isHydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Topics"
        value={stats.total}
        hint="Across all technologies"
        icon={BookOpen}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        hint={`${stats.percentage}% overall progress`}
        icon={CheckCircle2}
        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      />
      <StatCard
        label="In Progress"
        value={stats.inProgress}
        hint={`${stats.notStarted} not started`}
        icon={TrendingUp}
        accentClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
      />
      <StatCard
        label="Needs Review"
        value={stats.needsReview}
        hint="Topics to revisit"
        icon={RotateCcw}
        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}

export function EmptyProgressHint() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-fluid-body text-muted-foreground">
      <CircleDashed className="size-4 shrink-0" />
      Add technologies and topics to start tracking your interview prep.
    </div>
  );
}
