"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { seedData } from "@/data/seed";
import { DEFAULT_TOPIC_METADATA } from "@/lib/constants";
import { generateId } from "@/lib/id";
import {
  loadUserStateByUserId,
  saveUserStateByUserId,
} from "@/lib/repositories/supabase-state-repository";
import { storageService } from "@/lib/storage-service";
import type {
  CreateSectionInput,
  CreateTechnologyInput,
  CreateTopicInput,
  Priority,
  Section,
  Technology,
  Topic,
  TopicStatus,
  TrackerState,
  UpdateTopicInput,
} from "@/types";

const CLOUD_SYNC_DEBOUNCE_MS = 750;

export type SyncStatus = "Synced" | "Syncing" | "Offline" | "Error";

function now() {
  return new Date().toISOString();
}

function updateTechnology(
  state: TrackerState,
  technologyId: string,
  updater: (tech: Technology) => Technology,
): TrackerState {
  return {
    technologies: state.technologies.map((tech) =>
      tech.id === technologyId ? updater(tech) : tech,
    ),
  };
}

function updateSection(
  state: TrackerState,
  technologyId: string,
  sectionId: string,
  updater: (section: Section) => Section,
): TrackerState {
  return updateTechnology(state, technologyId, (tech) => ({
    ...tech,
    sections: tech.sections.map((section) =>
      section.id === sectionId ? updater(section) : section,
    ),
  }));
}

export function useInterviewTracker() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<TrackerState>({ technologies: [] });
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("Offline");
  const pendingSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSaveRef = useRef(false);
  const saveVersionRef = useRef(0);

  const clearPendingSave = useCallback(() => {
    if (pendingSaveTimerRef.current) {
      clearTimeout(pendingSaveTimerRef.current);
      pendingSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    clearPendingSave();
    saveVersionRef.current += 1;

    if (isAuthLoading) {
      return () => {
        isMounted = false;
      };
    }

    if (!user) {
      skipNextSaveRef.current = true;
      setState(structuredClone(seedData));
      setSyncStatus("Offline");
      setIsHydrated(true);

      return () => {
        isMounted = false;
      };
    }

    setIsHydrated(false);
    setSyncStatus("Syncing");

    void loadUserStateByUserId(user.id)
      .then((loadedState) => {
        if (!isMounted) {
          return;
        }

        // Prevent immediately re-saving data loaded from Supabase.
        skipNextSaveRef.current = true;
        setState(loadedState);
        setSyncStatus("Synced");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setState(structuredClone(seedData));
        setSyncStatus(typeof navigator !== "undefined" && navigator.onLine ? "Error" : "Offline");
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clearPendingSave, isAuthLoading, user]);

  useEffect(() => {
    if (!isHydrated || isAuthLoading || !user) {
      if (!user && !isAuthLoading) {
        setSyncStatus("Offline");
      }

      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    clearPendingSave();

    const saveVersion = saveVersionRef.current + 1;
    saveVersionRef.current = saveVersion;
    const snapshot = structuredClone(state);
    const userId = user.id;

    setSyncStatus("Syncing");

    pendingSaveTimerRef.current = setTimeout(() => {
      pendingSaveTimerRef.current = null;

      void saveUserStateByUserId(userId, snapshot)
        .then(() => {
          if (saveVersionRef.current === saveVersion) {
            setSyncStatus("Synced");
          }
        })
        .catch(() => {
          if (saveVersionRef.current !== saveVersion) {
            return;
          }

          setSyncStatus(typeof navigator !== "undefined" && navigator.onLine ? "Error" : "Offline");
        });
    }, CLOUD_SYNC_DEBOUNCE_MS);

    return clearPendingSave;
  }, [clearPendingSave, isAuthLoading, isHydrated, state, user]);

  const persist = useCallback((next: TrackerState | ((prev: TrackerState) => TrackerState)) => {
    setState((prev) => (next instanceof Function ? next(prev) : next));
  }, []);

  const addTechnology = useCallback(
    (input: CreateTechnologyInput) => {
      const technology: Technology = {
        id: generateId(),
        name: input.name.trim(),
        description: input.description?.trim(),
        color: input.color,
        icon: input.icon,
        sections: [],
      };

      persist((prev) => ({
        technologies: [...prev.technologies, technology],
      }));

      return technology.id;
    },
    [persist],
  );

  const importState = useCallback(async (nextState: TrackerState) => {
    persist(nextState);
  }, [persist]);

  const updateTechnologyMeta = useCallback(
    (technologyId: string, input: Partial<CreateTechnologyInput>) => {
      persist((prev) =>
        updateTechnology(prev, technologyId, (tech) => ({
          ...tech,
          ...input,
          name: input.name?.trim() ?? tech.name,
          description: input.description?.trim() ?? tech.description,
        })),
      );
    },
    [persist],
  );

  const deleteTechnology = useCallback(
    (technologyId: string) => {
      persist((prev) => ({
        technologies: prev.technologies.filter((tech) => tech.id !== technologyId),
      }));
    },
    [persist],
  );

  const addSection = useCallback(
    (technologyId: string, input: CreateSectionInput) => {
      const section: Section = {
        id: generateId(),
        technologyId,
        title: input.title.trim(),
        description: input.description?.trim(),
        topics: [],
      };

      persist((prev) =>
        updateTechnology(prev, technologyId, (tech) => ({
          ...tech,
          sections: [...tech.sections, section],
        })),
      );

      return section.id;
    },
    [persist],
  );

  const updateSectionMeta = useCallback(
    (technologyId: string, sectionId: string, input: CreateSectionInput) => {
      persist((prev) =>
        updateSection(prev, technologyId, sectionId, (section) => ({
          ...section,
          title: input.title.trim(),
          description: input.description?.trim(),
        })),
      );
    },
    [persist],
  );

  const deleteSection = useCallback(
    (technologyId: string, sectionId: string) => {
      persist((prev) =>
        updateTechnology(prev, technologyId, (tech) => ({
          ...tech,
          sections: tech.sections.filter((section) => section.id !== sectionId),
        })),
      );
    },
    [persist],
  );

  const addTopic = useCallback(
    (technologyId: string, sectionId: string, input: CreateTopicInput) => {
      const timestamp = now();
      const topic: Topic = {
        id: generateId(),
        title: input.title.trim(),
        interviewFrequency:
          input.interviewFrequency ?? DEFAULT_TOPIC_METADATA.interviewFrequency,
        confidence: input.confidence ?? DEFAULT_TOPIC_METADATA.confidence,
        notes: input.notes?.trim() ?? DEFAULT_TOPIC_METADATA.notes,
        resources: input.resources?.filter(Boolean),
        status: input.status ?? "not_started",
        priority: input.priority ?? "medium",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      persist((prev) =>
        updateSection(prev, technologyId, sectionId, (section) => ({
          ...section,
          topics: [...section.topics, topic],
        })),
      );

      return topic.id;
    },
    [persist],
  );

  const updateTopic = useCallback(
    (
      technologyId: string,
      sectionId: string,
      topicId: string,
      input: UpdateTopicInput,
    ) => {
      persist((prev) =>
        updateSection(prev, technologyId, sectionId, (section) => ({
          ...section,
          topics: section.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  ...input,
                  title: input.title?.trim() ?? topic.title,
                  notes: input.notes?.trim() ?? topic.notes,
                  resources: input.resources?.filter(Boolean) ?? topic.resources,
                  updatedAt: now(),
                }
              : topic,
          ),
        })),
      );
    },
    [persist],
  );

  const updateTopicStatus = useCallback(
    (
      technologyId: string,
      sectionId: string,
      topicId: string,
      status: TopicStatus,
    ) => {
      updateTopic(technologyId, sectionId, topicId, { status });
    },
    [updateTopic],
  );

  const updateTopicPriority = useCallback(
    (
      technologyId: string,
      sectionId: string,
      topicId: string,
      priority: Priority,
    ) => {
      updateTopic(technologyId, sectionId, topicId, { priority });
    },
    [updateTopic],
  );

  const deleteTopic = useCallback(
    (technologyId: string, sectionId: string, topicId: string) => {
      persist((prev) =>
        updateSection(prev, technologyId, sectionId, (section) => ({
          ...section,
          topics: section.topics.filter((topic) => topic.id !== topicId),
        })),
      );
    },
    [persist],
  );

  const getTechnology = useCallback(
    (technologyId: string) =>
      state.technologies.find((tech) => tech.id === technologyId),
    [state.technologies],
  );

  const resetToSeed = useCallback(() => {
    const fresh = structuredClone(seedData);

    persist(fresh);
  }, [persist]);

  const exportProgress = useCallback((fileName?: string) => {
    void storageService.exportProgress(state, fileName).catch((error: unknown) => {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      throw error;
    });
  }, [state]);

  return {
    state,
    isHydrated,
    syncStatus,
    addTechnology,
    updateTechnologyMeta,
    deleteTechnology,
    addSection,
    updateSectionMeta,
    deleteSection,
    addTopic,
    updateTopic,
    updateTopicStatus,
    updateTopicPriority,
    deleteTopic,
    getTechnology,
    importState,
    resetToSeed,
    exportProgress,
  };
}

export type InterviewTracker = ReturnType<typeof useInterviewTracker>;
