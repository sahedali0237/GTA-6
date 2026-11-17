import { CONFIG } from "@/lib/config";

const STORAGE_KEY = "gta6_quota";

export type Quota = {
  date: string;
  count: number;
};

function todayKey(): string {
  // Local calendar date in YYYY-MM-DD form.
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readQuota(): Quota {
  if (typeof window === "undefined") {
    return { date: todayKey(), count: 0 };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as Partial<Quota>;
    const today = todayKey();
    if (parsed.date !== today || typeof parsed.count !== "number") {
      return { date: today, count: 0 };
    }
    return { date: today, count: parsed.count };
  } catch {
    return { date: todayKey(), count: 0 };
  }
}

export function writeQuota(quota: Quota): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
  } catch {
    // Ignore storage failures (private mode, quota exceeded, etc.).
  }
}

export function incrementQuota(): Quota {
  const current = readQuota();
  const next: Quota = { date: current.date, count: current.count + 1 };
  writeQuota(next);
  return next;
}

export function remainingQuota(): number {
  const { count } = readQuota();
  return Math.max(0, CONFIG.DAILY_LIMIT - count);
}

export function isQuotaExhausted(): boolean {
  return remainingQuota() <= 0;
}
