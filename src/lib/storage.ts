import { makeInitialState } from "@/lib/demo";
import { AppState } from "@/lib/types";

const STORAGE_KEY = "boymath_cpn_v2";

export function loadState(): AppState {
  if (typeof window === "undefined") return makeInitialState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = makeInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.settings || !parsed.partners || !parsed.entries) throw new Error("invalid");
    return parsed;
  } catch {
    const seeded = makeInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window === "undefined") return makeInitialState();
  const fresh = makeInitialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

export function exportStateJson(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `boymath-cpn-v2-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importStateJson(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as AppState;
        if (!data.settings || !data.partners || !data.entries) throw new Error("Invalid backup file");
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
