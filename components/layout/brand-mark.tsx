import { NotebookPen } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
  iconSize?: number;
}

export function BrandMark({ className, size = 36, iconSize = 18 }: BrandMarkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-white/10 text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, rgba(124, 58, 237, 0.98) 0%, rgba(37, 99, 235, 0.98) 100%)",
        boxShadow:
          "0 0 0 1px rgba(124, 58, 237, 0.2), 0 10px 24px -18px rgba(37, 99, 235, 0.55), 0 0 24px -10px rgba(124, 58, 237, 0.35)",
      }}
    >
      <NotebookPen style={{ width: iconSize, height: iconSize }} strokeWidth={1.9} />
    </div>
  );
}