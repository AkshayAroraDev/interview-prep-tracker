import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClassName,
}: StatCardProps) {
  return (
    <Card className="border-border/70 bg-card shadow-none transition-colors duration-150 hover:bg-card">
      <CardContent className="flex min-h-[124px] items-start justify-between gap-5 p-6">
        <div className="min-w-0 space-y-2">
          <p className="text-fluid-helper font-medium text-muted-foreground">{label}</p>
          <p className="text-fluid-metric font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="truncate text-fluid-helper text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-lg bg-primary/8 p-2.5 text-primary ring-1 ring-primary/12",
            accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
