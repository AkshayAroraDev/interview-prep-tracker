import { STORAGE_KEY } from "@/lib/constants";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import packageJson from "@/package.json";
import type { TrackerState } from "@/types";

const MIGRATION_META_KEY = `${STORAGE_KEY}:migration-meta`;
const EXPORT_VERSION = 1;

interface MigrationMeta {
  removedTechnologies: string[];
  removedSections: string[];
  removedTopics: string[];
}

interface ExportData {
  tracker: TrackerState;
  migrationMeta: MigrationMeta;
  settings?: {
    theme?: string;
  };
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

function parseTrackerFromData(data: Record<string, unknown>): TrackerState | null {
  const candidate = isRecord(data.tracker) ? data.tracker : data;
  const technologies = candidate.technologies;

  if (!Array.isArray(technologies)) {
    return null;
  }

  return {
    technologies: technologies as TrackerState["technologies"],
  };
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

  const version = payload.version;
  const exportedAt = payload.exportedAt;
  const appVersion = payload.appVersion;
  const data = payload.data;

  if (typeof version !== "number" || Number.isNaN(version)) {
    throw new Error("Invalid backup version.");
  }

  if (typeof exportedAt !== "string" || Number.isNaN(Date.parse(exportedAt))) {
    throw new Error("Invalid export date.");
  }

  if (typeof appVersion !== "string" || appVersion.trim().length === 0) {
    throw new Error("Invalid application version.");
  }

  if (!isRecord(data)) {
    throw new Error("Backup data is missing.");
  }

  const tracker = parseTrackerFromData(data);
  if (!tracker) {
    throw new Error("Backup data does not contain a valid tracker state.");
  }

  const normalizedMigrationMeta = normalizeMigrationMeta(
    isRecord(data.migrationMeta) ? (data.migrationMeta as Partial<MigrationMeta>) : null,
  );

  const settings = isRecord(data.settings)
    ? {
        theme: typeof data.settings.theme === "string" ? data.settings.theme : undefined,
      }
    : undefined;

  const normalizedPayload: ProgressExportPayload = {
    version,
    exportedAt,
    appVersion,
    data: {
      tracker,
      migrationMeta: normalizedMigrationMeta,
      settings,
    },
  };

  const stats = countTopicStats(tracker);

  return {
    payload: normalizedPayload,
    preview: {
      exportedAt,
      appVersion,
      backupVersion: version,
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
  };
}

function createProgressExportPayload(): ProgressExportPayload {
  return {
    version: EXPORT_VERSION,
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

  exportProgress(getPreRestoreBackupFileName());

  setJson(STORAGE_KEY, payload.data.tracker);
  setJson(MIGRATION_META_KEY, normalizeMigrationMeta(payload.data.migrationMeta));

  if (payload.data.settings?.theme) {
    setItem(THEME_STORAGE_KEY, payload.data.settings.theme);
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
