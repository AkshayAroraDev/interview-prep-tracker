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
    <Card className="border-border/60 bg-card/50 shadow-none transition-colors duration-150 hover:bg-card">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint ? (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-md bg-primary/8 p-2 text-primary",
            accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
