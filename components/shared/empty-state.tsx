import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-muted/80 p-2.5 text-muted-foreground">
        <Inbox className="size-5" />
      </div>
      <h3 className="text-fluid-card-title font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-fluid-body text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
