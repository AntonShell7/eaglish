export type ActivityKind = "reading" | "writing" | "vocabulary" | "quiz";

export interface DayActivity {
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  counts: Partial<Record<ActivityKind, number>>;
}

const STORAGE_KEY = "activityLog";
const GOAL_KEY = "dailyGoal";
const DEFAULT_GOAL = 3;

export function todayKey(d = new Date()): string {
  // Local date, not UTC — a streak should follow the user's own midnight.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readAll(): DayActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DayActivity[]) : [];
  } catch {
    return [];
  }
}

function writeAll(days: DayActivity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

export function logActivity(kind: ActivityKind, amount = 1) {
  const days = readAll();
  const key = todayKey();
  const existing = days.find((d) => d.date === key);

  if (existing) {
    existing.counts[kind] = (existing.counts[kind] ?? 0) + amount;
  } else {
    days.push({ date: key, counts: { [kind]: amount } });
  }

  writeAll(days);
}

export function getActivity(): DayActivity[] {
  return readAll();
}

export function totalForDay(day: DayActivity | undefined): number {
  if (!day) return 0;
  return Object.values(day.counts).reduce((sum, n) => sum + (n ?? 0), 0);
}

export function getDailyGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_GOAL;
}

export function setDailyGoal(target: number) {
  localStorage.setItem(GOAL_KEY, String(target));
}

export function getTodayCount(): number {
  return totalForDay(readAll().find((d) => d.date === todayKey()));
}

function shiftDays(date: Date, delta: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + delta);
  return copy;
}

/**
 * Counts consecutive days ending today. Yesterday still counts as "alive" —
 * the streak only breaks once a full day has been missed.
 */
export function getStreak(): number {
  const done = new Set(readAll().filter((d) => totalForDay(d) > 0).map((d) => d.date));
  if (done.size === 0) return 0;

  const today = new Date();
  let cursor = done.has(todayKey(today)) ? today : shiftDays(today, -1);
  if (!done.has(todayKey(cursor))) return 0;

  let streak = 0;
  while (done.has(todayKey(cursor))) {
    streak++;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
}

export function getBestStreak(): number {
  const dates = readAll()
    .filter((d) => totalForDay(d) > 0)
    .map((d) => d.date)
    .sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const expected = todayKey(shiftDays(prev, 1));
    run = dates[i] === expected ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** Most recent `days` calendar days, oldest first, for the activity strip. */
export function getRecentDays(days = 14): { date: string; count: number }[] {
  const all = readAll();
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = todayKey(shiftDays(new Date(), -i));
    out.push({ date: key, count: totalForDay(all.find((d) => d.date === key)) });
  }
  return out;
}
