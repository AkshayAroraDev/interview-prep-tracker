import { cn } from "@/lib/utils";

interface AiRobotIconProps {
  className?: string;
}

export function AiRobotIcon({ className }: AiRobotIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.1}
    >
      <g transform="translate(12 12) scale(1.32) translate(-12 -12)">
        <path d="M8.75 7.25h6.5a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3h-6.5a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3Z" />
        <path d="M12 4.5v2" />
        <path d="M12 4.5l2.1 2.1" />
        <circle cx="9.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
        <path d="M9.75 14.1h4.5" />
      </g>
    </svg>
  );
}