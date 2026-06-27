"use client";

import { useState } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/topic/status-badge";
import { TopicFormDialog } from "@/components/topic/topic-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CONFIDENCE_CONFIG,
  INTERVIEW_FREQUENCY_CONFIG,
  PRIORITY_CONFIG,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { useTopicItemActions } from "@/hooks/use-topic-item-actions";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types";

interface TopicItemProps {
  technologyId: string;
  sectionId: string;
  topic: Topic;
}

export function TopicItem({ technologyId, sectionId, topic }: TopicItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { hasDetails, isCompleted, toggleCompleted, setStatus, setPriority, removeTopic } =
    useTopicItemActions({ technologyId, sectionId, topic });

  const priority = PRIORITY_CONFIG[topic.priority];
  const frequency = INTERVIEW_FREQUENCY_CONFIG[topic.interviewFrequency];
  const confidence = CONFIDENCE_CONFIG[topic.confidence];
  const notePreview = topic.notes ? topic.notes.slice(0, 90) : "";

  return (
    <div
      className={cn(
        "group rounded-lg border border-transparent px-2.5 py-2.5 transition-colors duration-150",
        "hover:border-border/60 hover:bg-muted/30",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={toggleCompleted}
          aria-label={`Mark ${topic.title} as completed`}
          className="mt-1"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => hasDetails && setExpanded((value) => !value)}
              disabled={!hasDetails}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium leading-snug",
                    isCompleted && "text-muted-foreground line-through",
                  )}
                >
                  {topic.title}
                </span>
                <StatusBadge status={topic.status} />
                <Badge variant="outline" className={cn("font-normal", priority.className)}>
                  {priority.label}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/90">
                <Badge variant="secondary" className="font-normal">
                  Frequency: {frequency.label}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  Confidence: {confidence.label}
                </Badge>
                <span className="max-w-md truncate">
                  Notes: {notePreview || "-"}
                </span>
              </div>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 data-open:opacity-100"
                    aria-label="Topic actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit topic
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatus(status)}
                  >
                    Mark as {status.replaceAll("_", " ")}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {PRIORITY_OPTIONS.map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setPriority(level)}
                  >
                    Priority: {level}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                  Delete topic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {expanded && hasDetails ? (
            <div className="mt-2 space-y-2 animate-in fade-in duration-150">
              {topic.notes ? (
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {topic.notes}
                </p>
              ) : null}
              {topic.resources && topic.resources.length > 0 ? (
                <ul className="space-y-1">
                  {topic.resources.map((resource) => (
                    <li key={resource}>
                      <a
                        href={resource.startsWith("http") ? resource : `https://${resource}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {resource}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <TopicFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        technologyId={technologyId}
        sectionId={sectionId}
        topic={topic}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete topic?"
        description="This topic will be removed from your tracker."
        onConfirm={removeTopic}
      />
    </div>
  );
}
