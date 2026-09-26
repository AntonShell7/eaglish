import { pushVocabularyWord, deleteVocabularyWord } from "./sync";
import {
  dueDateFor,
  retrievability,
  schedule,
  type Grade,
  type MemoryState,
} from "./memory";

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
  /**
   * The memory model's view of this word: how many days until recall drops to
   * ninety percent, and how stubborn the word is on a scale of one to ten.
   *
   * Absent on everything saved before the scheduler was replaced, which is why
   * every reader goes through `memoryOf` rather than touching these directly.
   */
  stability?: number;
  difficulty?: number;
}

/**
 * The memory state of a word, reconstructing it for anything saved under the
 * old scheduler.
 *
 * The previous system kept an interval and an "ease" multiplier, which is not
 * a memory model and cannot be converted into one exactly. But an interval
 * *is* an estimate of stability — it is how long the old scheduler was willing
 * to wait — so it transfers honestly, and ease maps onto difficulty in the
 * obvious direction: a card the old algorithm found easy is one this one
 * should too.
 */
export function memoryOf(word: VocabularyWord): MemoryState | null {
  if (typeof word.stability === "number" && word.stability > 0) {
    return { stability: word.stability, difficulty: word.difficulty ?? 5 };
  }
  if (word.interval > 0) {
    const ease = word.easeFactor || 2.5;
    // Ease runs 1.3 (hard) to about 3 (easy); difficulty runs 10 to 1.
    const difficulty = Math.min(10, Math.max(1, 10 - ((ease - 1.3) / 1.7) * 9));
    return { stability: word.interval, difficulty };
  }
  return null;
}

/** How likely the learner is to recall this word right now, 0..1. */
export function recallChance(word: VocabularyWord, now = Date.now()): number {
  const memory = memoryOf(word);
  if (!memory) return 0;
  const days = (now - (word.lastReviewedAt ?? word.addedAt)) / DAY_MS;
  return retrievability(Math.max(0, days), memory.stability);
}

const STORAGE_KEY = "vocabularyWords";
const REVIEW_LOG_KEY = "reviewLog";

export interface ReviewEvent {
  /** Word id, so a deleted word's history can be dropped with it. */
  id: string;
  at: number;
  /** Recalled without help — the definition of a successful review. */
  recalled: boolean;
  /** Days the word had been waiting. A hit after 30 days is worth more than
      one after a day, and only the log knows the difference. */
  interval: number;
}

export function getReviewLog(): ReviewEvent[] {
  try {
    const raw = localStorage.getItem(REVIEW_LOG_KEY);
    return raw ? (JSON.parse(raw) as ReviewEvent[]) : [];
  } catch {
    return [];
  }
}

function appendReview(event: ReviewEvent) {
  // A year of daily reviews is a few thousand rows; capped so a long-running
  // account cannot quietly fill localStorage.
  const log = [...getReviewLog(), event].slice(-4000);
  localStorage.setItem(REVIEW_LOG_KEY, JSON.stringify(log));
}

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
const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewWord(id: string, quality: Grade) {
  const words = readAll();
  const idx = words.findIndex((w) => w.id === id);
  if (idx === -1) return;

  const current = words[idx];
  const now = Date.now();
  const previous = memoryOf(current);
  const elapsed = previous ? (now - (current.lastReviewedAt ?? current.addedAt)) / DAY_MS : 0;

  const next = schedule(previous, elapsed, quality);
  const lapses = (current.lapses ?? 0) + (quality === 0 && (previous?.stability ?? 0) >= 1 ? 1 : 0);

  words[idx] = {
    ...current,
    stability: next.stability,
    difficulty: next.difficulty,
    // Kept in step so anything still reading the old fields — and anything
    // already synced to the server — stays meaningful.
    interval: next.interval,
    easeFactor: current.easeFactor,
    dueAt: dueDateFor(next.interval, now),
    lapses,
    reviewCount: current.reviewCount + 1,
    lastReviewedAt: now,
  };
  writeAll(words);
  appendReview({ id, at: now, recalled: quality >= 2, interval: previous?.stability ?? 0 });
  pushVocabularyWord(words[idx]);
}

/**
 * How firmly a word is held, 0–100.
 *
 * Interval is the honest signal: the scheduler only grows it when the word was
 * recalled, so a long interval *is* evidence of memory. Lapses pull it back,
 * because a word forgotten twice is not the same as one never forgotten. The
 * scale is logarithmic — the jump from one day to a week means much more than
 * the jump from three months to four.
 */
/**
 * How firmly a word is held, as a percentage.
 *
 * Read off the memory model rather than invented: stability is days-until-you
 * forget, and the scale below maps it onto something a person can glance at.
 * Two months of durability counts as fully held, which is roughly where a word
 * stops needing the app and starts belonging to the learner. Lapses still
 * subtract, because a word that has been lost twice deserves suspicion even
 * when the arithmetic has recovered.
 */
export function wordStrength(word: VocabularyWord): number {
  const memory = memoryOf(word);
  if (!memory || word.reviewCount === 0) return 0;
  const base = Math.log2(1 + memory.stability) / Math.log2(1 + 60);
  const penalty = Math.min(0.4, (word.lapses ?? 0) * 0.1);
  return Math.round(Math.max(0, Math.min(1, base - penalty)) * 100);
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
