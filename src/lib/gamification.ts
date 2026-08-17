import { getActivity, getStreak, getBestStreak, type ActivityKind } from "./activityStore";
import { getVocabulary } from "./vocabularyStore";
import { getWritingHistory } from "./writingHistory";
import { getUniqueTextsRead, getQuizResults } from "./readingHistory";

/**
 * XP, levels and achievements.
 *
 * Everything here is *derived* from the activity that's already recorded — no
 * separate XP counter to drift out of sync with reality. Re-deriving also means
 * XP arrives automatically once progress syncs down from another device.
 */

/** XP is weighted by effort: writing a text is worth more than saving a word. */
export const XP_PER_ACTIVITY: Record<ActivityKind, number> = {
  reading: 8,
  quiz: 12,
  vocabulary: 4,
  writing: 25,
};

export function getTotalXp(): number {
  return getActivity().reduce((sum, day) => {
    let dayXp = 0;
    for (const [kind, n] of Object.entries(day.counts) as [ActivityKind, number][]) {
      dayXp += (XP_PER_ACTIVITY[kind] ?? 0) * (n ?? 0);
    }
    return sum + dayXp;
  }, 0);
}

export function getXpForDay(date: string): number {
  const day = getActivity().find((d) => d.date === date);
  if (!day) return 0;
  return (Object.entries(day.counts) as [ActivityKind, number][]).reduce(
    (sum, [kind, n]) => sum + (XP_PER_ACTIVITY[kind] ?? 0) * (n ?? 0),
    0,
  );
}

/**
 * Levels widen as you climb: level n needs 100·n XP on top of the previous one,
 * so early levels come fast and later ones feel earned.
 */
export function xpToReachLevel(level: number): number {
  // Sum of 100·k for k = 1..level-1  →  50·level·(level-1)
  return 50 * level * (level - 1);
}

export interface LevelState {
  level: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  progress: number; // 0..1
}

export function getLevelState(totalXp = getTotalXp()): LevelState {
  let level = 1;
  while (xpToReachLevel(level + 1) <= totalXp) level++;

  const floor = xpToReachLevel(level);
  const span = xpToReachLevel(level + 1) - floor;
  const into = totalXp - floor;

  return {
    level,
    xpIntoLevel: into,
    xpForThisLevel: span,
    progress: span > 0 ? into / span : 0,
  };
}

/* ── Achievements ─────────────────────────────────────────────────────── */

export interface Achievement {
  id: string;
  /** i18n key suffix under `achievements.` */
  key: string;
  icon: string;
  /** Current value and the target needed to unlock. */
  progress: number;
  target: number;
}

export function getAchievements(): Achievement[] {
  const vocab = getVocabulary();
  const writing = getWritingHistory();
  const textsRead = getUniqueTextsRead();
  const quizzes = getQuizResults();
  const perfectQuizzes = quizzes.filter((q) => q.correct === q.total).length;
  const reviewed = vocab.filter((w) => w.reviewCount > 0).length;
  const streak = getStreak();
  const best = Math.max(streak, getBestStreak());
  const level = getLevelState().level;

  const defs: Achievement[] = [
    { id: "first-steps", key: "firstSteps", icon: "◆", progress: textsRead, target: 1 },
    { id: "reader", key: "reader", icon: "◆", progress: textsRead, target: 5 },
    { id: "bookworm", key: "bookworm", icon: "◆", progress: textsRead, target: 15 },
    { id: "collector", key: "collector", icon: "◆", progress: vocab.length, target: 10 },
    { id: "hoarder", key: "hoarder", icon: "◆", progress: vocab.length, target: 50 },
    { id: "reviewer", key: "reviewer", icon: "◆", progress: reviewed, target: 20 },
    { id: "writer", key: "writer", icon: "◆", progress: writing.length, target: 1 },
    { id: "essayist", key: "essayist", icon: "◆", progress: writing.length, target: 10 },
    { id: "sharp", key: "sharp", icon: "◆", progress: perfectQuizzes, target: 3 },
    { id: "consistent", key: "consistent", icon: "◆", progress: best, target: 3 },
    { id: "committed", key: "committed", icon: "◆", progress: best, target: 7 },
    { id: "relentless", key: "relentless", icon: "◆", progress: best, target: 30 },
    { id: "levelFive", key: "levelFive", icon: "◆", progress: level, target: 5 },
  ];

  return defs;
}

export function isUnlocked(a: Achievement): boolean {
  return a.progress >= a.target;
}

/* ── Activity mix, for the dashboard's composition chart ──────────────── */

export function getActivityMix(): Record<ActivityKind, number> {
  const mix: Record<ActivityKind, number> = { reading: 0, writing: 0, vocabulary: 0, quiz: 0 };
  for (const day of getActivity()) {
    for (const [kind, n] of Object.entries(day.counts) as [ActivityKind, number][]) {
      mix[kind] += n ?? 0;
    }
  }
  return mix;
}
