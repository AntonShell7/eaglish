/**
 * Where you stopped, so you can come back.
 *
 * A dictation of fifty fragments is fifteen or twenty minutes of close work,
 * and almost nobody gives it all at once. Without somewhere to keep the place,
 * every interruption costs the whole exercise: you either start again from the
 * first sentence or you never open it. Both mean the long texts — the ones
 * worth listening to — are the ones that never get finished.
 *
 * Kept in this browser. It is a bookmark, not data worth an account: losing it
 * costs one session's place, and syncing it would mean a write on every
 * sentence.
 */

const KEY = "dictationProgress";

export interface Progress {
  /** The fragment to resume at. */
  index: number;
  /** Accuracy of each finished fragment, for the closing figure. */
  scores: number[];
  at: number;
}

type Store = Record<string, Progress>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

export function getProgress(id: string): Progress | null {
  return read()[id] ?? null;
}

export function saveProgress(id: string, index: number, scores: number[]): void {
  const all = read();
  all[id] = { index, scores, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* a lost bookmark is a lost bookmark */
  }
}

/** Called when the last fragment is done, so the text starts clean next time. */
export function clearProgress(id: string): void {
  const all = read();
  delete all[id];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** For the shelf: how far through each text the learner is. */
export function progressOf(id: string, total: number): number {
  const saved = read()[id];
  if (!saved || total === 0) return 0;
  return Math.min(1, saved.index / total);
}
