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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSectionProgress } from "@/lib/progress";
import type { Section, Technology } from "@/types";

interface SectionAccordionProps {
  technology: Technology;
  sections: Section[];
}

export function SectionAccordion({ technology, sections }: SectionAccordionProps) {
  const defaultOpen = sections.map((section) => section.id);

  return (
    <Accordion defaultValue={defaultOpen} className="rounded-lg border bg-card/40">
      {sections.map((section) => (
        <SectionAccordionItem
          key={section.id}
          technology={technology}
          section={section}
        />
      ))}
    </Accordion>
  );
}

function SectionAccordionItem({
  technology,
  section,
}: {
  technology: Technology;
  section: Section;
}) {
  const { deleteSection } = useTracker();
  const [editOpen, setEditOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const progress = getSectionProgress(section);

  return (
    <AccordionItem value={section.id} className="border-border/60 px-4">
      <div className="flex items-start gap-2 py-1">
        <AccordionTrigger className="flex-1 py-3 hover:no-underline">
          <div className="flex min-w-0 flex-1 flex-col gap-2 pr-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{section.title}</span>
              <Badge variant="secondary" className="font-normal">
                {progress.completed}/{progress.total}
              </Badge>
            </div>
            {section.description ? (
              <p className="text-xs font-normal text-muted-foreground">
                {section.description}
              </p>
            ) : null}
            <ProgressBar
              value={progress.percentage}
              showValue={false}
              accentColor={technology.color}
              className="max-w-xs"
            />
          </div>
        </AccordionTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="mt-2 shrink-0"
                aria-label="Section actions"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTopicOpen(true)}>
              <Plus className="size-4" />
              Add topic
            </DropdownMenuItem>
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

      <AccordionContent className="pb-4">
        {section.topics.length === 0 ? (
          <EmptyState
            title="No topics yet"
            description="Add your first topic to this section."
            className="border-none bg-transparent py-6"
            action={
              <Button size="sm" variant="outline" onClick={() => setTopicOpen(true)}>
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
      </AccordionContent>

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
    </AccordionItem>
  );
}
