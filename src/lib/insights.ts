import { getVocabulary, getReviewLog, wordStrength, type VocabularyWord } from "./vocabularyStore";
import { buildKnownModel, priorRank } from "./knownWords";
import { getActivity, todayKey } from "./activityStore";

/**
 * Metrics of *result*, not of effort.
 *
 * XP, streaks and heatmaps measure how much someone showed up. They are useful
 * for habit and useless as an answer to the only question that matters: is this
 * working? These are the numbers that answer it — how many words you hold, how
 * much of a real text that lets you read, how much of it survives to the next
 * review, and where the current pace leads.
 *
 * Everything here is derived from data the app already stores, and everything
 * that is an estimate says so in the UI. A motivating number that isn't true
 * stops being motivating the moment someone checks it.
 */

const DAY = 24 * 60 * 60 * 1000;
/** Interval past which a word counts as held rather than learned. */
const MASTERED_DAYS = 21;

/* ── Vocabulary size ──────────────────────────────────────────────────── */

export interface VocabularySize {
  /** Best estimate of words known, including the level prior. */
  total: number;
  /** The part we have direct evidence for: marked known or mastered. */
  evidenced: number;
  /** Assumed from the placement level — the soft part of the estimate. */
  assumed: number;
  learning: number;
}

export function estimateVocabularySize(): VocabularySize {
  const model = buildKnownModel();
  const assumed = priorRank();
  const evidenced = model.explicit.size + model.mastered.size;

  return {
    total: assumed + evidenced,
    evidenced,
    assumed,
    learning: model.learning.size,
  };
}

/**
 * Cumulative saved-word count by week, for the growth curve.
 *
 * Saved words are used rather than the full estimate because the prior is a
 * flat assumption — plotting it would draw a line that says nothing about what
 * the learner did.
 */
export function vocabularyGrowth(weeks = 12): { label: string; value: number }[] {
  const words = getVocabulary();
  const now = Date.now();
  const out: { label: string; value: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const cutoff = now - i * 7 * DAY;
    const date = new Date(cutoff);
    out.push({
      label: `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
      value: words.filter((w) => w.addedAt <= cutoff).length,
    });
  }
  return out;
}

/* ── Retention ────────────────────────────────────────────────────────── */

export interface Retention {
  /** Share recalled without help, 0..1. */
  rate: number;
  reviews: number;
  /** Only counts reviews of words that had actually been scheduled. */
  matured: number;
}

/**
 * The honesty check on the whole method: of the words that came back for a
 * scheduled review, how many were actually recalled.
 *
 * Reviews of brand-new words are excluded — failing a word you met an hour ago
 * says nothing about memory, and including them would quietly deflate the
 * number that people use to judge whether any of this works.
 */
export function getRetention(days = 30): Retention {
  const since = Date.now() - days * DAY;
  const log = getReviewLog().filter((e) => e.at >= since);
  const scheduled = log.filter((e) => e.interval >= 1);

  return {
    rate: scheduled.length === 0 ? 0 : scheduled.filter((e) => e.recalled).length / scheduled.length,
    reviews: log.length,
    matured: scheduled.length,
  };
}

/* ── Comprehension ────────────────────────────────────────────────────── */

/**
 * The share of an ordinary text the learner is expected to follow.
 *
 * This is the single most motivating number available, because it is the one
 * people actually feel: 92% is "I read it", 80% is "I fought it". It is derived
 * from the same coverage model the reading list uses, so it moves whenever the
 * vocabulary does.
 */
export function estimateComprehension(sampleCoverages: number[]): number {
  if (sampleCoverages.length === 0) return 0;
  const sum = sampleCoverages.reduce((total, value) => total + value, 0);
  return sum / sampleCoverages.length;
}

/* ── Pace and forecast ────────────────────────────────────────────────── */

export interface Pace {
  /** New words saved per week, averaged over the recent past. */
  wordsPerWeek: number;
  /** Tasks finished per week. */
  tasksPerWeek: number;
  /** Rough minutes practised per week: five minutes per finished task. */
  minutesPerWeek: number;
}

export function getPace(weeks = 4): Pace {
  const since = Date.now() - weeks * 7 * DAY;
  const words = getVocabulary().filter((w) => w.addedAt >= since).length;

  const days = getActivity().filter((d) => Date.parse(d.date) >= since);
  const tasks = days.reduce(
    (sum, day) => sum + Object.values(day.counts).reduce((a, b) => a + (b ?? 0), 0),
    0,
  );

  return {
    wordsPerWeek: words / weeks,
    tasksPerWeek: tasks / weeks,
    minutesPerWeek: (tasks / weeks) * 5,
  };
}

export interface Forecast {
  target: number;
  weeks: number | null;
  date: Date | null;
}

/**
 * Where the current pace leads.
 *
 * Projected against words *collected here*, not against the whole-vocabulary
 * estimate: that estimate is mostly a level baseline, so forecasting it would
 * quote a date decades away and read as a joke. Returns null when the pace is
 * too slow to project honestly rather than inventing an encouraging date.
 */
export function forecastTo(target: number, from = getVocabulary().length): Forecast {
  const { wordsPerWeek } = getPace();
  const remaining = target - from;

  if (remaining <= 0) return { target, weeks: 0, date: new Date() };
  if (wordsPerWeek < 0.5) return { target, weeks: null, date: null };

  const weeks = Math.ceil(remaining / wordsPerWeek);
  return { target, weeks, date: new Date(Date.now() + weeks * 7 * DAY) };
}

/* ── Weekly recap ─────────────────────────────────────────────────────── */

export interface WeeklyRecap {
  tasks: number;
  newWords: number;
  reviews: number;
  recalled: number;
  minutes: number;
  activeDays: number;
  /** Change against the week before, as a share: 0.2 = a fifth more. */
  deltaTasks: number | null;
}

export function getWeeklyRecap(): WeeklyRecap {
  const now = Date.now();
  const weekAgo = now - 7 * DAY;
  const twoWeeksAgo = now - 14 * DAY;

  const days = getActivity();
  const sum = (from: number, to: number) =>
    days
      .filter((d) => {
        const t = Date.parse(d.date);
        return t >= from && t < to;
      })
      .reduce((total, day) => total + Object.values(day.counts).reduce((a, b) => a + (b ?? 0), 0), 0);

  const tasks = sum(weekAgo, now + DAY);
  const previous = sum(twoWeeksAgo, weekAgo);
  const log = getReviewLog().filter((e) => e.at >= weekAgo);

  return {
    tasks,
    newWords: getVocabulary().filter((w) => w.addedAt >= weekAgo).length,
    reviews: log.length,
    recalled: log.filter((e) => e.recalled).length,
    minutes: tasks * 5,
    activeDays: days.filter((d) => {
      const t = Date.parse(d.date);
      return t >= weekAgo && Object.values(d.counts).some((n) => (n ?? 0) > 0);
    }).length,
    deltaTasks: previous === 0 ? null : (tasks - previous) / previous,
  };
}

/* ── Word-level view ──────────────────────────────────────────────────── */

export interface WordInsight {
  word: VocabularyWord;
  strength: number;
  dueInDays: number;
}

export function getWordInsights(): WordInsight[] {
  const now = Date.now();
  return getVocabulary()
    .map((word) => ({
      word,
      strength: wordStrength(word),
      dueInDays: Math.round((word.dueAt - now) / DAY),
    }))
    .sort((a, b) => a.strength - b.strength);
}

/** Words held long enough to count as learned rather than in progress. */
export function masteredCount(): number {
  return getVocabulary().filter((w) => w.interval >= MASTERED_DAYS).length;
}

/** Did anything happen today? Used to phrase the recap in the present tense. */
export function activeToday(): boolean {
  const today = getActivity().find((d) => d.date === todayKey());
  return Boolean(today && Object.values(today.counts).some((n) => (n ?? 0) > 0));
}
