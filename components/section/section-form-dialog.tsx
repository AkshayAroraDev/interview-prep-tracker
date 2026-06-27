"use client";

import { useEffect, useState } from "react";

import { useTracker } from "@/components/providers/tracker-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateSectionInput, Section } from "@/types";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technologyId: string;
  section?: Section;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  technologyId,
  section,
}: SectionFormDialogProps) {
  const { addSection, updateSectionMeta } = useTracker();
  const isEditing = Boolean(section);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(section?.title ?? "");
      setDescription(section?.description ?? "");
    }
  }, [open, section]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    const payload: CreateSectionInput = { title, description };

    if (isEditing && section) {
      updateSectionMeta(technologyId, section.id, payload);
    } else {
      addSection(technologyId, payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            Organize topics into focused study areas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Hooks, Async Patterns"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Description</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context for this section"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save changes" : "Create section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
