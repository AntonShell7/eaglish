import { getVocabulary, wordStrength, type VocabularyWord } from "./vocabularyStore";
import { getActivations } from "./activation";

/**
 * Sets of words, formed by the app rather than filed by hand.
 *
 * Quizlet makes you build folders and modules because Quizlet has no idea
 * where your words came from — you typed them in, so only you know what they
 * belong to. Here every word already carries the text it was met in and the
 * day it was collected, which is exactly the information a folder would have
 * encoded. Asking someone to re-enter it as filing work would be asking them
 * to do the app's job, and filing is precisely the paperwork this product
 * exists to remove.
 *
 * So the sets appear on their own: one per text or dictation the words came
 * from, one per week of collecting, and one containing everything. They behave
 * like modules — open one, work through it — without anyone having to make one.
 */

export type SetKind = "all" | "source" | "week";

export interface WordSet {
  id: string;
  kind: SetKind;
  title: string;
  words: VocabularyWord[];
  /** How many of them the learner has already used in a sentence. */
  active: number;
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Sets below this are noise in a grid; their words live in the larger ones. */
const MIN_SET = 3;

export function buildSets(): WordSet[] {
  const words = getVocabulary();
  const activations = getActivations();
  const activeIn = (list: VocabularyWord[]) =>
    list.filter((word) => activations[word.word.toLowerCase()]).length;

  if (words.length === 0) return [];

  const sets: WordSet[] = [
    { id: "all", kind: "all", title: "", words, active: activeIn(words) },
  ];

  // By where they were met. This is the grouping that actually means something
  // to a learner: the words from one article hang together in memory, and
  // revisiting them as a group rebuilds the context along with the words.
  const bySource = new Map<string, VocabularyWord[]>();
  for (const word of words) {
    const key = (word.sourceText ?? "").trim();
    if (!key) continue;
    const list = bySource.get(key) ?? [];
    list.push(word);
    bySource.set(key, list);
  }

  for (const [source, list] of bySource) {
    if (list.length < MIN_SET) continue;
    sets.push({
      id: `source:${source}`,
      kind: "source",
      title: source,
      words: list,
      active: activeIn(list),
    });
  }

  // And by week, which catches everything the source grouping leaves loose —
  // words typed in by hand, or met somewhere that left no title.
  const byWeek = new Map<number, VocabularyWord[]>();
  for (const word of words) {
    const weeksAgo = Math.floor((Date.now() - word.addedAt) / WEEK);
    const list = byWeek.get(weeksAgo) ?? [];
    list.push(word);
    byWeek.set(weeksAgo, list);
  }

  for (const [weeksAgo, list] of [...byWeek.entries()].sort((a, b) => a[0] - b[0])) {
    if (list.length < MIN_SET) continue;
    sets.push({
      id: `week:${weeksAgo}`,
      kind: "week",
      title: String(weeksAgo),
      words: list,
      active: activeIn(list),
    });
  }

  return sets;
}

/**
 * The order words come up in.
 *
 * Not a gate. Every word in the set is offered, however recently it was
 * learned — locking a word until it is "ready" is the scheduler's job on the
 * review side and has no business here, where the point is to use the word,
 * not to prove you remember it. This only decides what comes first.
 *
 * Never used outranks everything, because that is the gap this exercise
 * closes. After that: the ones the scheduler thinks are slipping, then the
 * ones longest untouched, then the rest.
 */
export function orderForPractice(words: VocabularyWord[]): VocabularyWord[] {
  const activations = getActivations();
  const now = Date.now();

  return [...words]
    .map((word) => {
      const activation = activations[word.word.toLowerCase()];
      const usedAgo = activation ? now - activation.at : Infinity;
      const strength = wordStrength(word);

      // Higher sorts first.
      const score =
        (activation ? 0 : 1000) +
        (100 - strength) +
        Math.min(200, usedAgo === Infinity ? 0 : usedAgo / (24 * 60 * 60 * 1000)) +
        Math.random() * 8;

      return { word, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.word);
}
