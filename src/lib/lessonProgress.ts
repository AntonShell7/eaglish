/**
 * Which everyday-English lessons have been passed, and how well.
 *
 * Local only, on purpose: the daily activity log already records that a lesson
 * was finished (that's what the goal and the streak are built on), so this is
 * just the per-lesson detail the hub needs to show a tick and a best score.
 */

export interface LessonResult {
  lessonId: string;
  /** Best first-try score, so a retake can improve it but never lower it. */
  bestCorrect: number;
  total: number;
  attempts: number;
  lastAt: number;
}

const STORAGE_KEY = "everydayLessonProgress";

function readAll(): Record<string, LessonResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LessonResult>) : {};
  } catch {
    return {};
  }
}

export function getLessonResults(): Record<string, LessonResult> {
  return readAll();
}

export function getLessonResult(lessonId: string): LessonResult | undefined {
  return readAll()[lessonId];
}

export function saveLessonResult(lessonId: string, correct: number, total: number): LessonResult {
  const all = readAll();
  const prev = all[lessonId];
  const next: LessonResult = {
    lessonId,
    bestCorrect: Math.max(correct, prev?.bestCorrect ?? 0),
    total,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAt: Date.now(),
  };
  all[lessonId] = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}

export function countCompletedLessons(): number {
  return Object.keys(readAll()).length;
}
