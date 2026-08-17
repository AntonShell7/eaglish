import { BANDS, placementItems, type Band, type PlacementItem } from "@/data/placementTest";

/**
 * The five-minute level check.
 *
 * It climbs and drops: answer right and the next question is harder, answer
 * wrong and it gets easier. Ten questions placed that way say far more about a
 * level than thirty questions all at the same difficulty — which is also why
 * this is short enough that people actually finish it.
 */

export type ReadingLevel = "A1-A2" | "B1-B2" | "C1-C2";

export const TOTAL_QUESTIONS = 10;

/** An item with its options shuffled — every authored answer is index 0. */
export interface PreparedItem {
  id: string;
  band: Band;
  text: string;
  options: string[];
  answer: number;
  note: string;
}

export interface AnsweredItem {
  id: string;
  band: Band;
  correct: boolean;
  /** What they picked and what was right, for the review screen. */
  picked: string;
  expected: string;
  note: string;
  text: string;
}

export interface PlacementSession {
  bandIndex: number;
  answered: AnsweredItem[];
  used: string[];
}

/** Starts one band above the floor: most learners are not absolute beginners. */
export function startSession(): PlacementSession {
  return { bandIndex: 1, answered: [], used: [] };
}

function prepare(item: PlacementItem): PreparedItem {
  const correct = item.options[item.answer];
  const options = [...item.options].sort(() => Math.random() - 0.5);
  return { ...item, options, answer: options.indexOf(correct) };
}

/**
 * Next question at the current difficulty, or the closest band that still has
 * unused items — running out of C1 questions must not end the test early.
 */
export function nextItem(session: PlacementSession): PreparedItem | null {
  if (session.answered.length >= TOTAL_QUESTIONS) return null;

  for (let distance = 0; distance < BANDS.length; distance++) {
    for (const index of [session.bandIndex - distance, session.bandIndex + distance]) {
      if (index < 0 || index >= BANDS.length) continue;
      const pool = placementItems.filter((i) => i.band === BANDS[index] && !session.used.includes(i.id));
      if (pool.length > 0) return prepare(pool[Math.floor(Math.random() * pool.length)]);
    }
  }
  return null;
}

export function record(session: PlacementSession, item: PreparedItem, pickedIndex: number): PlacementSession {
  const correct = pickedIndex === item.answer;
  const bandIndex = correct
    ? Math.min(session.bandIndex + 1, BANDS.length - 1)
    : Math.max(session.bandIndex - 1, 0);

  return {
    bandIndex,
    used: [...session.used, item.id],
    answered: [
      ...session.answered,
      {
        id: item.id,
        band: item.band,
        correct,
        picked: item.options[pickedIndex],
        expected: item.options[item.answer],
        note: item.note,
        text: item.text,
      },
    ],
  };
}

export interface PlacementResult {
  band: Band;
  level: ReadingLevel;
  correct: number;
  total: number;
}

const LEVEL_OF_BAND: Record<Band, ReadingLevel> = {
  A1: "A1-A2",
  A2: "A1-A2",
  B1: "B1-B2",
  B2: "B1-B2",
  C1: "C1-C2",
};

/**
 * The estimate is the hardest band the learner actually held: at least two
 * questions seen there and most of them right. One lucky guess at C1 should
 * never outweigh a band that was answered consistently.
 */
export function estimate(session: PlacementSession): PlacementResult {
  const stats = new Map<Band, { asked: number; correct: number }>();
  for (const a of session.answered) {
    const s = stats.get(a.band) ?? { asked: 0, correct: 0 };
    s.asked++;
    if (a.correct) s.correct++;
    stats.set(a.band, s);
  }

  let band: Band = "A1";
  for (const candidate of BANDS) {
    const s = stats.get(candidate);
    if (s && s.asked >= 2 && s.correct / s.asked >= 0.6) band = candidate;
  }

  // Nothing held for two questions: fall back to the hardest band with any
  // correct answer, so a short test still lands somewhere honest.
  if (band === "A1" && (stats.get("A1")?.correct ?? 0) === 0) {
    for (const candidate of BANDS) {
      if ((stats.get(candidate)?.correct ?? 0) > 0) band = candidate;
    }
  }

  return {
    band,
    level: LEVEL_OF_BAND[band],
    correct: session.answered.filter((a) => a.correct).length,
    total: session.answered.length,
  };
}
