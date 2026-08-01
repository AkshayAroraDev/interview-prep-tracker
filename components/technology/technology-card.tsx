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
        className="h-full min-h-[18rem] overflow-hidden border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card),white_3%)_0%,var(--card)_100%)] [--card-spacing:--spacing(6)] animate-in fade-in-0 slide-in-from-bottom-2 transition-[transform,box-shadow,border-color] duration-220 ease-out group-hover:-translate-y-1 group-hover:border-[var(--technology-accent)] group-hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.42)] motion-reduce:animate-none motion-reduce:transform-none"
        style={{ "--technology-accent": technology.color } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-16 size-52 rounded-full bg-[var(--technology-accent)]/8 blur-2xl transition-opacity duration-220 group-hover:opacity-100 opacity-70" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <CardHeader className="relative space-y-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_6%)_0%,color-mix(in_oklch,var(--background),white_2%)_100%)] shadow-[0_10px_24px_-18px_black] transition-[transform,box-shadow] duration-220 ease-out group-hover:scale-[1.06] group-hover:shadow-[0_14px_26px_-16px_color-mix(in_oklch,var(--technology-accent),transparent_25%)]"
                style={{ borderColor: `${technology.color}66` }}
              >
                <TechnologyIcon technology={technology} className="text-[color:var(--technology-accent)] transition-transform duration-200 ease-out group-hover:scale-[1.04]" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="text-[1.15rem] font-semibold leading-tight tracking-tight">
                  {technology.name}
                </CardTitle>
                {technology.description ? (
                  <p className="line-clamp-2 text-fluid-body leading-relaxed text-muted-foreground/85">
                    {technology.description}
                  </p>
                ) : null}
              </div>
            </div>
            <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-220 ease-out group-hover:translate-x-1 group-hover:text-foreground" />
          </div>
        </CardHeader>

        <CardContent className="relative mt-auto space-y-5 pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full border-border/60 bg-muted/55 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
              {sectionCount} sections
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/60 bg-background/55 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] uppercase">
              {topicCount} topics
            </Badge>
          </div>

          <div
            className="space-y-2.5 rounded-2xl border border-border/60 bg-background/35 px-3.5 py-3"
            style={{ "--progress-accent": technology.color } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3 text-fluid-body">
              <span className="truncate text-fluid-helper font-medium text-muted-foreground">
                {progress.completed} / {progress.total} topics
              </span>
              <span className="text-[0.9rem] font-semibold tabular-nums text-foreground">
                {progress.percentage}%
              </span>
            </div>

            <Progress
              value={animatedProgress}
              className="[&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-muted/65 [&_[data-slot=progress-track]]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,color-mix(in_oklch,var(--progress-accent),white_8%)_0%,var(--progress-accent)_100%)] [&_[data-slot=progress-indicator]]:shadow-[0_0_10px_var(--progress-accent),inset_0_0_0_1px_rgba(255,255,255,0.16)] [&_[data-slot=progress-indicator]]:transition-[width,transform] [&_[data-slot=progress-indicator]]:duration-240 motion-reduce:[&_[data-slot=progress-indicator]]:transition-none"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
