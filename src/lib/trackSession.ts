import { recordLearning } from "./learningRecords";
import { trackLessons, type Step, type TrackLesson } from "@/data/track";

const KEY = "trackDraft";
export interface LessonDraft {
  version: string;
  lessonId: string;
  seed: number;
  stepIds: string[];
  index: number;
  picked: number | null;
  typed: string;
  assembled: number[];
  joined: string[];
  rooms: Record<number, boolean>;
  judged: "right" | "wrong" | null;
  mistakes: number;
  retryCount: number;
  pairMistake: boolean;
  feedback: string | null;
}
const catalog = () => new Map(trackLessons().flatMap(({ lesson }) => lesson.steps.map(step => [step.id, step] as const)));
function version(lesson: TrackLesson): string { return JSON.stringify(lesson.steps); }
export function loadLessonDraft(lesson: TrackLesson): LessonDraft | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    const draft = (saved?.lessonId ? saved : saved?.[lesson.id]) as LessonDraft | null;
    if (!draft || draft.lessonId !== lesson.id || draft.version !== version(lesson)) return null;
    const known = catalog();
    if (!Array.isArray(draft.stepIds) || !draft.stepIds.length || !draft.stepIds.every(id => known.has(id)) ||
      !Number.isInteger(draft.index) || draft.index < 0 || draft.index >= draft.stepIds.length ||
      !Number.isFinite(draft.seed) || typeof draft.typed !== "string" ||
      !Array.isArray(draft.assembled) || !draft.assembled.every(Number.isInteger) ||
      !Array.isArray(draft.joined) || !draft.joined.every(x => typeof x === "string") ||
      !draft.rooms || typeof draft.rooms !== "object" ||
      ![null,"right","wrong"].includes(draft.judged) ||
      !(draft.picked === null || Number.isInteger(draft.picked)) ||
      !Number.isInteger(draft.mistakes) || draft.mistakes < 0 ||
      !Number.isInteger(draft.retryCount) || draft.retryCount < 0 || typeof draft.pairMistake !== "boolean" || !(draft.feedback === null || typeof draft.feedback === "string")) return null;
    return draft;
  } catch { return null; }
}
export function draftSteps(draft: LessonDraft): Step[] {
  const known = catalog();
  return draft.stepIds.map(id => known.get(id)!);
}
export function saveLessonDraft(lesson: TrackLesson, draft: Omit<LessonDraft, "version" | "lessonId">): void {
  try {
    let saved: Record<string, LessonDraft> = {};
    try { const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (raw && !Array.isArray(raw) && typeof raw === "object") saved = raw.lessonId ? { [raw.lessonId]: raw } : raw;
    } catch { /* Replace a damaged draft store. */ }
    saved[lesson.id] = { ...draft, version: version(lesson), lessonId: lesson.id };
    localStorage.setItem(KEY, JSON.stringify(saved));
    recordLearning("slang",lesson.id,{draft:saved[lesson.id],step:draft.index+1,total:draft.stepIds.length});
  } catch { /* Storage may be unavailable. */ }
}
export function clearLessonDraft(lessonId?: string): void {
  try {
    if (!lessonId) { localStorage.removeItem(KEY); return; }
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (saved?.lessonId) { if (saved.lessonId === lessonId) localStorage.removeItem(KEY); return; }
    if (saved && typeof saved === "object") { delete saved[lessonId]; localStorage.setItem(KEY, JSON.stringify(saved)); }
  } catch { /* Storage may be unavailable. */ }
}
/** Shuffle references, retaining the answer's identity even when text repeats. */
export function dealChoice(step: Step, seed: number): Step {
  if (step.kind !== "choice") return step;
  let n = seed >>> 0;
  for (const ch of step.id) n = (Math.imul(n, 31) + ch.charCodeAt(0)) >>> 0;
  const order = step.options.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    n = (n + 0x6d2b79f5) >>> 0;
    let random = Math.imul(n ^ (n >>> 15), n | 1);
    random ^= random + Math.imul(random ^ (random >>> 7), random | 61);
    const j = Math.floor(((random ^ (random >>> 14)) >>> 0) / 4294967296 * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...step, options: order.map(index => step.options[index]), answer: order.indexOf(step.answer) };
}
