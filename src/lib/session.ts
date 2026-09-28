import {
  getDueWords,
  getLeeches,
  getVocabulary,
  recallChance,
  type VocabularyWord,
} from "./vocabularyStore";

/**
 * What to do right now.
 *
 * The app had every piece of this already — a scheduler that knows when a word
 * is due, a drill, an activation exercise, a leech list — and asked the
 * learner to assemble them. Tabs, style segments, folders, a "practise all"
 * button: every one of those is a question, and a question asked before the
 * work has started is the work not starting.
 *
 * So this decides. It is the one place that answers "what am I doing today",
 * and everything it needs is already on the device, which is why it can answer
 * instantly and offline.
 *
 * The rules, and why each one is there:
 *
 * - **Due words come first, worst recall first.** A word at 30% recall is
 *   about to be lost and a word at 85% is not; spending the session's first
 *   minutes on the second is how people study for an hour and forget anyway.
 * - **The session is capped.** Twenty is about eight minutes. An uncapped
 *   queue of ninety is what makes somebody close the app and not open it for
 *   a week, and the words at the bottom of that queue were never going to be
 *   reviewed anyway.
 * - **Leeches are rationed, not front-loaded.** A word forgotten five times is
 *   the one that needs a different treatment, not another card — but a session
 *   that opens with five of them is a session that feels like failure.
 * - **Activation is the tail, not the head.** Writing a sentence with a word
 *   is the most expensive thing here and the most valuable, so it goes where
 *   the learner has already banked something.
 */

/** About eight minutes. Short enough to finish, long enough to matter. */
const SESSION_CAP = 20;
/** How many stubborn words one session is allowed to spend itself on. */
const LEECH_SHARE = 3;
/** How many of the day's words get taken all the way into a written sentence. */
const ACTIVATION = 3;

export interface SessionPlan {
  /** The words to review, in the order to review them. */
  review: VocabularyWord[];
  /** Words to take further — recalled well enough to be worth writing with. */
  activate: VocabularyWord[];
  /** How many were due in total, so the interface can be honest about the cap. */
  dueTotal: number;
  /** Minutes, rounded, for the one thing a learner actually wants to know. */
  minutes: number;
}

export function planSession(now = Date.now()): SessionPlan {
  const due = getDueWords(now);
  const leeches = new Set(getLeeches().map((w) => w.id));

  /* Worst recall first, but with the stubborn words held back to a share of
     the session. `recallChance` returns 0 for a word never reviewed, which is
     correct: a word saved and not yet seen is the most urgent thing there is. */
  const ranked = [...due].sort((a, b) => recallChance(a, now) - recallChance(b, now));

  const review: VocabularyWord[] = [];
  const held: VocabularyWord[] = [];
  let spentOnLeeches = 0;

  for (const word of ranked) {
    if (review.length >= SESSION_CAP) break;
    if (leeches.has(word.id)) {
      if (spentOnLeeches >= LEECH_SHARE) {
        held.push(word);
        continue;
      }
      spentOnLeeches += 1;
    }
    review.push(word);
  }

  /* A short queue is not a reason to stop early. If the due list ran out
     before the cap, the words closest to falling due are worth pulling
     forward — the scheduler already knows that reviewing early teaches less
     and shortens the next interval accordingly, so this costs nothing. */
  if (review.length < SESSION_CAP) {
    const seen = new Set(review.map((w) => w.id));
    const soon = getVocabulary()
      .filter((w) => !seen.has(w.id) && w.dueAt > now)
      .sort((a, b) => a.dueAt - b.dueAt)
      .slice(0, SESSION_CAP - review.length);
    review.push(...soon, ...held.slice(0, Math.max(0, SESSION_CAP - review.length - soon.length)));
  }

  /* Words worth writing a sentence with: known well enough that the sentence
     is a use rather than a guess, and not the ones already fighting to be
     remembered at all. */
  const activate = review
    .filter((w) => !leeches.has(w.id) && w.reviewCount > 0 && recallChance(w, now) > 0.6)
    .slice(0, ACTIVATION);

  return {
    review,
    activate,
    dueTotal: due.length,
    // Roughly twenty seconds a card, a minute for a written sentence.
    minutes: Math.max(1, Math.round((review.length * 20 + activate.length * 60) / 60)),
  };
}
