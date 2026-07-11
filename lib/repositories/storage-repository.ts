import type { TrackerState } from "@/types";

export interface StorageRepository {
  load(): Promise<TrackerState>;
  save(state: TrackerState): Promise<void>;
}
