"use client";

import { useState } from "react";
import { Download, Plus, RotateCcw, Upload } from "lucide-react";

import { useTracker } from "@/components/providers/tracker-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ImportBackupDialog } from "@/components/shared/import-backup-dialog";
import { TechnologyCard } from "@/components/technology/technology-card";
import { TechnologyFormDialog } from "@/components/technology/technology-form-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function TechnologyGrid() {
  const { state, isHydrated, resetToSeed, exportProgress } = useTracker();
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-fluid-section-heading font-semibold">Technologies</h2>
          <p className="text-fluid-body text-muted-foreground">
            Track progress across stacks and domains.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" />
            Import backup
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportProgress()}>
            <Download className="size-4" />
            Export progress
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-4" />
            Reset demo data
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add technology
          </Button>
        </div>
      </div>

      {state.technologies.length === 0 ? (
        <EmptyState
          title="No technologies yet"
          description="Create your first technology stack to begin organizing interview topics."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add technology
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.technologies.map((technology) => (
            <TechnologyCard key={technology.id} technology={technology} />
          ))}
        </div>
      )}

      <TechnologyFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ImportBackupDialog open={importOpen} onOpenChange={setImportOpen} />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset to demo data?"
        description="This replaces all technologies, sections, and topics with the default seed data."
        confirmLabel="Reset"
        onConfirm={resetToSeed}
      />
    </section>
  );
}
