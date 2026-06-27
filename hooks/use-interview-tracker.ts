"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_TOPIC_METADATA, STORAGE_KEY } from "@/lib/constants";
import { generateId } from "@/lib/id";
import { loadState, resetState, saveState } from "@/lib/storage";
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
  const [state, setState] = useState<TrackerState>({ technologies: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  const persist = useCallback((next: TrackerState | ((prev: TrackerState) => TrackerState)) => {
    setState((prev) => {
      const updated = next instanceof Function ? next(prev) : next;
      saveState(updated);
      return updated;
    });
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
    const fresh = resetState();
    setState(fresh);
  }, []);

  return {
    state,
    isHydrated,
    storageKey: STORAGE_KEY,
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
    resetToSeed,
  };
}

export type InterviewTracker = ReturnType<typeof useInterviewTracker>;
