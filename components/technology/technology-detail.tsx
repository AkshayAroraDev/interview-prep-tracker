"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

import { ProgressCards } from "@/components/dashboard/progress-cards";
import { useTracker } from "@/components/providers/tracker-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProgressBar } from "@/components/shared/progress-bar";
import { SectionList } from "@/components/section/section-list";
import { TechnologyFormDialog } from "@/components/technology/technology-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTechnologyProgress } from "@/lib/progress";

interface TechnologyDetailProps {
  technologyId: string;
}

export function TechnologyDetail({ technologyId }: TechnologyDetailProps) {
  const router = useRouter();
  const { getTechnology, isHydrated, deleteTechnology } = useTracker();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="h-52 animate-pulse rounded-xl border border-border/70 bg-muted/30" />
      </div>
    );
  }

  const technology = getTechnology(technologyId);
  if (!technology) {
    notFound();
  }

  const progress = getTechnologyProgress(technology);

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 md:px-8 md:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: technology.color }}
            />
            <h1 className="text-fluid-page-title font-semibold">
              {technology.name}
            </h1>
          </div>
          {technology.description ? (
            <p className="max-w-2xl text-fluid-body text-muted-foreground">
              {technology.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{technology.sections.length} sections</Badge>
            <Badge variant="outline">{progress.total} topics</Badge>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </header>

      <ProgressCards technology={technology} />

      <Card className="border-border/70 bg-card shadow-none">
        <CardContent className="p-6">
          <ProgressBar
            value={progress.percentage}
            label="Overall progress"
            accentColor={technology.color}
          />
        </CardContent>
      </Card>

      <SectionList technology={technology} />

      <TechnologyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        technology={technology}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete technology?"
        description="This removes the technology and all nested sections and topics."
        onConfirm={() => {
          deleteTechnology(technology.id);
          router.push("/");
        }}
      />
    </div>
  );
}
