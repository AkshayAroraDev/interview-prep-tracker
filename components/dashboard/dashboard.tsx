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

  const greetingName = firstName ?? "there";

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
      <section className="animate-in fade-in-0 duration-240 motion-reduce:animate-none">
        <Card className="relative overflow-hidden border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card),white_3%)_0%,var(--card)_100%)] [--card-spacing:--spacing(6)] shadow-[0_24px_60px_-48px_black]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-16 size-64 rounded-full bg-primary/8 blur-2xl" />
            <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-sky-500/6 blur-2xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <CardHeader className="relative space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--primary),transparent_72%)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary),transparent_90%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary),transparent_84%),0_12px_24px_-22px_color-mix(in_oklch,var(--primary),transparent_18%)]">
                  <Sparkles className="size-3.5" />
                  Dashboard
                </div>
                <div className="space-y-2.5">
                  <h1 className="text-fluid-page-title font-semibold tracking-tight text-foreground">
                    Welcome back{firstName ? (
                      <>
                        , <span className="bg-[linear-gradient(90deg,color-mix(in_oklch,var(--primary),white_12%)_0%,color-mix(in_oklch,oklch(0.62_0.18_260),white_10%)_100%)] bg-clip-text text-transparent drop-shadow-[0_0_18px_color-mix(in_oklch,oklch(0.62_0.18_260),transparent_45%)]">
                          {greetingName}
                        </span>
                      </>
                    ) : null}
                  </h1>
                  <p className="max-w-2xl text-fluid-body leading-relaxed text-muted-foreground">
                    Track your interview readiness, review what is completed, and pick up exactly where
                    you left off.
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:min-w-[30rem] lg:flex-1">
                <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_6%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] px-4 py-3 shadow-[0_12px_24px_-22px_black]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                    Total Topics
                  </p>
                  <p className="mt-1.5 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[2.2rem]">
                    {animatedSummary.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_6%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] px-4 py-3 shadow-[0_12px_24px_-22px_black]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                    Completed
                  </p>
                  <p className="mt-1.5 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[2.2rem]">
                    {animatedSummary.completed}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_6%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] px-4 py-3 shadow-[0_12px_24px_-22px_black]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                    Overall Completion
                  </p>
                  <p className="mt-1.5 text-[2rem] font-semibold leading-none tracking-tight tabular-nums text-foreground sm:text-[2.2rem]">
                    {animatedSummary.percentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              {everythingCompleted ? (
                <p className="max-w-2xl text-fluid-body text-muted-foreground">
                  Great work. You have completed all tracked topics.
                </p>
              ) : (
                <p className="max-w-2xl text-fluid-body text-muted-foreground">
                  Continue building momentum with your next unfinished technology.
                </p>
              )}

              {!everythingCompleted && nextTechnology ? (
                <Link
                  href={`/technology/${nextTechnology.id}`}
                  className="inline-flex self-start rounded-xl bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary),white_10%)_0%,var(--primary)_100%)] p-px shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary),transparent_82%),0_16px_32px_-18px_color-mix(in_oklch,var(--primary),transparent_12%),0_0_28px_-14px_color-mix(in_oklch,oklch(0.62_0.18_260),transparent_65%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
                >
                  <Button size="sm" className="gap-1.5 rounded-[calc(var(--radius)-1px)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
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
            {state.technologies.map((technology) => {
              const progress = getTechnologyProgress(technology);

              return (
                <Link
                  key={technology.id}
                  href={`/technology/${technology.id}`}
                  className="group rounded-xl transition-transform duration-200 ease-in-out active:scale-[0.995] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <Card
                    className="relative h-full overflow-hidden border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card),white_3%)_0%,var(--card)_100%)] shadow-[0_10px_24px_-22px_black] [--card-spacing:--spacing(6)] animate-in fade-in-0 slide-in-from-bottom-2 transition-[transform,box-shadow,border-color] duration-220 ease-out hover:-translate-y-1 hover:border-[var(--technology-accent)] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.42)] motion-reduce:animate-none motion-reduce:transform-none"
                    style={{
                      "--technology-accent": technology.color,
                    } as React.CSSProperties}
                  >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -top-20 -right-16 size-52 rounded-full bg-[var(--technology-accent)]/8 blur-2xl transition-opacity duration-220 group-hover:opacity-100 opacity-70" />
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    <CardHeader className="relative space-y-2.5 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_6%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] shadow-[0_10px_24px_-18px_black] transition-[transform,box-shadow] duration-220 ease-out group-hover:scale-[1.06] group-hover:shadow-[0_14px_26px_-16px_color-mix(in_oklch,var(--technology-accent),transparent_25%)]" style={{ borderColor: `${technology.color}66` }}>
                            <TechnologyIcon
                              technology={technology}
                              className="text-[color:var(--technology-accent)] transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                            />
                          </span>
                          <CardTitle className="truncate">{technology.name}</CardTitle>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-220 ease-out group-hover:translate-x-1 group-hover:text-foreground" />
                      </div>
                      {technology.description ? (
                        <p className="min-h-[2.75rem] line-clamp-2 text-fluid-body leading-relaxed text-muted-foreground/85">
                          {technology.description}
                        </p>
                      ) : (
                        <div className="min-h-[2.75rem]" />
                      )}
                    </CardHeader>
                    <CardContent className="relative mt-auto pt-2">
                      <ProgressBar
                        value={progress.percentage}
                        label={`${progress.completed} of ${progress.total} topics`}
                        accentColor={technology.color}
                        className="rounded-2xl border border-border/60 bg-background/35 px-3.5 py-3 shadow-[0_10px_24px_-22px_black] [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-muted/65 [&_[data-slot=progress-track]]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] [&_[data-slot=progress-indicator]]:shadow-[0_0_12px_var(--progress-accent),inset_0_0_0_1px_rgba(255,255,255,0.16)]"
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
