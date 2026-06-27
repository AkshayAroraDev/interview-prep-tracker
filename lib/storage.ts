import { seedData } from "@/data/seed";
import { DEFAULT_TOPIC_METADATA, STORAGE_KEY } from "@/lib/constants";
import type { TrackerState } from "@/types";

function normalizeState(state: TrackerState): TrackerState {
  const technologies = Array.isArray(state.technologies) ? state.technologies : [];

  return {
    technologies: technologies.map((technology) => ({
      ...technology,
      sections: (Array.isArray(technology.sections) ? technology.sections : []).map(
        (section) => ({
        ...section,
        topics: (Array.isArray(section.topics) ? section.topics : []).map((topic) => ({
          ...topic,
          interviewFrequency:
            topic.interviewFrequency ?? DEFAULT_TOPIC_METADATA.interviewFrequency,
          confidence: topic.confidence ?? DEFAULT_TOPIC_METADATA.confidence,
          notes: topic.notes ?? DEFAULT_TOPIC_METADATA.notes,
        })),
      }),
      ),
    })),
  };
}

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

    return normalizeState(parsed);
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
