import type { WritingScores } from "./writingFeedback";

export interface WritingSubmission {
  id: string;
  topicId: string;
  wordCount: number;
  scores: WritingScores;
  submittedAt: number;
}

const STORAGE_KEY = "writingHistory";

function readAll(): WritingSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WritingSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: WritingSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getWritingHistory(): WritingSubmission[] {
  return readAll().sort((a, b) => b.submittedAt - a.submittedAt);
}

export function addWritingSubmission(entry: {
  topicId: string;
  wordCount: number;
  scores: WritingScores;
}): WritingSubmission {
  const submission: WritingSubmission = {
    id: crypto.randomUUID(),
    submittedAt: Date.now(),
    ...entry,
  };
  writeAll([submission, ...readAll()]);
  return submission;
}
