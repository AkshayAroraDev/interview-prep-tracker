import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  accentColor?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
  accentColor,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("space-y-2", className)}
      style={
        accentColor
          ? ({ "--progress-accent": accentColor } as React.CSSProperties)
          : undefined
      }
    >
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label ? (
            <span className="truncate text-[0.82rem] font-medium text-muted-foreground">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="text-[0.82rem] font-semibold tabular-nums">{clamped}%</span>
          ) : null}
        </div>
      )}
      <Progress
        value={clamped}
        className={cn(
          "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-muted/70 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]",
          accentColor
            ? "[&_[data-slot=progress-indicator]]:bg-[var(--progress-accent)]"
            : "[&_[data-slot=progress-indicator]]:bg-primary"
        )}
      />
    </div>
  );
}
