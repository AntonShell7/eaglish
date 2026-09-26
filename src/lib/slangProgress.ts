/**
 * Which slang dialogues have been worked through, and how well.
 *
 * Its own store rather than a corner of the lesson one: the module is separate
 * on purpose, and sharing a key would mean a slang dialogue quietly counting
 * as an everyday-English lesson in every place that reads it.
 */

export interface SlangResult {
  id: string;
  /** Best first-try score, so a retake can raise it but never lower it. */
  bestCorrect: number;
  total: number;
  attempts: number;
  lastAt: number;
}

const STORAGE_KEY = "slangProgress";

function readAll(): Record<string, SlangResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SlangResult>) : {};
  } catch {
    return {};
  }
}

export function getSlangResults(): Record<string, SlangResult> {
  return readAll();
}

export function saveSlangResult(id: string, correct: number, total: number): SlangResult {
  const all = readAll();
  const previous = all[id];
  const next: SlangResult = {
    id,
    bestCorrect: Math.max(correct, previous?.bestCorrect ?? 0),
    total,
    attempts: (previous?.attempts ?? 0) + 1,
    lastAt: Date.now(),
  };
  all[id] = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* a lost score is not worth taking the session down for */
  }
  return next;
}
