"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { TechnologyIcon } from "@/components/technology/technology-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getTechnologyProgress } from "@/lib/progress";
import type { Technology } from "@/types";

interface TechnologyCardProps {
  technology: Technology;
}

export function TechnologyCard({ technology }: TechnologyCardProps) {
  const progress = getTechnologyProgress(technology);
  const topicCount = progress.total;
  const sectionCount = technology.sections.length;
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimatedProgress(progress.percentage);
    });

    return () => cancelAnimationFrame(frame);
  }, [progress.percentage]);

  return (
    <Link
      href={`/technology/${technology.id}`}
      className="group block h-full transition-transform duration-200 ease-in-out active:scale-[0.995] motion-reduce:transform-none"
    >
      <Card
        className="h-full min-h-[18rem] border-border/70 bg-card [--card-spacing:--spacing(6)] animate-in fade-in-0 slide-in-from-bottom-2 transition-all duration-200 ease-in-out group-hover:-translate-y-[3px] group-hover:border-[var(--technology-accent)] group-hover:bg-[color-mix(in_oklch,var(--card),white_4%)] group-hover:shadow-[0_14px_30px_rgba(0,0,0,0.26)] motion-reduce:animate-none motion-reduce:transform-none"
        style={{ "--technology-accent": technology.color } as React.CSSProperties}
      >
        <CardHeader className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <div
                className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background/70 shadow-sm transition-transform duration-200 ease-in-out group-hover:scale-[1.08]"
                style={{ borderColor: `${technology.color}66` }}
              >
                <TechnologyIcon technology={technology} />
              </div>
              <div className="min-w-0 space-y-2">
                <CardTitle className="text-[1.15rem] font-semibold leading-tight tracking-tight">
                  {technology.name}
                </CardTitle>
                {technology.description ? (
                  <p className="line-clamp-2 text-fluid-body leading-relaxed text-muted-foreground/90">
                    {technology.description}
                  </p>
                ) : null}
              </div>
            </div>
            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-all duration-200 ease-in-out group-hover:translate-x-[4px] group-hover:text-foreground" />
          </div>
        </CardHeader>

        <CardContent className="mt-auto space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{sectionCount} sections</Badge>
            <Badge variant="outline">{topicCount} topics</Badge>
          </div>

          <div
            className="space-y-2.5"
            style={{ "--progress-accent": technology.color } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3 text-fluid-body">
              <span className="truncate text-fluid-helper font-medium text-muted-foreground">
                {progress.completed} / {progress.total} topics
              </span>
              <span className="text-[0.9rem] font-semibold tabular-nums">{progress.percentage}%</span>
            </div>

            <Progress
              value={animatedProgress}
              className="[&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-muted/70 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-[var(--progress-accent)] [&_[data-slot=progress-indicator]]:shadow-[0_0_10px_var(--progress-accent),inset_0_0_0_1px_rgba(255,255,255,0.15)] [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-700 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
