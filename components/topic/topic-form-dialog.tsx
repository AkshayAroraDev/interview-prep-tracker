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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import type { CreateTopicInput, Priority, Topic, TopicStatus } from "@/types";

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technologyId: string;
  sectionId: string;
  topic?: Topic;
}

export function TopicFormDialog({
  open,
  onOpenChange,
  technologyId,
  sectionId,
  topic,
}: TopicFormDialogProps) {
  const { addTopic, updateTopic } = useTracker();
  const isEditing = Boolean(topic);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [resources, setResources] = useState("");
  const [status, setStatus] = useState<TopicStatus>("not_started");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (open) {
      setTitle(topic?.title ?? "");
      setNotes(topic?.notes ?? "");
      setResources(topic?.resources?.join("\n") ?? "");
      setStatus(topic?.status ?? "not_started");
      setPriority(topic?.priority ?? "medium");
    }
  }, [open, topic]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    const payload: CreateTopicInput = {
      title,
      notes,
      resources: resources
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      status,
      priority,
    };

    if (isEditing && topic) {
      updateTopic(technologyId, sectionId, topic.id, payload);
    } else {
      addTopic(technologyId, sectionId, payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit topic" : "Add topic"}</DialogTitle>
          <DialogDescription>
            Capture what you need to study and track its status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-title">Title</Label>
            <Input
              id="topic-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. useMemo vs useCallback"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TopicStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-notes">Notes</Label>
            <Textarea
              id="topic-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Key points, flashcard notes, or reminders"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-resources">Resources</Label>
            <Textarea
              id="topic-resources"
              value={resources}
              onChange={(event) => setResources(event.target.value)}
              placeholder="One URL or resource per line"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save changes" : "Create topic"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
