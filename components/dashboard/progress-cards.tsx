"use client";

import {
  BookOpen,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  getOverallStats,
  getTechnologyProgress,
} from "@/lib/progress";
import type { Technology } from "@/types";

interface ProgressCardsProps {
  technology?: Technology;
}

export function ProgressCards({ technology }: ProgressCardsProps) {
  const { state, isHydrated } = useTracker();
  const stats = technology
    ? getTechnologyProgress(technology)
    : getOverallStats(state);

  if (!isHydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[112px] animate-pulse rounded-xl border border-border/70 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  const scopeHint = technology
    ? `In ${technology.name}`
    : "Across all technologies";

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Topics"
        value={stats.total}
        hint={scopeHint}
        icon={BookOpen}
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        hint={`${stats.percentage}% complete`}
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
