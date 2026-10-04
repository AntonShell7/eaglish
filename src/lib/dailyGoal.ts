import { kindsDoneToday, type ActivityKind } from "./activityStore";
import { getReviewedTodayCount } from "./vocabularyStore";
import { learningDay } from "./dailyDesk";
import { planSession } from "./session";

/**
 * The day's minimum, and the one moment the app asks for anything.
 *
 * This is deliberately not a Duolingo path. Duolingo decides everything and
 * gets enormous retention out of it, but what it is actually teaching is a
 * tree somebody else designed — and this product's whole argument is that the
 * material should come from the learner's own reading. Deciding *that* for
 * them would throw away the thing that makes it worth using.
 *
 * So the split is: the app decides what it is genuinely better at deciding,
 * and the learner decides the rest.
 *
 *   Review — not a choice. Which words are about to be lost is a question with
 *   a correct answer, the scheduler knows it, and asking a tired person to
 *   work it out at the door is how an evening of study does not happen.
 *
 *   Where the new words come from — entirely a choice. A text, a dictation, a
 *   slang lesson: all three feed the same vocabulary, and which one somebody
 *   is in the mood for is not something an algorithm can know or should guess.
 *
 * And it asks once. The panel appears on the first visit of the learning day
 * and then gets out of the way; coming back in the evening lands on the
 * ordinary app. Anything past the minimum — more reviews, a second text, a
 * dictation for the pleasure of it — is the learner's own business and is
 * never prompted.
 *
 *
 * STATE IS DERIVED, NOT STORED
 *
 * The obvious build is a stored machine — "stage: review → choose → done" —
 * and it is wrong, because the learner can walk in the side door. Somebody who
 * opens Reading directly and works through a text has done the day's input;
 * a stage counter would not know, and would greet them with a panel asking
 * them to do what they just did.
 *
 * So the stage is worked out from what was actually finished today, using the
 * same record the daily goal already keeps. The one thing stored is a skip,
 * because "I don't want this today" is the only fact the record cannot imply.
 */

/** The kinds of work that count as bringing in new material. */
const INPUT_KINDS: ActivityKind[] = ["reading", "listening", "slang"];

/**
 * Cards that count as the day's review done.
 *
 * The whole due queue would be the honest number and the wrong target: after a
 * few months an ordinary Tuesday is ninety cards, and a minimum nobody can
 * finish is a minimum nobody starts. The planner already caps a session at
 * twenty, and this takes the smaller of that and what is actually due.
 */
const REVIEW_CAP = 20;

const SKIP_KEY = "dailyGoalSkipped";

export type DailyStage =
  /** Words are waiting and have not been done. */
  | "review"
  /** Review is clear; nothing has brought in new material yet. */
  | "choose"
  /** The minimum is met. */
  | "done";

export interface DailyState {
  stage: DailyStage;
  /** Whether the panel should show at all — false once skipped or finished. */
  show: boolean;
  /** Cards due in today's session, capped. */
  reviewTarget: number;
  reviewDone: number;
  /** Which input kinds are already finished, if any. */
  inputDone: ActivityKind[];
}

function skippedToday(userId?: string | null): boolean {
  try {
    return Number(localStorage.getItem(SKIP_KEY)) === learningDay(userId);
  } catch {
    return false;
  }
}

/** "Not today." Remembered for this learning day only. */
export function skipDailyGoal(userId?: string | null) {
  try {
    localStorage.setItem(SKIP_KEY, String(learningDay(userId)));
  } catch {
    // A skip that cannot be remembered means the panel appears again on the
    // next navigation. Mildly annoying, never broken.
  }
}

export function dailyState(userId?: string | null): DailyState {
  const target = Math.min(REVIEW_CAP, planSession().review.length);
  const reviewed = getReviewedTodayCount();
  const done = kindsDoneToday();
  const inputDone = INPUT_KINDS.filter((kind) => done.has(kind));

  const reviewLeft = target > 0 && reviewed < target;
  const stage: DailyStage = reviewLeft ? "review" : inputDone.length === 0 ? "choose" : "done";

  return {
    stage,
    show: stage !== "done" && !skippedToday(userId),
    reviewTarget: target,
    reviewDone: reviewed,
    inputDone,
  };
}
