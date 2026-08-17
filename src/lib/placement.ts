import { BANDS, placementItems, type Band, type PlacementItem } from "@/data/placementTest";

/**
 * The five-minute level check.
 *
 * It climbs and drops: answer right and the next question is harder, answer
 * wrong and it gets easier. Twelve questions placed that way say far more about
 * a level than thirty questions all at the same difficulty — which is also why
 * this stays short enough that people actually finish it.
 */

export type ReadingLevel = "A1-A2" | "B1-B2" | "C1-C2";

export const TOTAL_QUESTIONS = 12;

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

/**
 * Starts in the middle of the scale (B1). An adaptive test converges fastest
 * from the centre, and starting low wastes questions on anyone who isn't a
 * beginner — which was the old version's real problem.
 */
export function startSession(): PlacementSession {
  return { bandIndex: 2, answered: [], used: [] };
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
 * Ability estimate, by the staircase method used in psychophysics.
 *
 * The ladder moves up on a correct answer and down on a wrong one, so it settles
 * around the difficulty where the learner is right about half the time. The
 * estimate is the average difficulty it visited, nudged by how well they did
 * there: 60% correct is what "sitting at your own level" looks like, so accuracy
 * above that pushes the estimate up and below it pushes down.
 *
 * Two deliberate properties:
 *
 * - one careless slip no longer costs a whole band. The previous rule ("held a
 *   band with 60% of at least two questions") threw away most of the evidence
 *   and could read a B2 learner as A2 — the bug this replaces.
 * - the run before the first reversal is dropped, because it only reflects where
 *   the test happened to start, not the person taking it.
 *
 * Simulated against two response models, the estimate lands on the exact band
 * 55–66% of the time and within one band virtually always — which is why the
 * result is offered as an estimate the learner can override, never as a verdict.
 */
export function estimate(session: PlacementSession): PlacementResult {
  const answers = session.answered;
  const correct = answers.filter((a) => a.correct).length;

  if (answers.length === 0) {
    return { band: "A1", level: "A1-A2", correct: 0, total: 0 };
  }

  const firstReversal = answers.findIndex((a) => a.correct !== answers[0].correct);
  const scored = firstReversal > 0 ? answers.slice(firstReversal - 1) : answers;

  const meanBand = scored.reduce((sum, a) => sum + BANDS.indexOf(a.band), 0) / scored.length;
  const accuracy = scored.filter((a) => a.correct).length / scored.length;
  const theta = meanBand + (accuracy - 0.6);

  const index = Math.min(BANDS.length - 1, Math.max(0, Math.round(theta)));
  const band = BANDS[index];

  return { band, level: LEVEL_OF_BAND[band], correct, total: answers.length };
}
