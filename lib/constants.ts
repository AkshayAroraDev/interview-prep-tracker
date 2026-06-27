import type {
  ConfidenceLevel,
  InterviewFrequency,
  Priority,
  TopicStatus,
} from "@/types";

export const STORAGE_KEY = "interview-prep-tracker-v1";

export const TECH_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
] as const;

export const STATUS_CONFIG: Record<
  TopicStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  not_started: { label: "Not Started", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  needs_review: { label: "Needs Review", variant: "destructive" },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "text-muted-foreground" },
  medium: { label: "Medium", className: "text-amber-600 dark:text-amber-400" },
  high: { label: "High", className: "text-red-600 dark:text-red-400" },
};

export const STATUS_OPTIONS: TopicStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "needs_review",
];

export const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];

export const INTERVIEW_FREQUENCY_OPTIONS: InterviewFrequency[] = [
  "frequent",
  "occasional",
  "rare",
];

export const INTERVIEW_FREQUENCY_CONFIG: Record<InterviewFrequency, { label: string }> = {
  frequent: { label: "Frequent" },
  occasional: { label: "Occasional" },
  rare: { label: "Rare" },
};

export const CONFIDENCE_OPTIONS: ConfidenceLevel[] = ["low", "medium", "high"];

export const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { label: string }> = {
  low: { label: "Low" },
  medium: { label: "Medium" },
  high: { label: "High" },
};

export const DEFAULT_TOPIC_METADATA = {
  interviewFrequency: "occasional",
  confidence: "medium",
  notes: "",
} as const;
