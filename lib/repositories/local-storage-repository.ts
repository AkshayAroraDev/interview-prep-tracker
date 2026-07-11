import { loadState, saveState } from "@/lib/storage";
import { storageService, type ProgressExportPayload } from "@/lib/storage-service";

import type { BackupParseResult, StorageRepository } from "@/lib/repositories/storage-repository";
import type { TrackerState } from "@/types";

export class LocalStorageRepository implements StorageRepository {
  load(): TrackerState {
    return loadState();
  }

  save(state: TrackerState): void {
    saveState(state);
  }

  async export(): Promise<void> {
    await storageService.exportProgress();
  }

  async restore(payload: ProgressExportPayload): Promise<void> {
    await storageService.restoreProgress(payload);
  }

  parseBackup(json: string): BackupParseResult {
    return storageService.parseBackupJson(json);
  }
}

export const storageRepository: StorageRepository = new LocalStorageRepository();
