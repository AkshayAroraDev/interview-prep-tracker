import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accentClassName?: string;
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClassName,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className="group border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card),white_3%)_0%,var(--card)_100%)] shadow-[0_10px_24px_-22px_black] transition-[transform,box-shadow,border-color] duration-220 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:shadow-[0_18px_36px_-24px_black]">
      <CardContent className="flex min-h-[106px] items-start justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-[clamp(1.95rem,2.6vw,2.35rem)] font-semibold leading-none tracking-tight tabular-nums transition-transform duration-200 ease-out group-hover:translate-x-[1px]", valueClassName)}>
            {value}
          </p>
          {hint ? (
            <p className="truncate text-fluid-helper text-muted-foreground/90">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background),white_5%)_0%,color-mix(in_oklch,var(--background),white_1%)_100%)] text-primary shadow-[0_10px_20px_-18px_black] transition-[transform,box-shadow] duration-220 ease-out group-hover:scale-[1.05] group-hover:shadow-[0_14px_24px_-18px_black]",
            accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}