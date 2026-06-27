import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title = "Interview Prep Tracker",
  description,
  backHref,
  backLabel = "Back to dashboard",
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← {backLabel}
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <GraduationCap className="size-4" />
              <span>Study smarter, interview better</span>
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
