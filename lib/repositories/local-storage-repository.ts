import { loadState, saveState } from "@/lib/storage";
import type { StorageRepository } from "@/lib/repositories/storage-repository";
import type { TrackerState } from "@/types";

export class LocalStorageRepository implements StorageRepository {
  async load(): Promise<TrackerState> {
    return loadState();
  }

  async save(state: TrackerState): Promise<void> {
    saveState(state);
  }
}

export const storageRepository: StorageRepository = new LocalStorageRepository();
