import { seedData } from "@/data/seed";
import { STORAGE_KEY } from "@/lib/constants";
import type { TrackerState } from "@/types";

export function loadState(): TrackerState {
  if (typeof window === "undefined") {
    return { technologies: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(seedData);
    }

    const parsed = JSON.parse(raw) as TrackerState;
    if (!parsed?.technologies || !Array.isArray(parsed.technologies)) {
      return structuredClone(seedData);
    }

    return parsed;
  } catch {
    return structuredClone(seedData);
  }
}

export function saveState(state: TrackerState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): TrackerState {
  const fresh = structuredClone(seedData);
  saveState(fresh);
  return fresh;
}
