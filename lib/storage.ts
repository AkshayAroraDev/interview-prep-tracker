import { seedData } from "@/data/seed";
import { DEFAULT_TOPIC_METADATA, STORAGE_KEY } from "@/lib/constants";
import { generateId } from "@/lib/id";
import type { TrackerState } from "@/types";

const MIGRATION_META_KEY = `${STORAGE_KEY}:migration-meta`;

type Technology = TrackerState["technologies"][number];
type Section = Technology["sections"][number];
type Topic = Section["topics"][number];

interface MigrationMeta {
  removedTechnologies: string[];
  removedSections: string[];
  removedTopics: string[];
}

const EMPTY_MIGRATION_META: MigrationMeta = {
  removedTechnologies: [],
  removedSections: [],
  removedTopics: [],
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function technologyKey(name: string): string {
  return normalizeKey(name);
}

function sectionKey(technologyName: string, sectionTitle: string): string {
  return `${technologyKey(technologyName)}::${normalizeKey(sectionTitle)}`;
}

function topicKey(
  technologyName: string,
  sectionTitle: string,
  topicTitle: string,
): string {
  return `${sectionKey(technologyName, sectionTitle)}::${normalizeKey(topicTitle)}`;
}

function parseState(raw: string | null): TrackerState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as TrackerState;
    if (!parsed?.technologies || !Array.isArray(parsed.technologies)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function loadMigrationMeta(): MigrationMeta {
  if (typeof window === "undefined") {
    return EMPTY_MIGRATION_META;
  }

  try {
    const raw = window.localStorage.getItem(MIGRATION_META_KEY);
    if (!raw) {
      return EMPTY_MIGRATION_META;
    }

    const parsed = JSON.parse(raw) as Partial<MigrationMeta>;

    return {
      removedTechnologies: Array.isArray(parsed.removedTechnologies)
        ? parsed.removedTechnologies
        : [],
      removedSections: Array.isArray(parsed.removedSections) ? parsed.removedSections : [],
      removedTopics: Array.isArray(parsed.removedTopics) ? parsed.removedTopics : [],
    };
  } catch {
    return EMPTY_MIGRATION_META;
  }
}

function saveMigrationMeta(meta: MigrationMeta): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MIGRATION_META_KEY, JSON.stringify(meta));
}

function withUnique(values: string[]): string[] {
  return [...new Set(values)];
}

function buildRemovalMeta(previous: TrackerState, next: TrackerState): MigrationMeta {
  const previousTechnologies = normalizeState(previous).technologies;
  const nextTechnologies = normalizeState(next).technologies;

  const nextTechnologyById = new Map(nextTechnologies.map((tech) => [tech.id, tech]));

  const removedTechnologies: string[] = [];
  const removedSections: string[] = [];
  const removedTopics: string[] = [];

  for (const previousTechnology of previousTechnologies) {
    const nextTechnology = nextTechnologyById.get(previousTechnology.id);

    if (!nextTechnology) {
      removedTechnologies.push(technologyKey(previousTechnology.name));
      continue;
    }

    const nextSectionById = new Map(nextTechnology.sections.map((section) => [section.id, section]));

    for (const previousSection of previousTechnology.sections) {
      const nextSection = nextSectionById.get(previousSection.id);

      if (!nextSection) {
        removedSections.push(sectionKey(previousTechnology.name, previousSection.title));
        continue;
      }

      const nextTopicIds = new Set(nextSection.topics.map((topic) => topic.id));

      for (const previousTopic of previousSection.topics) {
        if (!nextTopicIds.has(previousTopic.id)) {
          removedTopics.push(
            topicKey(previousTechnology.name, previousSection.title, previousTopic.title),
          );
        }
      }
    }
  }

  return {
    removedTechnologies: withUnique(removedTechnologies),
    removedSections: withUnique(removedSections),
    removedTopics: withUnique(removedTopics),
  };
}

function updateMigrationMeta(previous: TrackerState | null, next: TrackerState): void {
  if (!previous) {
    return;
  }

  const existingMeta = loadMigrationMeta();
  const removedInSave = buildRemovalMeta(previous, next);

  const nextMeta: MigrationMeta = {
    removedTechnologies: withUnique([
      ...existingMeta.removedTechnologies,
      ...removedInSave.removedTechnologies,
    ]),
    removedSections: withUnique([
      ...existingMeta.removedSections,
      ...removedInSave.removedSections,
    ]),
    removedTopics: withUnique([
      ...existingMeta.removedTopics,
      ...removedInSave.removedTopics,
    ]),
  };

  saveMigrationMeta(nextMeta);
}

function createSeedTopic(seedTopic: Topic) {
  const now = new Date().toISOString();

  return {
    ...seedTopic,
    id: generateId(),
    createdAt: seedTopic.createdAt ?? now,
    updatedAt: seedTopic.updatedAt ?? now,
  };
}

function createSeedSection(section: Section, technologyId: string) {
  return {
    ...section,
    id: generateId(),
    technologyId,
    topics: section.topics.map((topic) => createSeedTopic(topic)),
  };
}

function mergeSeedIntoState(
  state: TrackerState,
  migrationMeta: MigrationMeta,
): { merged: TrackerState; changed: boolean } {
  let changed = false;

  const removedTechnologyKeys = new Set(migrationMeta.removedTechnologies);
  const removedSectionKeys = new Set(migrationMeta.removedSections);
  const removedTopicKeys = new Set(migrationMeta.removedTopics);

  const mergedTechnologies = state.technologies.map((technology) => ({
    ...technology,
    sections: technology.sections.map((section) => ({
      ...section,
      topics: [...section.topics],
    })),
  }));

  const technologyByName = new Map(
    mergedTechnologies.map((technology) => [normalizeKey(technology.name), technology]),
  );

  for (const seedTechnology of seedData.technologies) {
    const technologyKey = normalizeKey(seedTechnology.name);

    if (removedTechnologyKeys.has(technologyKey)) {
      continue;
    }

    const existingTechnology = technologyByName.get(technologyKey);

    if (!existingTechnology) {
      changed = true;
      const addedTechnology = {
        ...seedTechnology,
        id: generateId(),
        sections: seedTechnology.sections
          .filter(
            (section) => !removedSectionKeys.has(sectionKey(seedTechnology.name, section.title)),
          )
          .map((section) => createSeedSection(section, seedTechnology.id))
          .map((section) => ({
            ...section,
            topics: section.topics.filter(
              (topic) =>
                !removedTopicKeys.has(
                  topicKey(seedTechnology.name, section.title, topic.title),
                ),
            ),
          })),
      };

      const normalizedTechnology = {
        ...addedTechnology,
        sections: addedTechnology.sections.map((section) => ({
          ...section,
          technologyId: addedTechnology.id,
        })),
      };

      mergedTechnologies.push(normalizedTechnology);
      technologyByName.set(technologyKey, normalizedTechnology);
      continue;
    }

    const sectionByTitle = new Map(
      existingTechnology.sections.map((section) => [normalizeKey(section.title), section]),
    );

    for (const seedSection of seedTechnology.sections) {
      const sectionTitleKey = normalizeKey(seedSection.title);
      const fullSectionKey = sectionKey(seedTechnology.name, seedSection.title);

      if (removedSectionKeys.has(fullSectionKey)) {
        continue;
      }

      const existingSection = sectionByTitle.get(sectionTitleKey);

      if (!existingSection) {
        changed = true;
        const addedSection = {
          ...createSeedSection(seedSection, existingTechnology.id),
          topics: seedSection.topics
            .filter(
              (topic) =>
                !removedTopicKeys.has(
                  topicKey(seedTechnology.name, seedSection.title, topic.title),
                ),
            )
            .map((topic) => createSeedTopic(topic)),
        };
        existingTechnology.sections.push(addedSection);
        sectionByTitle.set(sectionTitleKey, addedSection);
        continue;
      }

      const topicKeys = new Set(
        existingSection.topics.map((topic) => normalizeKey(topic.title)),
      );

      for (const seedTopic of seedSection.topics) {
        const topicTitleKey = normalizeKey(seedTopic.title);
        const fullTopicKey = topicKey(
          seedTechnology.name,
          seedSection.title,
          seedTopic.title,
        );

        if (removedTopicKeys.has(fullTopicKey)) {
          continue;
        }

        if (topicKeys.has(topicTitleKey)) {
          continue;
        }

        changed = true;
        existingSection.topics.push(createSeedTopic(seedTopic));
        topicKeys.add(topicTitleKey);
      }
    }
  }

  return {
    merged: {
      technologies: mergedTechnologies,
    },
    changed,
  };
}

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
      const seeded = structuredClone(seedData);
      saveState(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as TrackerState;
    if (!parsed?.technologies || !Array.isArray(parsed.technologies)) {
      const seeded = structuredClone(seedData);
      saveState(seeded);
      return seeded;
    }

    const normalized = normalizeState(parsed);
    const migrationMeta = loadMigrationMeta();
    const { merged, changed } = mergeSeedIntoState(normalized, migrationMeta);

    if (changed) {
      saveState(merged);
    }

    return merged;
  } catch {
    const seeded = structuredClone(seedData);
    saveState(seeded);
    return seeded;
  }
}

export function saveState(state: TrackerState): void {
  if (typeof window === "undefined") {
    return;
  }

  const previousState = parseState(window.localStorage.getItem(STORAGE_KEY));
  updateMigrationMeta(previousState, state);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): TrackerState {
  const fresh = structuredClone(seedData);
  saveState(fresh);
  return fresh;
}
