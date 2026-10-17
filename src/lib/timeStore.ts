import { todayKey } from "./activityStore";

/**
 * How long someone actually spends here, and on what.
 *
 * Every other number in this app is a count of things done. Time is the one
 * measure a learner already has intuitions about — "twenty minutes a day" is a
 * promise anyone can check against their own week — and it was the only thing
 * the progress page could not say.
 *
 * Counted only while the tab is visible, in five-second ticks. A page left
 * open in a background tab overnight would otherwise report eight hours of
 * study, which is worse than reporting nothing: a number you know is wrong
 * poisons the ones beside it.
 */

const STORAGE_KEY = "timeOnSite";
const TICK_MS = 5000;

/** Where the time went. Deliberately the sections a learner recognises. */
export type TimeSection =
  | "reading"
  | "listening"
  | "slang"
  | "vocabulary"
  | "writing"
  | "other";

export type TimeLog = Record<string, Partial<Record<TimeSection, number>>>;

const ROUTES: [string, TimeSection][] = [
  ["/reading", "reading"],
  ["/dictation", "listening"],
  ["/slang", "slang"],
  ["/vocabulary", "vocabulary"],
  ["/writing", "writing"],
];

export function sectionFor(pathname: string): TimeSection {
  const hit = ROUTES.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : "other";
}

export function getTimeLog(): TimeLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimeLog) : {};
  } catch {
    return {};
  }
}

/**
 * Fold a day's minutes from another device into this one's log.
 *
 * Time is recorded in seconds per section on whichever device the learner was
 * using, and a day can legitimately have time on two of them. The larger
 * figure wins per section rather than the sum: a day's two records usually
 * overlap — the same session seen by a device that synced late — and adding
 * them would inflate every figure the progress screen shows. Undercounting a
 * genuinely split day is the safer error, because the number is there to be
 * trusted rather than to be impressive.
 */
export function mergeRemoteMinutes(date: string, bySection: Record<string, number>) {
  if (!date || !bySection) return;
  const log = getTimeLog();
  const day = { ...(log[date] ?? {}) };
  let changed = false;

  for (const [section, minutes] of Object.entries(bySection)) {
    const seconds = Math.round((minutes ?? 0) * 60);
    const key = section as TimeSection;
    if (seconds > (day[key] ?? 0)) {
      day[key] = seconds;
      changed = true;
    }
  }

  if (!changed) return;
  log[date] = day;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* Storage full or unavailable; the local clock keeps running regardless. */
  }
}

export function addSeconds(section: TimeSection, seconds: number) {
  if (seconds <= 0) return;
  try {
    const log = getTimeLog();
    const day = todayKey();
    const entry = log[day] ?? {};
    entry[section] = (entry[section] ?? 0) + seconds;
    log[day] = entry;

    // A year of days is a few kilobytes; older than that helps nobody.
    const keys = Object.keys(log).sort();
    while (keys.length > 400) delete log[keys.shift() as string];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* a lost tick is not worth an exception */
  }
}

/** Total seconds over the last `days` days, per section. */
export function timeBySection(days = 30): Record<TimeSection, number> {
  const out: Record<TimeSection, number> = {
    reading: 0,
    listening: 0,
    slang: 0,
    vocabulary: 0,
    writing: 0,
    other: 0,
  };
  const cutoff = Date.now() - days * 86400000;
  for (const [day, entry] of Object.entries(getTimeLog())) {
    if (Date.parse(day) < cutoff) continue;
    for (const [section, seconds] of Object.entries(entry)) {
      out[section as TimeSection] += seconds ?? 0;
    }
  }
  return out;
}

export function totalMinutes(days = 30): number {
  const bySection = timeBySection(days);
  const seconds = Object.values(bySection).reduce((sum, n) => sum + n, 0);
  return Math.round(seconds / 60);
}

/** Minutes spent on each of the last `days` days, oldest first. */
export function minutesByDay(days = 140): { date: string; minutes: number }[] {
  const log = getTimeLog();
  const out: { date: string; minutes: number }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = log[key] ?? {};
    const seconds = Object.values(entry).reduce((sum: number, n) => sum + (n ?? 0), 0);
    out.push({ date: key, minutes: Math.round(seconds / 60) });
  }
  return out;
}

/**
 * Starts counting, and returns the stopper.
 *
 * `read` is called for the current section on every tick rather than captured
 * once, so moving between sections without remounting still attributes the
 * time to wherever the learner actually is.
 */
export function startClock(read: () => TimeSection): () => void {
  let timer: number | null = null;

  const tick = () => addSeconds(read(), TICK_MS / 1000);

  const run = () => {
    if (timer !== null) return;
    timer = window.setInterval(tick, TICK_MS);
  };

  const halt = () => {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
  };

  const onVisibility = () => (document.visibilityState === "visible" ? run() : halt());

  onVisibility();
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    halt();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
