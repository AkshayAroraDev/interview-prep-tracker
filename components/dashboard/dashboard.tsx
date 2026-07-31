"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProgressCards } from "@/components/dashboard/progress-cards";
import { useAuth } from "@/components/providers/auth-provider";
import { useTracker } from "@/components/providers/tracker-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { TechnologyIcon } from "@/components/technology/technology-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOverallStats, getTechnologyProgress } from "@/lib/progress";

function getFirstName(displayName: string | undefined, email: string | undefined): string | null {
  const candidate = displayName?.trim() || email?.split("@")[0]?.trim();
  if (!candidate) {
    return null;
  }

  return candidate.split(/[\s._-]+/)[0] || null;
}

export function Dashboard() {
  const { user } = useAuth();
  const { state, isHydrated } = useTracker();
  const overallStats = getOverallStats(state);
  const [animatedSummary, setAnimatedSummary] = useState({ total: 0, completed: 0, percentage: 0 });
  const previousSummaryRef = useRef({ total: 0, completed: 0, percentage: 0 });

  const firstName = getFirstName(
    (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined),
    user?.email,
  );

  const greeting = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  const nextTechnology = state.technologies.find((technology) => {
    const progress = getTechnologyProgress(technology);
    return progress.percentage < 100;
  });

  const everythingCompleted =
    isHydrated &&
    state.technologies.length > 0 &&
    overallStats.total > 0 &&
    overallStats.completed === overallStats.total;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      const immediate = {
        total: overallStats.total,
        completed: overallStats.completed,
        percentage: overallStats.percentage,
      };
      setAnimatedSummary(immediate);
      previousSummaryRef.current = immediate;
      return;
    }

    const duration = 600;
    const start = performance.now();
    const from = { ...previousSummaryRef.current };
    const to = {
      total: overallStats.total,
      completed: overallStats.completed,
      percentage: overallStats.percentage,
    };

    let raf = 0;
    const tick = (time: number) => {
      const progressRatio = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - progressRatio, 3);

      setAnimatedSummary({
        total: Math.round(from.total + (to.total - from.total) * eased),
        completed: Math.round(from.completed + (to.completed - from.completed) * eased),
        percentage: Math.round(from.percentage + (to.percentage - from.percentage) * eased),
      });

      if (progressRatio < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previousSummaryRef.current = to;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isHydrated, overallStats.completed, overallStats.percentage, overallStats.total]);

  return (
    <div className="mx-auto w-full max-w-[96rem] space-y-10 px-4 py-8 sm:px-6 lg:space-y-12 lg:px-8 min-[1920px]:max-w-[118rem] min-[1920px]:px-10">
      <section className="animate-in fade-in-0 duration-300 motion-reduce:animate-none">
        <Card className="border-border/70 bg-card/80 [--card-spacing:--spacing(6)] backdrop-blur-sm">
          <CardHeader className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/35 px-2.5 py-1 text-fluid-helper font-medium text-muted-foreground">
                <Sparkles className="size-3.5" />
                Dashboard
              </div>
              <h1 className="text-fluid-page-title font-semibold tracking-tight">{greeting}</h1>
              <p className="max-w-3xl text-fluid-body text-muted-foreground">
                Track your interview readiness, review what is completed, and pick up exactly where
                you left off.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/45 px-4 py-3">
                <p className="text-fluid-helper text-muted-foreground">Total Topics</p>
                <p className="mt-1 text-fluid-metric font-semibold tabular-nums">{animatedSummary.total}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/45 px-4 py-3">
                <p className="text-fluid-helper text-muted-foreground">Completed</p>
                <p className="mt-1 text-fluid-metric font-semibold tabular-nums">{animatedSummary.completed}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/45 px-4 py-3">
                <p className="text-fluid-helper text-muted-foreground">Overall Completion</p>
                <p className="mt-1 text-fluid-metric font-semibold tabular-nums">{animatedSummary.percentage}%</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              {everythingCompleted ? (
                <p className="text-fluid-body text-muted-foreground">
                  Great work. You have completed all tracked topics.
                </p>
              ) : (
                <p className="text-fluid-body text-muted-foreground">
                  Continue building momentum with your next unfinished technology.
                </p>
              )}

              {!everythingCompleted && nextTechnology ? (
                <Link
                  href={`/technology/${nextTechnology.id}`}
                  className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <Button size="sm" className="gap-1.5">
                    Continue Learning
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : null}
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="pt-1">
        <ProgressCards />
      </section>

      <section className="space-y-8 pt-2 lg:space-y-10 lg:pt-3">
        <div className="space-y-2 pt-2 pb-4">
          <h2 className="text-fluid-section-heading font-semibold">All technologies</h2>
          <p className="text-fluid-body text-muted-foreground">
            Quick snapshot of progress across each stack.
          </p>
        </div>

        {!isHydrated ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-border/70 bg-muted/30"
              />
            ))}
          </div>
        ) : state.technologies.length === 0 ? (
          <EmptyState
            title="No technologies yet"
            description="Use the sidebar to add your first technology and start tracking topics."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-4">
            {state.technologies.map((technology, index) => {
              const progress = getTechnologyProgress(technology);

              return (
                <Link
                  key={technology.id}
                  href={`/technology/${technology.id}`}
                  className="rounded-xl transition-transform duration-200 ease-in-out active:scale-[0.995] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <Card
                    className="group h-full border-border/70 bg-card shadow-none [--card-spacing:--spacing(6)] animate-in fade-in-0 slide-in-from-bottom-2 transition-all duration-200 ease-in-out hover:-translate-y-[3px] hover:border-[var(--technology-accent)] hover:bg-[color-mix(in_oklch,var(--card),white_4%)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.26)] motion-reduce:animate-none motion-reduce:transform-none"
                    style={{
                      "--technology-accent": technology.color,
                      animationDelay: `${index * 55}ms`,
                    } as React.CSSProperties}
                  >
                    <CardHeader className="space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <TechnologyIcon
                            technology={technology}
                            className="text-muted-foreground transition-transform duration-200 ease-in-out group-hover:scale-[1.08]"
                          />
                          <CardTitle>{technology.name}</CardTitle>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-all duration-200 ease-in-out group-hover:translate-x-[4px] group-hover:text-foreground" />
                      </div>
                      {technology.description ? (
                        <p className="min-h-[2.75rem] line-clamp-2 text-fluid-body text-muted-foreground">
                          {technology.description}
                        </p>
                      ) : (
                        <div className="min-h-[2.75rem]" />
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto pt-2">
                      <ProgressBar
                        value={progress.percentage}
                        label={`${progress.completed} of ${progress.total} topics`}
                        accentColor={technology.color}
                        className="[&_[data-slot=progress-indicator]]:shadow-[0_0_10px_var(--progress-accent),inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
