"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionAccordion } from "@/components/section/section-accordion";
import { SectionFormDialog } from "@/components/section/section-form-dialog";
import { Button } from "@/components/ui/button";
import type { Technology } from "@/types";

interface SectionListProps {
  technology: Technology;
}

export function SectionList({ technology }: SectionListProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Sections</h2>
          <p className="text-xs text-muted-foreground">
            Expand a section to review and update topics.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add section
        </Button>
      </div>

      {technology.sections.length === 0 ? (
        <EmptyState
          title="No sections yet"
          description="Create sections to organize topics by theme or difficulty."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add section
            </Button>
          }
        />
      ) : (
        <SectionAccordion technology={technology} sections={technology.sections} />
      )}

      <SectionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        technologyId={technology.id}
      />
    </section>
  );
}
