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

export function addVocabularyWord(word: string, translation: string, sourceText?: string): VocabularyWord {
  const words = readAll();
  const existing = words.find((w) => w.word.toLowerCase() === word.toLowerCase());
  if (existing) return existing;

  const entry: VocabularyWord = {
    id: crypto.randomUUID(),
    word,
    translation,
    sourceText,
    addedAt: Date.now(),
    interval: 0,
    easeFactor: 2.5,
    dueAt: Date.now(),
    reviewCount: 0,
  };
  writeAll([entry, ...words]);
  pushVocabularyWord(entry);
  return entry;
}

export function getDueWords(now = Date.now()): VocabularyWord[] {
  return readAll().filter((w) => w.dueAt <= now);
}

/** Simplified SM-2 style scheduler. quality: 0 again, 1 hard, 2 good, 3 easy. */
export function reviewWord(id: string, quality: 0 | 1 | 2 | 3) {
  const words = readAll();
  const idx = words.findIndex((w) => w.id === id);
  if (idx === -1) return;

  const current = words[idx];
  let { interval, easeFactor } = current;

  if (quality === 0) {
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    easeFactor = Math.max(1.3, easeFactor + (quality === 3 ? 0.15 : quality === 1 ? -0.15 : 0));
    interval = interval === 0 ? 1 : Math.round(interval * easeFactor);
  }

  const dueAt = Date.now() + interval * 24 * 60 * 60 * 1000;
  words[idx] = { ...current, interval, easeFactor, dueAt, reviewCount: current.reviewCount + 1 };
  writeAll(words);
  pushVocabularyWord(words[idx]);
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
