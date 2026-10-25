import { trackLessons, type Step, type TrackLesson } from "@/data/track";

/**
 * How far along the track somebody is, and what is owed a second look.
 *
 * Two different things live here and they are deliberately not merged. The
 * path needs to know which lessons are finished, which is a list of ids. The
 * lesson player needs to know which expressions from *earlier* lessons should
 * reappear inside this one, which is a schedule.
 *
 * The schedule is intentionally cruder than the one in memory.ts that drives
 * vocabulary. That one counts days, because a word is reviewed across weeks.
 * This one counts lessons, because somebody doing three in an evening would
 * otherwise see nothing come back at all, and the whole effect — "wait, that
 * was four lessons ago" — depends on the gap being measured in the unit the
 * learner is actually moving through.
 */

const DONE_KEY = "trackDone";
const SEEN_KEY = "trackSeen";

/** After how many further lessons an item comes back. Then it is left alone. */
const GAPS = [2, 5, 11];

interface Seen {
  /** The lesson count at which this was last drilled. */
  at: number;
  /** How many times it has come back. Index into GAPS. */
  round: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* a lost position is not worth taking the session down for */
  }
}

export function doneLessons(): string[] {
  return read<string[]>(DONE_KEY, []);
}

export function isDone(id: string): boolean {
  return doneLessons().includes(id);
}

/**
 * Which lesson is open next.
 *
 * Strictly the first unfinished one. A path that lets you skip ahead is a
 * path whose order means nothing, and the order here is the content: lesson
 * three assumes lesson one happened.
 */
export function currentLessonId(): string | null {
  const done = new Set(doneLessons());
  const next = trackLessons().find((entry) => !done.has(entry.lesson.id));
  return next?.lesson.id ?? null;
}

export function isOpen(id: string): boolean {
  return isDone(id) || currentLessonId() === id;
}

/** Everything a lesson drills, in order, without repeats. */
function taught(lesson: TrackLesson): string[] {
  const out: string[] = [];
  for (const step of lesson.steps) {
    for (const item of ("teaches" in step && step.teaches) || []) {
      if (!out.includes(item)) out.push(item);
    }
  }
  return out;
}

/**
 * Finish a lesson: record it, and put what it taught into the queue.
 *
 * An item already in the queue is *not* reset. Meeting "np" again in lesson
 * four should not push its next return out to lesson six — it should move it
 * on to the next, longer gap, which is what a review is for.
 */
export function finishLesson(lesson: TrackLesson): void {
  const done = doneLessons();
  if (!done.includes(lesson.id)) done.push(lesson.id);
  write(DONE_KEY, done);

  const count = done.length;
  const seen = read<Record<string, Seen>>(SEEN_KEY, {});
  for (const item of taught(lesson)) {
    const previous = seen[item];
    seen[item] = {
      at: count,
      round: previous ? Math.min(previous.round + 1, GAPS.length - 1) : 0,
    };
  }
  write(SEEN_KEY, seen);
}

/**
 * Which earlier items are due now.
 *
 * Returned to the player, which uses them to pick a handful of extra steps
 * from lessons already finished — so the return arrives unannounced, inside
 * an ordinary lesson, rather than as a screen that says "revision".
 */
export function dueItems(): string[] {
  const count = doneLessons().length;
  const seen = read<Record<string, Seen>>(SEEN_KEY, {});
  return Object.entries(seen)
    .filter(([, state]) => count - state.at >= GAPS[state.round])
    .map(([item]) => item);
}

/**
 * Steps from finished lessons that drill the items now due.
 *
 * At most two, and never a rule or a chat: those are reading screens, and a
 * surprise return should be a question. Shuffled so the same pair does not
 * come back in the same order every time.
 */
export function resurfacedSteps(skipLessonId: string, limit = 2): Step[] {
  const due = new Set(dueItems());
  if (due.size === 0) return [];
  const done = new Set(doneLessons());

  const pool: Step[] = [];
  for (const { lesson } of trackLessons()) {
    if (lesson.id === skipLessonId || !done.has(lesson.id)) continue;
    for (const step of lesson.steps) {
      if (step.kind === "rule" || step.kind === "chat") continue;
      if ((step.teaches ?? []).some((item) => due.has(item))) pool.push(step);
    }
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, limit);
}

/** For the header: how much of the whole track is behind you. */
export function trackStanding(): { done: number; total: number } {
  return { done: doneLessons().length, total: trackLessons().length };
}
