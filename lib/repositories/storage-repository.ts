import type { BackupPreview, ProgressExportPayload } from "@/lib/storage-service";
import type { TrackerState } from "@/types";

export interface BackupParseResult {
  payload: ProgressExportPayload;
  preview: BackupPreview;
}

export interface StorageRepository {
  load(): TrackerState;
  save(state: TrackerState): void;
  export(): Promise<void>;
  restore(payload: ProgressExportPayload): Promise<void>;
  parseBackup(json: string): BackupParseResult;
}
