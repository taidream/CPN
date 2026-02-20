import { demoEntries, defaultSettings } from "@/lib/demo";
import { Entry, Settings } from "@/lib/types";

const ENTRIES_KEY = "cpn_entries";
const SETTINGS_KEY = "cpn_settings";
const SEEDED_KEY = "cpn_seeded";

export function initStorage() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(demoEntries()));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    localStorage.setItem(SEEDED_KEY, "true");
  }
}

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ENTRIES_KEY);
  return raw ? (JSON.parse(raw) as Entry[]) : [];
}

export function saveEntries(entries: Entry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? ({ ...defaultSettings, ...JSON.parse(raw) } as Settings) : defaultSettings;
}

export function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function resetAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ENTRIES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(SEEDED_KEY);
  initStorage();
}
