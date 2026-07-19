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
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 md:px-8 md:py-12">
      <header className="space-y-3">
        <h1 className="text-fluid-page-title font-semibold">Overview</h1>
        <p className="max-w-2xl text-fluid-body text-muted-foreground">
          Your interview prep at a glance. Select a technology from the sidebar to dive in.
        </p>
      </header>

      <ProgressCards />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-fluid-section-heading font-semibold">All technologies</h2>
          <p className="text-fluid-body text-muted-foreground">
            Quick snapshot of progress across each stack.
          </p>
        </div>

        {!isHydrated ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
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
          <div className="grid gap-5 sm:grid-cols-2">
            {state.technologies.map((technology) => {
              const progress = getTechnologyProgress(technology);

              return (
                <Link
                  key={technology.id}
                  href={`/technology/${technology.id}`}
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <Card className="group h-full border-border/70 bg-card shadow-none transition-colors duration-150 hover:border-border hover:bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: technology.color }}
                          />
                          <CardTitle>{technology.name}</CardTitle>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
                      </div>
                      {technology.description ? (
                        <p className="line-clamp-2 text-fluid-body text-muted-foreground">
                          {technology.description}
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="pt-1">
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
