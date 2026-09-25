import { getDueWords, getVocabulary } from "./vocabularyStore";
import { getLearnerProfile } from "./learnerProfile";
import { getReadingHistory } from "./readingHistory";
import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { ensureLexicon, normalise, tokenise } from "./lexicon";

/**
 * A few things worth doing, offered rather than assigned.
 *
 * The first attempt at fixing the home screen turned it into a plan: step one,
 * step two, ten minutes, start now. It solved the right problem — five equal
 * doors are a catalogue, not a product — and solved it as a school would, by
 * telling the learner what they are doing today. That is the wrong register for
 * a place people come to in the evening because they feel like it.
 *
 * So the home offers instead. Two or three specific things, each described by
 * what it actually is rather than by how long it takes: this text, about this,
 * with an opening line you can read before deciding. No numbering, no order, no
 * "then". Take one, or take none — the page does not mind, and it is the not
 * minding that makes somewhere worth returning to.
 *
 * The one thing it does quietly is choose well: a text carrying words the
 * learner already half-knows is a better evening than a random one, and they
 * never have to know that is why it is there.
 */

export type SuggestionKind = "review" | "read" | "dictate";

export interface Suggestion {
  kind: SuggestionKind;
  text?: ReadingText;
  /** A line from the text, so the offer can be judged before it is accepted. */
  taste?: string;
  /** How many of the learner's own words this text contains. */
  yours?: number;
  /** Due words, for the review offer. */
  words?: string[];
}

const DAY = 24 * 60 * 60 * 1000;

export async function buildSuggestions(): Promise<Suggestion[]> {
  const due = getDueWords();
  const dueSet = new Set(due.map((word) => normalise(word.word)));
  const out: Suggestion[] = [];

  // Words come first when there are any, but as an offer with a number, not as
  // a debt with a deadline.
  if (due.length > 0) {
    out.push({ kind: "review", words: due.slice(0, 6).map((word) => word.word) });
  }

  const picks = await pickTexts(dueSet, 2);
  if (picks[0]) {
    out.push({
      kind: "read",
      text: picks[0].text,
      taste: picks[0].text.sentences[0]?.text,
      yours: picks[0].yours,
    });
  }
  if (picks[1]) {
    out.push({
      kind: "dictate",
      text: picks[1].text,
      taste: picks[1].text.sentences[0]?.text,
      yours: picks[1].yours,
    });
  }

  return out;
}

/** Best few texts: carrying your words, at your level, not read recently. */
async function pickTexts(dueSet: Set<string>, count: number) {
  await ensureLexicon();

  const band = getLearnerProfile()?.level ?? "A1-A2";
  const recent = new Set(
    getReadingHistory()
      .filter((entry) => Date.now() - entry.openedAt < 14 * DAY)
      .map((entry) => entry.textId),
  );

  const known = new Set(getVocabulary().map((word) => normalise(word.word)));
  const topics = readingTopics.filter((topic) => topic.total > 0);
  const batches = await Promise.all(topics.map((topic) => loadTopicTexts(topic.id)));

  const scored = batches.flat().map((text) => {
    const words = new Set(text.sentences.flatMap((sentence) => tokenise(sentence.text)).map(normalise));
    let recycled = 0;
    let yours = 0;
    for (const word of words) {
      if (dueSet.has(word)) recycled++;
      if (known.has(word)) yours++;
    }
    return {
      text,
      yours,
      score: recycled * 8 + (text.level === band ? 5 : 0) - (recent.has(text.id) ? 7 : 0) + Math.random() * 3,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}
