"use client";

import { useCallback, useState, type ChangeEvent } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import { storageRepository } from "@/lib/repositories/local-storage-repository";
import {
  type BackupPreview,
  type ProgressExportPayload,
} from "@/lib/storage-service";

interface ImportBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportBackupDialog({ open, onOpenChange }: ImportBackupDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [payload, setPayload] = useState<ProgressExportPayload | null>(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setError(null);
        setPreview(null);
        setPayload(null);
        setConfirmRestoreOpen(false);
        setIsRestoring(false);
        setFileName("");
      }

      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const { payload: nextPayload, preview: nextPreview } =
        storageRepository.parseBackup(content);
      setPayload(nextPayload);
      setPreview(nextPreview);
      setError(null);
      setFileName(file.name);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to parse backup file.";
      setPayload(null);
      setPreview(null);
      setFileName(file.name);
      setError(message);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    if (!payload || isRestoring) {
      return;
    }

    try {
      setIsRestoring(true);
      await storageRepository.restore(payload);
      handleClose(false);
      window.location.reload();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Restore failed.";
      setError(message);
      setIsRestoring(false);
    }
  }, [handleClose, isRestoring, payload]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import backup preview</DialogTitle>
          <DialogDescription>
            Select a backup JSON file to validate and preview. This does not restore or modify any saved data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
          />

          {fileName ? (
            <p className="text-xs text-muted-foreground">Selected file: {fileName}</p>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {preview ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <h3 className="mb-2 text-sm font-semibold">Backup preview</h3>
              <dl className="grid grid-cols-[160px_1fr] gap-y-1 text-sm">
                <dt className="text-muted-foreground">Export Date</dt>
                <dd>{new Date(preview.exportedAt).toLocaleString()}</dd>

                <dt className="text-muted-foreground">Application Version</dt>
                <dd>{preview.appVersion}</dd>

                <dt className="text-muted-foreground">Backup Version</dt>
                <dd>{preview.backupVersion}</dd>

                <dt className="text-muted-foreground">Technologies</dt>
                <dd>{preview.technologies}</dd>

                <dt className="text-muted-foreground">Number of completed topics</dt>
                <dd>{preview.completedTopics}</dd>

                <dt className="text-muted-foreground">Number of notes</dt>
                <dd>{preview.notesCount}</dd>

                <dt className="text-muted-foreground">Settings</dt>
                <dd>{preview.settingsSummary}</dd>
              </dl>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="default"
            disabled={!preview || !!error || isRestoring}
            onClick={() => setConfirmRestoreOpen(true)}
          >
            Restore backup
          </Button>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Close
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRestoreOpen}
        onOpenChange={setConfirmRestoreOpen}
        title="Restore backup?"
        description="Your current progress will be automatically exported and downloaded before restore. After restoring, the app will reload."
        confirmLabel={isRestoring ? "Restoring..." : "Restore"}
        onConfirm={handleRestore}
      />
    </>
  );
}
