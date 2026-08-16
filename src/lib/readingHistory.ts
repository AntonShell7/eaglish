import { pushReadingOpen, pushQuizResult } from "./sync";
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
  const entry = { textId, openedAt: Date.now() };
  writeAll([entry, ...all]);
  pushReadingOpen(entry);
}

/** Append-only log; dedupe on text + timestamp so a re-pull can't double it. */
export function mergeRemoteReading(remote: ReadingSessionEntry[]) {
  const seen = new Map<string, ReadingSessionEntry>();
  for (const e of [...readAll(), ...remote]) seen.set(`${e.textId}@${e.openedAt}`, e);
  writeAll([...seen.values()].sort((a, b) => b.openedAt - a.openedAt));
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
  const entry: QuizResult = { textId, correct, total, at: Date.now() };
  localStorage.setItem(QUIZ_KEY, JSON.stringify([entry, ...readQuiz()]));
  pushQuizResult(entry);
}

export function mergeRemoteQuiz(remote: QuizResult[]) {
  const seen = new Map<string, QuizResult>();
  for (const r of [...readQuiz(), ...remote]) seen.set(`${r.textId}@${r.at}`, r);
  localStorage.setItem(QUIZ_KEY, JSON.stringify([...seen.values()].sort((a, b) => b.at - a.at)));
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
