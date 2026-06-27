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
import { TECH_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CreateTechnologyInput, Technology } from "@/types";

interface TechnologyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technology?: Technology;
}

export function TechnologyFormDialog({
  open,
  onOpenChange,
  technology,
}: TechnologyFormDialogProps) {
  const { addTechnology, updateTechnologyMeta } = useTracker();
  const isEditing = Boolean(technology);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(TECH_COLORS[0]);

  useEffect(() => {
    if (open) {
      setName(technology?.name ?? "");
      setDescription(technology?.description ?? "");
      setColor(technology?.color ?? TECH_COLORS[0]);
    }
  }, [open, technology]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const payload: CreateTechnologyInput = {
      name,
      description,
      color,
    };

    if (isEditing && technology) {
      updateTechnologyMeta(technology.id, payload);
    } else {
      addTechnology(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit technology" : "Add technology"}
          </DialogTitle>
          <DialogDescription>
            Group related interview topics under a technology or domain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tech-name">Name</Label>
            <Input
              id="tech-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. React, Node.js, DSA"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech-description">Description</Label>
            <Textarea
              id="tech-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional summary for this track"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Accent color</Label>
            <div className="flex flex-wrap gap-2">
              {TECH_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Select color ${option}`}
                  onClick={() => setColor(option)}
                  className={cn(
                    "size-8 rounded-full border-2 transition-transform hover:scale-105",
                    color === option
                      ? "border-foreground ring-2 ring-ring ring-offset-2"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save changes" : "Create technology"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
