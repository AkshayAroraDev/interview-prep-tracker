"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionFormDialog } from "@/components/section/section-form-dialog";
import { TopicFormDialog } from "@/components/topic/topic-form-dialog";
import { TopicList } from "@/components/topic/topic-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSectionProgress } from "@/lib/progress";
import type { Section, Technology } from "@/types";

interface SectionCardProps {
  technology: Technology;
  section: Section;
}

export function SectionCard({ technology, section }: SectionCardProps) {
  const { deleteSection } = useTracker();
  const [editOpen, setEditOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const progress = getSectionProgress(section);

  return (
    <Card>
      <CardHeader className="gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle>{section.title}</CardTitle>
            {section.description ? (
              <p className="text-fluid-body text-muted-foreground">{section.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{progress.total} topics</Badge>
              <Badge variant="outline">{progress.completed} completed</Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Section actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit section
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Delete section
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ProgressBar
          value={progress.percentage}
          label="Section progress"
          accentColor={technology.color}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {section.topics.length === 0 ? (
          <EmptyState
            title="No topics in this section"
            description="Add the first topic you want to study or review."
            className="py-8"
            action={
              <Button size="sm" onClick={() => setTopicOpen(true)}>
                <Plus className="size-4" />
                Add topic
              </Button>
            }
          />
        ) : (
          <TopicList
            technologyId={technology.id}
            sectionId={section.id}
            topics={section.topics}
          />
        )}

        {section.topics.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setTopicOpen(true)}>
            <Plus className="size-4" />
            Add topic
          </Button>
        ) : null}
      </CardContent>

      <SectionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        technologyId={technology.id}
        section={section}
      />

      <TopicFormDialog
        open={topicOpen}
        onOpenChange={setTopicOpen}
        technologyId={technology.id}
        sectionId={section.id}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete section?"
        description="This removes the section and all of its topics permanently."
        onConfirm={() => deleteSection(technology.id, section.id)}
      />
    </Card>
  );
}
