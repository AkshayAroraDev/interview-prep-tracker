"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProgressCards } from "@/components/dashboard/progress-cards";
import { useTracker } from "@/components/providers/tracker-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTechnologyProgress } from "@/lib/progress";

export function Dashboard() {
  const { state, isHydrated } = useTracker();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Your interview prep at a glance. Select a technology from the sidebar to dive in.
        </p>
      </header>

      <ProgressCards />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">All technologies</h2>
          <p className="text-xs text-muted-foreground">
            Quick snapshot of progress across each stack.
          </p>
        </div>

        {!isHydrated ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-lg border bg-muted/30"
              />
            ))}
          </div>
        ) : state.technologies.length === 0 ? (
          <EmptyState
            title="No technologies yet"
            description="Use the sidebar to add your first technology and start tracking topics."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {state.technologies.map((technology) => {
              const progress = getTechnologyProgress(technology);

              return (
                <Link key={technology.id} href={`/technology/${technology.id}`}>
                  <Card className="group h-full border-border/60 bg-card/50 shadow-none transition-all duration-150 hover:border-border hover:bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: technology.color }}
                          />
                          <CardTitle className="text-base font-medium">
                            {technology.name}
                          </CardTitle>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                      {technology.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {technology.description}
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <ProgressBar
                        value={progress.percentage}
                        label={`${progress.completed} of ${progress.total} topics`}
                        accentColor={technology.color}
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
