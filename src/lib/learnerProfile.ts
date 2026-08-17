import { setDailyGoal } from "./activityStore";
import { pushLearnerProfile } from "./sync";
import type { Band } from "@/data/placementTest";
import type { ReadingLevel } from "./placement";

/**
 * What the learner told us on the way in.
 *
 * Onboarding exists to make the first session feel aimed rather than generic:
 * the level decides which texts open first, the goal reorders the writing
 * briefs, the interests reorder the reading list, and the daily goal is the
 * promise the streak is measured against. Nothing here is decoration — every
 * field is read somewhere.
 */

/** Why they're learning. Drives which writing formats surface first. */
export type Goal = "exams" | "study" | "work" | "travel" | "content" | "general";

export const GOALS: Goal[] = ["exams", "study", "work", "travel", "content", "general"];

/**
 * Interests are the reading collection's own topics — offering categories we
 * have no texts for would be a promise the app can't keep.
 */
export const INTERESTS = ["Daily life", "Travel", "Technology", "Communication", "Science", "Society"] as const;

export interface PlacementRecord {
  band: Band;
  correct: number;
  total: number;
  takenAt: number;
  /** Set when the learner picked their level instead of taking the test. */
  selfReported?: boolean;
}

export interface LearnerProfile {
  level: ReadingLevel;
  goal: Goal;
  interests: string[];
  dailyGoal: number;
  onboardedAt: number;
  placement?: PlacementRecord;
}

const STORAGE_KEY = "learnerProfile";

export function getLearnerProfile(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearnerProfile) : null;
  } catch {
    return null;
  }
}

export function isOnboarded(): boolean {
  return getLearnerProfile() !== null;
}

export function saveLearnerProfile(profile: LearnerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  // The daily goal lives in the activity store — that's what the streak reads.
  setDailyGoal(profile.dailyGoal);
  pushLearnerProfile(profile);
}

export function updateLearnerProfile(patch: Partial<LearnerProfile>) {
  const current = getLearnerProfile();
  if (!current) return;
  saveLearnerProfile({ ...current, ...patch });
}

/** Signed-out or pre-onboarding visitors get the middle band. */
export function preferredLevel(fallback: ReadingLevel = "A1-A2"): ReadingLevel {
  return getLearnerProfile()?.level ?? fallback;
}

/**
 * A profile pulled from the account wins only if this device has none — the
 * local copy is the one the learner has been correcting by hand.
 */
export function mergeRemoteProfile(remote: LearnerProfile | null) {
  if (!remote) return;
  const local = getLearnerProfile();
  if (local && local.onboardedAt >= remote.onboardedAt) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
  setDailyGoal(remote.dailyGoal);
}

/**
 * Sort order for the reading list: the learner's own level first, then their
 * topics, so the first card on the page is one they'd have picked anyway.
 */
export function rankByPreference<T extends { level: string; topic: string }>(items: T[]): T[] {
  const profile = getLearnerProfile();
  if (!profile) return items;
  return [...items].sort((a, b) => {
    const levelScore = (x: T) => (x.level === profile.level ? 0 : 1);
    const topicScore = (x: T) => (profile.interests.includes(x.topic) ? 0 : 1);
    return levelScore(a) - levelScore(b) || topicScore(a) - topicScore(b);
  });
}

/** Numeric difficulty, so a lesson band can be compared to a reading level. */
const LEVEL_WEIGHT: Record<string, number> = { "A1-A2": 0.3, "B1-B2": 1.2, "C1-C2": 1.8 };
const LESSON_WEIGHT: Record<string, number> = { A2: 0.3, "A2–B1": 0.7, B1: 1.2, "B1–B2": 1.6 };

/** Lessons closest to the learner's level first — not the easiest, the right one. */
export function rankLessons<T extends { level: string }>(items: T[]): T[] {
  const profile = getLearnerProfile();
  if (!profile) return items;
  const target = LEVEL_WEIGHT[profile.level] ?? 1;
  return [...items].sort(
    (a, b) =>
      Math.abs((LESSON_WEIGHT[a.level] ?? 1) - target) - Math.abs((LESSON_WEIGHT[b.level] ?? 1) - target),
  );
}

/** Which writing format each goal actually needs first. */
const FORMAT_PRIORITY: Record<Goal, string[]> = {
  exams: ["Essay", "Review", "Email", "Story"],
  study: ["Essay", "Email", "Review", "Story"],
  work: ["Email", "Essay", "Review", "Story"],
  travel: ["Email", "Review", "Story", "Essay"],
  content: ["Review", "Story", "Essay", "Email"],
  general: ["Email", "Essay", "Review", "Story"],
};

export function rankByGoal<T extends { format: string }>(items: T[]): T[] {
  const profile = getLearnerProfile();
  if (!profile) return items;
  const order = FORMAT_PRIORITY[profile.goal] ?? [];
  return [...items].sort((a, b) => {
    const score = (x: T) => {
      const i = order.indexOf(x.format);
      return i === -1 ? order.length : i;
    };
    return score(a) - score(b);
  });
}
