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
        <div className="flex items-center justify-between text-sm">
          {label ? <span className="text-muted-foreground">{label}</span> : <span />}
          {showValue ? (
            <span className="font-medium tabular-nums">{clamped}%</span>
          ) : null}
        </div>
      )}
      <Progress
        value={clamped}
        className={
          accentColor
            ? "[&_[data-slot=progress-indicator]]:bg-[var(--progress-accent)]"
            : undefined
        }
      />
    </div>
  );
}
