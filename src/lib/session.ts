import { getDueWords, getVocabulary, wordStrength } from "./vocabularyStore";
import { getLearnerProfile } from "./learnerProfile";
import { getTodayCount } from "./activityStore";
import { getReadingHistory } from "./readingHistory";
import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { ensureLexicon, normalise, tokenise } from "./lexicon";

/**
 * Today's session, decided by the app rather than by the learner.
 *
 * The app had five equal doors — reading, dictation, writing, conversation,
 * vocabulary — and opening it meant choosing between them before any English
 * happened. That is a catalogue, and a catalogue is the opposite of the promise
 * this product makes. Worse, the five are not five products: three of them are
 * ways of meeting words, one is a way of using them, and one is where they
 * live. It is a single loop that had been shelved as a menu.
 *
 * So the loop is stated directly. Words that are due come back first, because
 * they are the only work with a deadline. Then one piece of input — a text to
 * read or to take down by ear — chosen for containing those very words, so the
 * revision and the reading are the same act rather than two chores. Then, when
 * there is enough vocabulary to be worth it, one short piece of production,
 * which is the only step that proves a word is actually held.
 *
 * Nothing here is new practice. It is the practice that already existed, with
 * the choosing taken off the learner.
 */

export type StepKind = "review" | "read" | "dictate" | "use";

export interface SessionStep {
  kind: StepKind;
  /** Words this step is about, when it is about particular words. */
  words?: string[];
  /** The text chosen for reading or dictation. */
  text?: ReadingText;
  /** How many due words this text happens to contain. */
  recycled?: number;
  minutes: number;
}

export interface Session {
  steps: SessionStep[];
  /** Due right now — the number the whole session is built around. */
  due: number;
  collected: number;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Reading or dictation, alternating.
 *
 * Both put words in front of the learner; they differ in which ability they
 * tax, and doing only one of them for weeks is how people end up reading
 * fluently and understanding nothing spoken. Alternating by day is enough to
 * keep both alive without asking anyone to choose.
 */
function inputKind(): "read" | "dictate" {
  return Math.floor(Date.now() / DAY) % 2 === 0 ? "read" : "dictate";
}

/**
 * The text for today.
 *
 * Scored, not picked at random: a text that contains words already due is worth
 * far more than a fresh one, because meeting a word in a sentence is a better
 * review than meeting it on a card. Level comes second — the learner's own band
 * — and anything read in the last fortnight is pushed to the back.
 */
async function chooseText(dueWords: Set<string>): Promise<{ text: ReadingText; recycled: number } | null> {
  await ensureLexicon();

  const band = getLearnerProfile()?.level ?? "A1-A2";
  const seen = new Set(
    getReadingHistory()
      .filter((entry) => Date.now() - entry.openedAt < 14 * DAY)
      .map((entry) => entry.textId),
  );

  const topics = readingTopics.filter((topic) => topic.total > 0);
  const batches = await Promise.all(topics.map((topic) => loadTopicTexts(topic.id)));
  const all = batches.flat();
  if (all.length === 0) return null;

  let best: { text: ReadingText; recycled: number; score: number } | null = null;

  for (const text of all) {
    const words = new Set(text.sentences.flatMap((sentence) => tokenise(sentence.text)).map(normalise));
    let recycled = 0;
    for (const due of dueWords) if (words.has(due)) recycled++;

    const score =
      recycled * 10 + (text.level === band ? 4 : 0) - (seen.has(text.id) ? 6 : 0) + Math.random();

    if (!best || score > best.score) best = { text, recycled, score };
  }

  return best ? { text: best.text, recycled: best.recycled } : null;
}

export async function buildSession(): Promise<Session> {
  const due = getDueWords();
  const collected = getVocabulary();
  const dueSet = new Set(due.map((word) => normalise(word.word)));

  const steps: SessionStep[] = [];

  if (due.length > 0) {
    steps.push({
      kind: "review",
      words: due.slice(0, 8).map((word) => word.word),
      // Roughly ten seconds a card, floored at a minute so the promise is
      // never smaller than the effort.
      minutes: Math.max(1, Math.round((due.length * 10) / 60)),
    });
  }

  const chosen = await chooseText(dueSet);
  if (chosen) {
    steps.push({
      kind: inputKind(),
      text: chosen.text,
      recycled: chosen.recycled,
      minutes: inputKind() === "read" ? 3 : 5,
    });
  }

  // Production is the step that proves anything, but it needs material: asking
  // someone to use five words they do not have yet is a blank page, not a task.
  const weakest = collected
    .map((word) => ({ word, strength: wordStrength(word) }))
    .sort((a, b) => a.strength - b.strength)
    .slice(0, 5)
    .map((entry) => entry.word.word);

  if (weakest.length >= 5) {
    steps.push({ kind: "use", words: weakest, minutes: 4 });
  }

  return { steps, due: due.length, collected: collected.length };
}

/** Whether anything at all has been finished today, for the closing line. */
export function doneToday(): number {
  return getTodayCount();
}
