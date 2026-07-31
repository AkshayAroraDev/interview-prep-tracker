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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setAnimatedStats(stats);
      previousStatsRef.current = stats;
      return;
    }

    const duration = 550;
    const start = performance.now();
    const from = { ...previousStatsRef.current };

    let raf = 0;
    const tick = (time: number) => {
      const progressRatio = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progressRatio, 3);

      setAnimatedStats({
        total: Math.round(from.total + (stats.total - from.total) * eased),
        completed: Math.round(from.completed + (stats.completed - from.completed) * eased),
        inProgress: Math.round(from.inProgress + (stats.inProgress - from.inProgress) * eased),
        needsReview: Math.round(from.needsReview + (stats.needsReview - from.needsReview) * eased),
        notStarted: Math.round(from.notStarted + (stats.notStarted - from.notStarted) * eased),
        percentage: Math.round(from.percentage + (stats.percentage - from.percentage) * eased),
      });

      if (progressRatio < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previousStatsRef.current = stats;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isHydrated, stats]);

  const cards = useMemo(
    () => [
      {
        label: "Total Topics",
        value: animatedStats.total,
        hint: technology ? `In ${technology.name}` : "Across all technologies",
        icon: BookOpen,
      },
      {
        label: "Completed",
        value: animatedStats.completed,
        hint: `${animatedStats.percentage}% complete`,
        icon: CheckCircle2,
        accentClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "In Progress",
        value: animatedStats.inProgress,
        hint: `${animatedStats.notStarted} not started`,
        icon: TrendingUp,
        accentClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      },
      {
        label: "Needs Review",
        value: animatedStats.needsReview,
        hint: "Topics to revisit",
        icon: RotateCcw,
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
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <StatCard
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            accentClassName={card.accentClassName}
          />
        </div>
      ))}
    </div>
  );
}
