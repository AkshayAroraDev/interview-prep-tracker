"use client";

import {
  BookOpen,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [animatedStats, setAnimatedStats] = useState(stats);
  const previousStatsRef = useRef(stats);
  const {
    total,
    completed,
    inProgress,
    needsReview,
    notStarted,
    percentage,
  } = stats;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const previous = previousStatsRef.current;

    // Don't restart the animation if the values haven't changed.
    if (
      previous.total === stats.total &&
      previous.completed === stats.completed &&
      previous.inProgress === stats.inProgress &&
      previous.needsReview === stats.needsReview &&
      previous.notStarted === stats.notStarted &&
      previous.percentage === stats.percentage
    ) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      previousStatsRef.current = stats;
      setAnimatedStats(stats);
      return;
    }

    const duration = 240;
    const start = performance.now();
    const from = { ...previous };

    // Mark the new values immediately so re-renders don't restart the animation.
    previousStatsRef.current = stats;

    let raf = 0;
    const tick = (time: number) => {
      const progressRatio = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progressRatio, 3);

      setAnimatedStats({
        total: Math.round(from.total + (total - from.total) * eased),
        completed: Math.round(from.completed + (completed - from.completed) * eased),
        inProgress: Math.round(from.inProgress + (inProgress - from.inProgress) * eased),
        needsReview: Math.round(from.needsReview + (needsReview - from.needsReview) * eased),
        notStarted: Math.round(from.notStarted + (notStarted - from.notStarted) * eased),
        percentage: Math.round(from.percentage + (percentage - from.percentage) * eased),
      });

      if (progressRatio < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isHydrated,
    total,
    completed,
    inProgress,
    needsReview,
    notStarted,
    percentage,
  ]);

  const cards = useMemo(
    () => [
      {
        label: "Total Topics",
        value: animatedStats.total,
        hint: technology ? `In ${technology.name}` : "Across all technologies",
        icon: BookOpen,
        valueClassName: "text-[color:var(--primary)]",
      },
      {
        label: "Completed",
        value: animatedStats.completed,
        hint: `${animatedStats.percentage}% complete`,
        icon: CheckCircle2,
        valueClassName: "text-emerald-500 dark:text-emerald-400",
        accentClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "In Progress",
        value: animatedStats.inProgress,
        hint: `${animatedStats.notStarted} not started`,
        icon: TrendingUp,
        valueClassName: "text-sky-500 dark:text-sky-400",
        accentClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      },
      {
        label: "Needs Review",
        value: animatedStats.needsReview,
        hint: "Topics to revisit",
        icon: RotateCcw,
        valueClassName: "text-amber-500 dark:text-amber-400",
        accentClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      },
    ],
    [animatedStats, technology],
  );

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-border/70 bg-muted/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-220 motion-reduce:animate-none"
        >
          <StatCard
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            accentClassName={card.accentClassName}
            valueClassName={card.valueClassName}
          />
        </div>
      ))}
    </div>
  );
}
