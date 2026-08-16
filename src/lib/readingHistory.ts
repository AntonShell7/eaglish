export interface ReadingSessionEntry {
  textId: string;
  openedAt: number;
}

export interface QuizResult {
  textId: string;
  correct: number;
  total: number;
  at: number;
}

const STORAGE_KEY = "readingHistory";
const QUIZ_KEY = "readingQuizResults";

function readAll(): ReadingSessionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadingSessionEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ReadingSessionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function logReadingOpen(textId: string) {
  const all = readAll();
  if (all[0]?.textId === textId) return;
  writeAll([{ textId, openedAt: Date.now() }, ...all]);
}

export function getReadingHistory(): ReadingSessionEntry[] {
  return readAll();
}

export function getUniqueTextsRead(): number {
  return new Set(readAll().map((e) => e.textId)).size;
}

function readQuiz(): QuizResult[] {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    return raw ? (JSON.parse(raw) as QuizResult[]) : [];
  } catch {
    return [];
  }
}

export function recordQuizResult(textId: string, correct: number, total: number) {
  const all = readQuiz();
  localStorage.setItem(QUIZ_KEY, JSON.stringify([{ textId, correct, total, at: Date.now() }, ...all]));
}

export function getQuizResults(): QuizResult[] {
  return readQuiz();
}

/** Best score per text, summed — so retries improve the number but don't inflate it. */
export function getQuizTotals(): { correct: number; total: number } {
  const best = new Map<string, QuizResult>();
  for (const r of readQuiz()) {
    const current = best.get(r.textId);
    if (!current || r.correct > current.correct) best.set(r.textId, r);
  }
  let correct = 0;
  let total = 0;
  for (const r of best.values()) {
    correct += r.correct;
    total += r.total;
  }
  return { correct, total };
}
