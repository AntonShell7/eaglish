/**
 * Remember what a word turned out to mean.
 *
 * Every lookup used to be a fresh model call, including the second time the
 * same learner tapped the same word — and they do, constantly: a word met in
 * one text turns up in the next, and the whole design of this app is that
 * unfamiliar words recur. At sixty calls an hour that is a quota spent on
 * answers the app has already been given, and each repeat costs a second of
 * waiting for a result that has not changed.
 *
 * Context matters for a translation, so a lookup made inside a sentence is
 * cached against that sentence rather than against the word alone — "charge"
 * in a courtroom and "charge" in a battery are different answers, and serving
 * one for the other would be worse than a slow lookup.
 */

const KEY = "lookupCache";

/** Enough for months of ordinary reading, small enough to stay fast. */
const LIMIT = 1200;

export interface CachedLookup {
  translation: string;
  partOfSpeech?: string;
  /** When it was stored, so the oldest entries go first when the cache fills. */
  at: number;
}

type Store = Record<string, CachedLookup>;

/* A short, stable digest of the sentence. The sentence itself would make the
   cache several times larger than the answers it holds. FNV-1a: not a
   security hash, just a cheap spread. */
function digest(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function cacheKey(word: string, sentence?: string): string {
  const base = word.trim().toLowerCase();
  return sentence ? `${base}|${digest(sentence.trim())}` : base;
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* Storage full or disabled. A cache that cannot be written is simply a
       cache that misses — never a reason to fail the lookup it was helping. */
  }
}

export function getCachedLookup(word: string, sentence?: string): CachedLookup | null {
  const store = read();
  /* A lookup made in context falls back to the context-free answer. The
     reverse is not allowed: a general translation is a reasonable answer to a
     specific question, but an answer shaped by one sentence is not a
     reasonable answer to a different one. */
  return store[cacheKey(word, sentence)] ?? (sentence ? (store[cacheKey(word)] ?? null) : null);
}

export function putCachedLookup(
  word: string,
  sentence: string | undefined,
  value: Omit<CachedLookup, "at">,
) {
  if (!value.translation) return;
  const store = read();
  store[cacheKey(word, sentence)] = { ...value, at: Date.now() };

  const keys = Object.keys(store);
  if (keys.length > LIMIT) {
    keys
      .sort((a, b) => (store[a].at ?? 0) - (store[b].at ?? 0))
      .slice(0, keys.length - LIMIT)
      .forEach((k) => delete store[k]);
  }
  write(store);
}
