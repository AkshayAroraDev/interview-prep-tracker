import { getCurrentSession } from "@/lib/supabase/auth";
import { LocalStorageRepository } from "@/lib/repositories/local-storage-repository";
import {
  loadUserStateByUserId,
  saveUserStateByUserId,
} from "@/lib/repositories/supabase-state-repository";
import type { StorageRepository } from "@/lib/repositories/storage-repository";
import type { TrackerState } from "@/types";

const CLOUD_SYNC_DEBOUNCE_MS = 750;
const CLOUD_SYNC_RETRY_MS = 5000;

export type SyncStatus = "Synced" | "Syncing" | "Offline" | "Error";

type SyncStatusListener = (status: SyncStatus) => void;

interface UserSyncMeta {
  lastSavedStateKey: string | null;
  lastSyncedStateKey: string | null;
}

function getSyncMetaStorageKey(userId: string): string {
  return `interview-tracker:sync-meta:${userId}`;
}

function readUserSyncMeta(userId: string): UserSyncMeta {
  if (typeof window === "undefined") {
    return { lastSavedStateKey: null, lastSyncedStateKey: null };
  }

  try {
    const raw = window.localStorage.getItem(getSyncMetaStorageKey(userId));
    if (!raw) {
      return { lastSavedStateKey: null, lastSyncedStateKey: null };
    }

    const parsed = JSON.parse(raw) as Partial<UserSyncMeta>;

    return {
      lastSavedStateKey:
        typeof parsed.lastSavedStateKey === "string" ? parsed.lastSavedStateKey : null,
      lastSyncedStateKey:
        typeof parsed.lastSyncedStateKey === "string" ? parsed.lastSyncedStateKey : null,
    };
  } catch {
    return { lastSavedStateKey: null, lastSyncedStateKey: null };
  }
}

function writeUserSyncMeta(userId: string, meta: UserSyncMeta): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getSyncMetaStorageKey(userId), JSON.stringify(meta));
}

export class HybridStorageRepository implements StorageRepository {
  private readonly localRepository = new LocalStorageRepository();

  private pendingCloudState: TrackerState | null = null;
  private pendingStateKey: string | null = null;
  private pendingUserId: string | null = null;
  private lastSyncedStateKey: string | null = null;
  private pendingVersion = 0;
  private cloudSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private isCloudSyncInFlight = false;
  private syncStatus: SyncStatus = "Offline";
  private readonly statusListeners = new Set<SyncStatusListener>();

  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  subscribeSyncStatus(listener: SyncStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.syncStatus);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setSyncStatus(nextStatus: SyncStatus): void {
    if (this.syncStatus === nextStatus) {
      return;
    }

    this.syncStatus = nextStatus;
    for (const listener of this.statusListeners) {
      listener(nextStatus);
    }
  }

  private static toStateKey(state: TrackerState): string {
    return JSON.stringify(state);
  }

  private markSavedState(userId: string, stateKey: string): void {
    const meta = readUserSyncMeta(userId);
    writeUserSyncMeta(userId, {
      lastSavedStateKey: stateKey,
      lastSyncedStateKey: meta.lastSyncedStateKey,
    });
  }

  private markSyncedState(userId: string, stateKey: string): void {
    writeUserSyncMeta(userId, {
      lastSavedStateKey: stateKey,
      lastSyncedStateKey: stateKey,
    });
  }

  private isDirtyLocalState(userId: string, stateKey: string): boolean {
    const meta = readUserSyncMeta(userId);

    if (meta.lastSavedStateKey && meta.lastSyncedStateKey) {
      return meta.lastSavedStateKey !== meta.lastSyncedStateKey;
    }

    return stateKey !== HybridStorageRepository.toStateKey({ technologies: [] });
  }

  async load(): Promise<TrackerState> {
    let userId: string | null = null;

    try {
      const session = await getCurrentSession();
      userId = session?.user?.id ?? null;
    } catch {
      return this.localRepository.load();
    }

    if (!userId) {
      this.setSyncStatus("Offline");
      return this.localRepository.load();
    }

    const localState = await this.localRepository.load();
    const localStateKey = HybridStorageRepository.toStateKey(localState);
    const localIsDirty = this.isDirtyLocalState(userId, localStateKey);

    if (localIsDirty) {
      this.lastSyncedStateKey = null;
      this.clearPendingSync();
      this.pendingCloudState = structuredClone(localState);
      this.pendingStateKey = localStateKey;
      this.pendingUserId = userId;
      this.setSyncStatus("Syncing");
      this.scheduleDebouncedCloudSync();
      return localState;
    }

    try {
      this.setSyncStatus("Syncing");
      const cloudState = await loadUserStateByUserId(userId);
      await this.localRepository.save(cloudState);
      this.lastSyncedStateKey = HybridStorageRepository.toStateKey(cloudState);
      this.markSyncedState(userId, this.lastSyncedStateKey);
      this.pendingCloudState = null;
      this.pendingStateKey = null;
      this.pendingUserId = null;
      this.pendingVersion += 1;
      this.clearTimers();
      this.setSyncStatus("Synced");
      return cloudState;
    } catch {
      this.setSyncStatus(navigator.onLine ? "Error" : "Offline");
      return this.localRepository.load();
    }
  }

  async save(state: TrackerState): Promise<void> {
    await this.localRepository.save(state);

    let userId: string | null = null;

    try {
      const session = await getCurrentSession();
      userId = session?.user?.id ?? null;
    } catch {
      return;
    }

    if (!userId) {
      this.clearPendingSync();
      this.setSyncStatus("Offline");
      return;
    }

    const stateKey = HybridStorageRepository.toStateKey(state);
    this.markSavedState(userId, stateKey);

    if (stateKey === this.lastSyncedStateKey) {
      this.markSyncedState(userId, stateKey);
      this.clearPendingSync();
      this.setSyncStatus("Synced");
      return;
    }

    if (stateKey === this.pendingStateKey) {
      this.setSyncStatus("Syncing");
      return;
    }

    this.pendingCloudState = structuredClone(state);
    this.pendingStateKey = stateKey;
    this.pendingUserId = userId;
    this.pendingVersion += 1;
    this.setSyncStatus("Syncing");
    this.scheduleDebouncedCloudSync();
  }

  private clearTimers(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.cloudSyncTimer) {
      clearTimeout(this.cloudSyncTimer);
      this.cloudSyncTimer = null;
    }
  }

  private clearPendingSync(): void {
    this.pendingCloudState = null;
    this.pendingStateKey = null;
    this.pendingUserId = null;
    this.pendingVersion += 1;
    this.clearTimers();
  }

  private scheduleDebouncedCloudSync(): void {
    if (this.pendingStateKey === this.lastSyncedStateKey) {
      this.clearPendingSync();
      this.setSyncStatus("Synced");
      return;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.cloudSyncTimer) {
      clearTimeout(this.cloudSyncTimer);
    }

    this.cloudSyncTimer = setTimeout(() => {
      this.cloudSyncTimer = null;
      void this.flushCloudSync();
    }, CLOUD_SYNC_DEBOUNCE_MS);
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.flushCloudSync();
    }, CLOUD_SYNC_RETRY_MS);
  }

  private async flushCloudSync(): Promise<void> {
    if (this.isCloudSyncInFlight) {
      return;
    }

    if (!this.pendingCloudState) {
      return;
    }

    if (!this.pendingUserId) {
      return;
    }

    let currentUserId: string | null = null;

    try {
      const session = await getCurrentSession();
      currentUserId = session?.user?.id ?? null;
    } catch {
      return;
    }

    if (!currentUserId || currentUserId !== this.pendingUserId) {
      this.clearPendingSync();
      this.setSyncStatus("Offline");
      return;
    }

    const snapshot = structuredClone(this.pendingCloudState);
    const snapshotKey = this.pendingStateKey;
    const snapshotVersion = this.pendingVersion;
    this.isCloudSyncInFlight = true;
    this.setSyncStatus("Syncing");

    try {
      await saveUserStateByUserId(this.pendingUserId, snapshot);

      if (snapshotVersion === this.pendingVersion && snapshotKey) {
        this.lastSyncedStateKey = snapshotKey;
        this.markSyncedState(this.pendingUserId, snapshotKey);
        this.clearPendingSync();
        this.setSyncStatus("Synced");
      }
    } catch {
      this.setSyncStatus(navigator.onLine ? "Error" : "Offline");
      this.scheduleRetry();
    } finally {
      this.isCloudSyncInFlight = false;

      if (this.pendingCloudState && !this.retryTimer && !this.cloudSyncTimer) {
        this.scheduleDebouncedCloudSync();
      }
    }
  }
}

export const hybridStorageRepository = new HybridStorageRepository();
export const storageRepository: StorageRepository = hybridStorageRepository;
