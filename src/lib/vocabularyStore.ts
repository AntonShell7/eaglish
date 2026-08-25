import { pushVocabularyWord, deleteVocabularyWord } from "./sync";

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  sourceText?: string;
  addedAt: number;
  interval: number;
  easeFactor: number;
  dueAt: number;
  reviewCount: number;
  /** Absent on words saved before review tracking existed. */
  lastReviewedAt?: number;
  /**
   * The sentence the word was met in. This is what makes a real recall test
   * possible later — the learner sees the gap in their own context, not a bare
   * translation prompt.
   */
  sentence?: string;
  /** Times the word was forgotten after being learned. High counts mean trouble. */
  lapses?: number;
}

const STORAGE_KEY = "vocabularyWords";

function readAll(): VocabularyWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VocabularyWord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(words: VocabularyWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function getVocabulary(): VocabularyWord[] {
  return readAll().sort((a, b) => b.addedAt - a.addedAt);
}

export function addVocabularyWord(
  word: string,
  translation: string,
  sourceText?: string,
  sentence?: string,
): VocabularyWord {
  const words = readAll();
  const existing = words.find((w) => w.word.toLowerCase() === word.toLowerCase());
  if (existing) {
    // A word met again in a better context should keep the better context.
    if (sentence && !existing.sentence) {
      existing.sentence = sentence;
      writeAll(words);
      pushVocabularyWord(existing);
    }
    return existing;
  }

  const entry: VocabularyWord = {
    id: crypto.randomUUID(),
    word,
    translation,
    sourceText,
    sentence,
    addedAt: Date.now(),
    interval: 0,
    easeFactor: 2.5,
    dueAt: Date.now(),
    reviewCount: 0,
    lapses: 0,
  };
  writeAll([entry, ...words]);
  pushVocabularyWord(entry);
  return entry;
}

/** Case-insensitive: "Podcast" and "podcast" are the same entry. */
export function isWordSaved(word: string): boolean {
  const key = word.trim().toLowerCase();
  return readAll().some((w) => w.word.toLowerCase() === key);
}

export function getDueWords(now = Date.now()): VocabularyWord[] {
  return readAll().filter((w) => w.dueAt <= now);
}

/**
 * Scheduler: SM-2 with the three fixes it needs to survive contact with a real
 * learner.
 *
 * - A forgotten word restarts at one day *and* is counted as a lapse. Words that
 *   keep lapsing are the ones worth rewriting or dropping, and a count is the
 *   only way to find them.
 * - Intervals longer than a few days are fuzzed by up to 10%, or every word
 *   saved in one sitting comes back on the same day forever, and the queue
 *   arrives in unusable lumps.
 * - Intervals are capped: past a year, a further doubling is a guess dressed up
 *   as precision.
 *
 * quality: 0 again, 1 hard, 2 good, 3 easy.
 */
const MAX_INTERVAL_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewWord(id: string, quality: 0 | 1 | 2 | 3) {
  const words = readAll();
  const idx = words.findIndex((w) => w.id === id);
  if (idx === -1) return;

  const current = words[idx];
  let { interval, easeFactor } = current;
  let lapses = current.lapses ?? 0;

  if (quality === 0) {
    if (interval >= 1) lapses += 1;
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    easeFactor = Math.max(1.3, easeFactor + (quality === 3 ? 0.15 : quality === 1 ? -0.15 : 0));
    interval = interval === 0 ? 1 : Math.min(MAX_INTERVAL_DAYS, Math.round(interval * easeFactor));
  }

  // Spread anything beyond a few days so the daily queue stays even.
  const fuzz = interval > 3 ? 1 + (Math.random() * 0.2 - 0.1) : 1;
  const dueAt = Date.now() + Math.round(interval * fuzz * DAY_MS);

  words[idx] = {
    ...current,
    interval,
    easeFactor,
    dueAt,
    lapses,
    reviewCount: current.reviewCount + 1,
    lastReviewedAt: Date.now(),
  };
  writeAll(words);
  pushVocabularyWord(words[idx]);
}

/** Words that keep being forgotten — the ones a learner should see differently. */
export function getLeeches(threshold = 5): VocabularyWord[] {
  return readAll().filter((w) => (w.lapses ?? 0) >= threshold);
}

/**
 * Cards reviewed since local midnight. The daily goal is built on this rather
 * than on a session counter, so closing the page mid-review loses nothing.
 */
export function getReviewedTodayCount(): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return readAll().filter((w) => (w.lastReviewedAt ?? 0) >= start.getTime()).length;
}

export function removeVocabularyWord(id: string) {
  writeAll(readAll().filter((w) => w.id !== id));
  deleteVocabularyWord(id);
}

/**
 * Folds rows pulled from the account into the local cache. A word can exist on
 * both sides after offline study, so the copy with more reviews wins — that's
 * the one carrying the newer scheduling state.
 */
export function mergeRemoteVocabulary(remote: VocabularyWord[]) {
  const byWord = new Map<string, VocabularyWord>();
  for (const w of [...readAll(), ...remote]) {
    const key = w.word.toLowerCase();
    const seen = byWord.get(key);
    if (!seen || w.reviewCount > seen.reviewCount) byWord.set(key, w);
  }
  writeAll([...byWord.values()]);
}
