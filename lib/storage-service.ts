import { STORAGE_KEY } from "@/lib/constants";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import packageJson from "@/package.json";
import type { Section, Technology, Topic, TrackerState } from "@/types";

const MIGRATION_META_KEY = `${STORAGE_KEY}:migration-meta`;
const CURRENT_BACKUP_VERSION = 3;
const TOPIC_STATUS_VALUES = new Set([
  "not_started",
  "in_progress",
  "completed",
  "needs_review",
]);
const PRIORITY_VALUES = new Set(["low", "medium", "high"]);
const INTERVIEW_FREQUENCY_VALUES = new Set(["frequent", "occasional", "rare"]);
const CONFIDENCE_VALUES = new Set(["low", "medium", "high"]);

interface BackupModules {
  flashCards: {
    cards: unknown[];
  };
  notes: {
    entries: unknown[];
  };
  revisionPlanner: {
    plans: unknown[];
  };
}

interface MigrationMeta {
  removedTechnologies: string[];
  removedSections: string[];
  removedTopics: string[];
}

interface ExportData {
  tracker: TrackerState;
  migrationMeta: MigrationMeta;
  settings: {
    theme?: string;
    [key: string]: unknown;
  };
  modules: BackupModules;
}

export interface ProgressExportPayload {
  version: number;
  exportedAt: string;
  appVersion: string;
  data: ExportData;
}

export interface BackupPreview {
  exportedAt: string;
  appVersion: string;
  backupVersion: number;
  technologies: number;
  completedTopics: number;
  notesCount: number;
  settingsSummary: string;
}

interface ParsedBackupResult {
  payload: ProgressExportPayload;
  preview: BackupPreview;
}

function createEmptyModules(): BackupModules {
  return {
    flashCards: {
      cards: [],
    },
    notes: {
      entries: [],
    },
    revisionPlanner: {
      plans: [],
    },
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function getItem(key: string): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(key);
}

function setItem(key: string, value: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, value);
}

function removeItem(key: string): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
}

function getJson<T>(key: string): T | null {
  const raw = getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setJson<T>(key: string, value: T): void {
  setItem(key, JSON.stringify(value));
}

function validationError(path: string, message: string): never {
  throw new Error(`Invalid backup at ${path}: ${message}`);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    validationError(path, "expected an object");
  }

  return value;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    validationError(path, "expected an array");
  }

  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    validationError(path, "expected a string");
  }

  return value;
}

function asNonEmptyString(value: unknown, path: string): string {
  const parsed = asString(value, path);
  if (parsed.trim().length === 0) {
    validationError(path, "must not be empty");
  }

  return parsed;
}

function asOptionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return asString(value, path);
}

function asIsoDateString(value: unknown, path: string): string {
  const parsed = asString(value, path);
  if (Number.isNaN(Date.parse(parsed))) {
    validationError(path, "expected a valid date string");
  }

  return parsed;
}

function asEnumValue(value: unknown, path: string, allowed: Set<string>): string {
  const parsed = asString(value, path);
  if (!allowed.has(parsed)) {
    validationError(path, `unsupported value '${parsed}'`);
  }

  return parsed;
}

function asStringArray(value: unknown, path: string): string[] {
  const items = asArray(value, path);
  return items.map((item, index) => asString(item, `${path}[${index}]`));
}

function validateTopic(value: unknown, path: string): Topic {
  const record = asRecord(value, path);
  const resources =
    record.resources === undefined
      ? undefined
      : asStringArray(record.resources, `${path}.resources`);

  return {
    id: asNonEmptyString(record.id, `${path}.id`),
    title: asNonEmptyString(record.title, `${path}.title`),
    interviewFrequency: asEnumValue(
      record.interviewFrequency,
      `${path}.interviewFrequency`,
      INTERVIEW_FREQUENCY_VALUES,
    ) as Topic["interviewFrequency"],
    confidence: asEnumValue(record.confidence, `${path}.confidence`, CONFIDENCE_VALUES) as Topic["confidence"],
    notes: asString(record.notes, `${path}.notes`),
    resources,
    status: asEnumValue(record.status, `${path}.status`, TOPIC_STATUS_VALUES) as Topic["status"],
    priority: asEnumValue(record.priority, `${path}.priority`, PRIORITY_VALUES) as Topic["priority"],
    createdAt: asIsoDateString(record.createdAt, `${path}.createdAt`),
    updatedAt: asIsoDateString(record.updatedAt, `${path}.updatedAt`),
  };
}

function validateSection(value: unknown, path: string): Section {
  const record = asRecord(value, path);
  const topics = asArray(record.topics, `${path}.topics`).map((topic, index) =>
    validateTopic(topic, `${path}.topics[${index}]`),
  );

  return {
    id: asNonEmptyString(record.id, `${path}.id`),
    technologyId: asNonEmptyString(record.technologyId, `${path}.technologyId`),
    title: asNonEmptyString(record.title, `${path}.title`),
    description: asOptionalString(record.description, `${path}.description`),
    topics,
  };
}

function validateTechnology(value: unknown, path: string): Technology {
  const record = asRecord(value, path);
  const sections = asArray(record.sections, `${path}.sections`).map((section, index) =>
    validateSection(section, `${path}.sections[${index}]`),
  );

  return {
    id: asNonEmptyString(record.id, `${path}.id`),
    name: asNonEmptyString(record.name, `${path}.name`),
    description: asOptionalString(record.description, `${path}.description`),
    color: asNonEmptyString(record.color, `${path}.color`),
    icon: asOptionalString(record.icon, `${path}.icon`),
    sections,
  };
}

function validateTracker(value: unknown, path: string): TrackerState {
  const record = asRecord(value, path);
  const technologies = asArray(record.technologies, `${path}.technologies`).map(
    (technology, index) => validateTechnology(technology, `${path}.technologies[${index}]`),
  );

  return {
    technologies,
  };
}

function normalizeMigrationMeta(meta: Partial<MigrationMeta> | null | undefined): MigrationMeta {
  return {
    removedTechnologies: Array.isArray(meta?.removedTechnologies)
      ? meta.removedTechnologies
      : [],
    removedSections: Array.isArray(meta?.removedSections) ? meta.removedSections : [],
    removedTopics: Array.isArray(meta?.removedTopics) ? meta.removedTopics : [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeModules(modules: unknown): BackupModules {
  if (!isRecord(modules)) {
    return createEmptyModules();
  }

  return {
    flashCards: {
      cards:
        isRecord(modules.flashCards) && Array.isArray(modules.flashCards.cards)
          ? modules.flashCards.cards
          : [],
    },
    notes: {
      entries:
        isRecord(modules.notes) && Array.isArray(modules.notes.entries)
          ? modules.notes.entries
          : [],
    },
    revisionPlanner: {
      plans:
        isRecord(modules.revisionPlanner) && Array.isArray(modules.revisionPlanner.plans)
          ? modules.revisionPlanner.plans
          : [],
    },
  };
}

function normalizeSettings(settings: unknown): ExportData["settings"] {
  if (!isRecord(settings)) {
    return {};
  }

  return {
    ...settings,
    theme: typeof settings.theme === "string" ? settings.theme : undefined,
  };
}

function extractVersion(payload: Record<string, unknown>): number {
  const version = payload.version;
  if (typeof version !== "number" || Number.isNaN(version)) {
    throw new Error("Invalid backup version.");
  }

  if (!Number.isInteger(version) || version < 1) {
    throw new Error("Unsupported backup version.");
  }

  return version;
}

function migrateToVersion2(payload: Record<string, unknown>): Record<string, unknown> {
  const data = isRecord(payload.data) ? payload.data : {};

  return {
    ...payload,
    version: 2,
    data: {
      ...data,
      settings: normalizeSettings(data.settings),
    },
  };
}

function migrateToVersion3(payload: Record<string, unknown>): Record<string, unknown> {
  const data = isRecord(payload.data) ? payload.data : {};

  return {
    ...payload,
    version: 3,
    data: {
      ...data,
      settings: normalizeSettings(data.settings),
      modules: normalizeModules(data.modules),
    },
  };
}

function migrateBackupPayload(input: Record<string, unknown>): {
  sourceVersion: number;
  payload: Record<string, unknown>;
} {
  const sourceVersion = extractVersion(input);

  if (sourceVersion > CURRENT_BACKUP_VERSION) {
    throw new Error("Backup was created by a newer app version and cannot be restored here.");
  }

  let version = sourceVersion;
  let payload = { ...input };

  while (version < CURRENT_BACKUP_VERSION) {
    if (version === 1) {
      payload = migrateToVersion2(payload);
      version = 2;
      continue;
    }

    if (version === 2) {
      payload = migrateToVersion3(payload);
      version = 3;
      continue;
    }

    throw new Error(`No migration path found for backup version ${version}.`);
  }

  return {
    sourceVersion,
    payload,
  };
}

function getDateStamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getExportFileName(date = new Date()): string {
  return `interview-tracker-backup-${getDateStamp(date)}.json`;
}

function getPreRestoreBackupFileName(date = new Date()): string {
  return `interview-tracker-backup-${getDateStamp(date)}-before-restore.json`;
}

function parseTrackerFromData(data: Record<string, unknown>): TrackerState {
  if (isRecord(data.tracker)) {
    return validateTracker(data.tracker, "data.tracker");
  }

  if (Array.isArray(data.technologies)) {
    return validateTracker(data, "data");
  }

  validationError("data.tracker", "missing tracker object");
}

function countTopicStats(state: TrackerState): { completed: number; notes: number } {
  let completed = 0;
  let notes = 0;

  for (const technology of state.technologies) {
    for (const section of technology.sections) {
      for (const topic of section.topics) {
        if (topic.status === "completed") {
          completed += 1;
        }

        if ((topic.notes ?? "").trim().length > 0) {
          notes += 1;
        }
      }
    }
  }

  return { completed, notes };
}

function getSettingsSummary(data: ExportData): string {
  if (isRecord(data.settings)) {
    return `${Object.keys(data.settings).length} settings entries`;
  }

  const migrationMeta = normalizeMigrationMeta(data.migrationMeta);
  return `Migration meta (${migrationMeta.removedTechnologies.length} technologies, ${migrationMeta.removedSections.length} sections, ${migrationMeta.removedTopics.length} topics)`;
}

function validateBackupPayload(payload: unknown): ParsedBackupResult {
  if (!isRecord(payload)) {
    throw new Error("Backup must be a JSON object.");
  }

  const { sourceVersion, payload: migratedPayload } = migrateBackupPayload(payload);

  const version = extractVersion(migratedPayload);
  const exportedAt = migratedPayload.exportedAt;
  const appVersion = migratedPayload.appVersion;
  const data = migratedPayload.data;

  const validatedExportedAt = asIsoDateString(exportedAt, "exportedAt");
  const validatedAppVersion = asNonEmptyString(appVersion, "appVersion");

  const dataRecord = asRecord(data, "data");

  const tracker = parseTrackerFromData(dataRecord);

  const normalizedMigrationMeta = normalizeMigrationMeta(
    isRecord(dataRecord.migrationMeta)
      ? (dataRecord.migrationMeta as Partial<MigrationMeta>)
      : null,
  );
  const settings = normalizeSettings(dataRecord.settings);
  const modules = normalizeModules(dataRecord.modules);

  const normalizedPayload: ProgressExportPayload = {
    version,
    exportedAt: validatedExportedAt,
    appVersion: validatedAppVersion,
    data: {
      tracker,
      migrationMeta: normalizedMigrationMeta,
      settings,
      modules,
    },
  };

  const stats = countTopicStats(tracker);

  return {
    payload: normalizedPayload,
    preview: {
      exportedAt: validatedExportedAt,
      appVersion: validatedAppVersion,
      backupVersion: sourceVersion,
      technologies: tracker.technologies.length,
      completedTopics: stats.completed,
      notesCount: stats.notes,
      settingsSummary: getSettingsSummary(normalizedPayload.data),
    },
  };
}

function parseBackupJson(json: string): ParsedBackupResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error("Unable to parse backup file.");
  }

  return validateBackupPayload(parsed);
}

function createExportData(): ExportData {
  const tracker = getJson<TrackerState>(STORAGE_KEY);
  const migrationMeta = getJson<MigrationMeta>(MIGRATION_META_KEY);
  const currentTheme = getItem(THEME_STORAGE_KEY);

  return {
    tracker:
      tracker && Array.isArray(tracker.technologies)
        ? tracker
        : {
            technologies: [],
          },
    migrationMeta: normalizeMigrationMeta(migrationMeta),
    settings: {
      theme: currentTheme ?? undefined,
    },
    modules: createEmptyModules(),
  };
}

function createProgressExportPayload(): ProgressExportPayload {
  return {
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: packageJson.version,
    data: createExportData(),
  };
}

function downloadJson(json: string, fileName: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportProgress(fileName?: string): void {
  if (!canUseStorage()) {
    return;
  }

  const payload = createProgressExportPayload();
  const json = JSON.stringify(payload, null, 2);
  downloadJson(json, fileName ?? getExportFileName());
}

function restoreProgress(payload: ProgressExportPayload): void {
  if (!canUseStorage()) {
    return;
  }

  const validated = validateBackupPayload(payload).payload;

  const previousTracker = getItem(STORAGE_KEY);
  const previousMigrationMeta = getItem(MIGRATION_META_KEY);
  const previousTheme = getItem(THEME_STORAGE_KEY);

  const hasThemeInBackup = validated.data.settings?.theme !== undefined;

  exportProgress(getPreRestoreBackupFileName());

  try {
    setJson(STORAGE_KEY, validated.data.tracker);
    setJson(MIGRATION_META_KEY, normalizeMigrationMeta(validated.data.migrationMeta));

    if (hasThemeInBackup) {
      setItem(THEME_STORAGE_KEY, validated.data.settings.theme as string);
    }
  } catch (cause) {
    try {
      if (previousTracker === null) {
        removeItem(STORAGE_KEY);
      } else {
        setItem(STORAGE_KEY, previousTracker);
      }

      if (previousMigrationMeta === null) {
        removeItem(MIGRATION_META_KEY);
      } else {
        setItem(MIGRATION_META_KEY, previousMigrationMeta);
      }

      if (hasThemeInBackup) {
        if (previousTheme === null) {
          removeItem(THEME_STORAGE_KEY);
        } else {
          setItem(THEME_STORAGE_KEY, previousTheme);
        }
      }
    } catch {
      throw new Error("Restore failed and rollback could not complete.");
    }

    if (cause instanceof Error && cause.message) {
      throw new Error(`Restore failed and changes were rolled back: ${cause.message}`);
    }

    throw new Error("Restore failed and changes were rolled back.");
  }
}

function getThemeInitScript(): string {
  return `
(function() {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
}

export const storageService = {
  keys: {
    tracker: STORAGE_KEY,
    migrationMeta: MIGRATION_META_KEY,
    theme: THEME_STORAGE_KEY,
  },
  getItem,
  setItem,
  getJson,
  setJson,
  exportProgress,
  parseBackupJson,
  restoreProgress,
  getThemeInitScript,
} as const;
