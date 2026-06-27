"use client";

import { useState } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
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
import { PRIORITY_CONFIG, STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Priority, Topic } from "@/types";

interface TopicItemProps {
  technologyId: string;
  sectionId: string;
  topic: Topic;
}

export function TopicItem({ technologyId, sectionId, topic }: TopicItemProps) {
  const { updateTopicStatus, updateTopicPriority, deleteTopic } = useTracker();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const priority = PRIORITY_CONFIG[topic.priority];
  const hasDetails =
    Boolean(topic.notes) || Boolean(topic.resources && topic.resources.length > 0);
  const isCompleted = topic.status === "completed";

  return (
    <div
      className={cn(
        "group rounded-md border border-transparent px-2 py-2 transition-colors duration-150",
        "hover:border-border/60 hover:bg-muted/30",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) =>
            updateTopicStatus(
              technologyId,
              sectionId,
              topic.id,
              checked ? "completed" : "not_started",
            )
          }
          aria-label={`Mark ${topic.title} as completed`}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
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
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 data-open:opacity-100"
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
                    onClick={() =>
                      updateTopicStatus(technologyId, sectionId, topic.id, status)
                    }
                  >
                    Mark as {status.replaceAll("_", " ")}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {(["low", "medium", "high"] as Priority[]).map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() =>
                      updateTopicPriority(technologyId, sectionId, topic.id, level)
                    }
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
            <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
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
        onConfirm={() => deleteTopic(technologyId, sectionId, topic.id)}
      />
    </div>
  );
}
