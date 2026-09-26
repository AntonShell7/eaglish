/**
 * When a word should come back.
 *
 * The old scheduler was SM-2, the rule of thumb written in the 1980s: keep an
 * "ease" number per card, nudge it up or down after each answer, multiply the
 * interval by it. It works, and it is wrong in a specific way — it has no model
 * of memory at all. It cannot say how likely you are to remember a word today,
 * so it cannot aim at anything; it just grows a number.
 *
 * This is FSRS, which does have a model. Three quantities describe a memory:
 *
 *   Difficulty    how hard this particular word is for this person, 1 to 10.
 *                 "Ubiquitous" is harder than "cat" for everyone, and the
 *                 schedule should not pretend otherwise.
 *
 *   Stability     how many days until the chance of recall falls to 90%.
 *                 This is the memory's strength, measured in time.
 *
 *   Retrievability  the chance you can recall it right now. It decays along a
 *                 forgetting curve as time passes since the last review.
 *
 * The scheduling rule follows from the model rather than from a habit: show the
 * word again when its retrievability has fallen to the target — 90% here, which
 * is the usual sweet spot. Later than that and it is genuinely forgotten and
 * has to be relearned; earlier and the review is wasted, because a memory you
 * can retrieve easily gains almost nothing from being retrieved.
 *
 * That last point is the whole reason spacing works, and it is worth being
 * precise about: the strengthening effect of a successful recall is largest
 * when the recall was hard. A word reviewed the moment after learning it is
 * remembered without effort and is barely reinforced. The same word recalled
 * at the edge of forgetting is reinforced enormously. The algorithm is, in
 * effect, an attempt to keep every word permanently at that edge.
 *
 * The constants below are the published FSRS-4.5 defaults, fitted to hundreds
 * of millions of real reviews. They are not tuned to this learner — that needs
 * a few hundred of their own reviews before it would beat the defaults, and
 * guessing at it with a dozen would be worse than not trying.
 */

/** How the learner did. The four grades FSRS is defined over. */
export type Grade = 0 | 1 | 2 | 3;
export const AGAIN: Grade = 0;
export const HARD: Grade = 1;
export const GOOD: Grade = 2;
export const EASY: Grade = 3;

export interface MemoryState {
  /** Days until recall probability falls to the target. */
  stability: number;
  /** 1 (trivial) to 10 (stubborn). */
  difficulty: number;
}

/** FSRS-4.5 default weights. */
const W = [
  0.4872, 1.4003, 3.7145, 13.8206, // initial stability per grade
  5.1618, 1.2298, // initial difficulty
  0.8975, 0.031, // difficulty update and mean reversion
  1.6474, 0.1367, 1.0461, // stability growth on success
  2.1072, 0.0793, 0.3246, 1.587, // stability after a lapse
  0.8352, 3.0, // hard penalty, easy bonus
];

/*
 * The forgetting curve.
 *
 * FSRS-4.5 uses a power function rather than the exponential decay people
 * usually draw. The difference matters at long intervals: an exponential says a
 * year-old memory is gone, and the data says it very often is not. Memory has a
 * long tail, and a power law has one too.
 */
const DECAY = -0.5;
const FACTOR = 19 / 81;

/** Chance of recall after `days` with this stability, 0..1. */
export function retrievability(days: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * days) / stability, DECAY);
}

/** Days until retrievability falls to `target`. */
export function intervalFor(stability: number, target = 0.9): number {
  return (stability / FACTOR) * (Math.pow(target, 1 / DECAY) - 1);
}

const clampDifficulty = (value: number) => Math.min(10, Math.max(1, value));

/**
 * Where a word starts, decided by how the first answer went.
 *
 * Difficulty is linear in the grade: an answer of "again" on first sight says
 * this word is going to be trouble, "easy" says it will not. The first draft of
 * this used the exponential form from a later revision of FSRS together with
 * this revision's weights, and every word came out at difficulty 1 — the
 * easiest possible — which quietly tripled every interval. Mixing versions of
 * a fitted model is not a small mistake; the numbers only mean anything
 * together.
 */
export function initialState(grade: Grade): MemoryState {
  return {
    stability: Math.max(0.1, W[grade]),
    difficulty: clampDifficulty(W[4] - (grade - GOOD) * W[5]),
  };
}

function nextDifficulty(difficulty: number, grade: Grade): number {
  // Every answer nudges difficulty, and every nudge decays back towards the
  // difficulty a "good" first answer implies. Without that reversion a long
  // unlucky streak would drive a word to 10 and keep it there forever.
  const nudged = difficulty - W[6] * (grade - GOOD);
  // Reversion aims at where an "easy" first answer would have put it, which is
  // what keeps a long unlucky streak from pinning a word at 10 forever.
  const target = clampDifficulty(W[4] - (EASY - GOOD) * W[5]);
  return clampDifficulty(W[7] * target + (1 - W[7]) * nudged);
}

/**
 * Stability after a successful recall.
 *
 * Three things make the gain larger, and each is a fact about memory rather
 * than a knob: an easy word gains more than a stubborn one; a word that is
 * already strong gains proportionally less, so intervals lengthen but stop
 * doubling forever; and — the important one — a recall that was hard, meaning
 * retrievability had fallen low, is worth far more than an easy one.
 */
function stabilityAfterRecall(state: MemoryState, r: number, grade: Grade): number {
  const hardPenalty = grade === HARD ? W[15] : 1;
  const easyBonus = grade === EASY ? W[16] : 1;

  const growth =
    Math.exp(W[8]) *
    (11 - state.difficulty) *
    Math.pow(state.stability, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus;

  return state.stability * (1 + growth);
}

/**
 * Stability after forgetting.
 *
 * Deliberately not zero. A word you have met and lost is not a word you have
 * never met: relearning is faster than learning, and the harder the word had
 * been — high difficulty, or forgotten when it should have been easy — the less
 * survives. Resetting to zero is SM-2's cruellest habit and the reason people
 * feel punished by their own decks.
 */
function stabilityAfterLapse(state: MemoryState, r: number): number {
  return Math.min(
    state.stability,
    W[11] *
      Math.pow(state.difficulty, -W[12]) *
      (Math.pow(state.stability + 1, W[13]) - 1) *
      Math.exp(W[14] * (1 - r)),
  );
}

export interface Scheduled extends MemoryState {
  /** Days until this word should be seen again. */
  interval: number;
  /** Retrievability at the moment of review — how hard the recall was. */
  wasAt: number;
}

/**
 * Schedules one review.
 *
 * `elapsed` is days since the last review; for a brand-new word it is ignored.
 */
export function schedule(
  previous: MemoryState | null,
  elapsed: number,
  grade: Grade,
  target = 0.9,
): Scheduled {
  if (!previous || previous.stability <= 0) {
    const state = initialState(grade);
    return { ...state, interval: intervalFor(state.stability, target), wasAt: 1 };
  }

  const r = retrievability(Math.max(0, elapsed), previous.stability);
  const difficulty = nextDifficulty(previous.difficulty, grade);
  const stability =
    grade === AGAIN ? stabilityAfterLapse(previous, r) : stabilityAfterRecall(previous, r, grade);

  return {
    stability,
    difficulty,
    interval: intervalFor(stability, target),
    wasAt: r,
  };
}

/** Longest gap we will schedule. Beyond this the estimate is fantasy. */
export const MAX_INTERVAL_DAYS = 365 * 2;

/**
 * Turns an interval into a due date.
 *
 * Short intervals are left exact; longer ones are spread by up to a tenth so
 * that a batch of words learned on the same evening does not come back as the
 * same wall of work every time.
 */
export function dueDateFor(intervalDays: number, from = Date.now()): number {
  const days = Math.min(MAX_INTERVAL_DAYS, Math.max(0, intervalDays));
  const fuzz = days > 3 ? 1 + (Math.random() * 0.2 - 0.1) : 1;
  return from + days * fuzz * 24 * 60 * 60 * 1000;
}
