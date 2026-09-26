import { rankOf, tokenise } from "./lexicon";

/**
 * A text's CEFR level, measured rather than declared.
 *
 * The library labels texts in three bands — A1-A2, B1-B2, C1-C2 — because that
 * is what the generator was asked for. A learner picking material wants the six
 * real levels, and the difference between A1 and A2 is not decorative: it is
 * the difference between a text you can read and one you bounce off.
 *
 * Relabelling by hand would be guessing. These two numbers are not:
 *
 *  - how rare the text's vocabulary is, taken at the 90th percentile rather
 *    than the mean, because difficulty is set by the hard words rather than by
 *    the many easy ones around them;
 *  - how long its sentences run, which is the usual stand-in for grammatical
 *    load and correlates with it well enough to be worth counting.
 *
 * The published band still wins as the outer bound — the generator wrote to it
 * deliberately — and this only decides which half of that band a text falls in.
 * A measurement that can only refine a human decision cannot contradict one.
 */

export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_ORDER: Cefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export type Band = "A1-A2" | "B1-B2" | "C1-C2";

const HALVES: Record<Band, [Cefr, Cefr]> = {
  "A1-A2": ["A1", "A2"],
  "B1-B2": ["B1", "B2"],
  "C1-C2": ["C1", "C2"],
};

/*
 * The split points are the library's own medians, measured across all 88 texts
 * rather than guessed. The first attempt guessed, at roughly a third of the
 * real values, and put every single text in the harder half — a six-level shelf
 * with three empty levels, which is worse than three honest bands because it
 * claims a precision it does not have.
 *
 * Because they are medians, each band divides roughly in half, and the claim
 * stays modest and true: this is the easier or the harder half of a band a
 * human already chose.
 */
const RANK_SPLIT: Record<Band, number> = {
  "A1-A2": 2950,
  "B1-B2": 5100,
  // At C level the rank signal saturates: most of these texts carry words past
  // the end of the frequency list, so their 90th percentile pins to the
  // unknown-word value and stops distinguishing anything. Setting the split at
  // that pinned value neutralises the term, leaving sentence length — which
  // still varies there — to decide.
  "C1-C2": 12000,
};

const LENGTH_SPLIT: Record<Band, number> = {
  "A1-A2": 7.5,
  "B1-B2": 15,
  "C1-C2": 17,
};

export interface TextDifficulty {
  level: Cefr;
  /** 90th-percentile frequency rank of the text's words. */
  rank: number;
  /** Mean words per sentence. */
  sentenceLength: number;
}

/** Whether a label is already one of the six levels rather than a band. */
export function isCefr(value: string): value is Cefr {
  return (CEFR_ORDER as string[]).includes(value);
}

/**
 * Texts written for listening carry an exact level, because a person chose it
 * while writing. Only the generated library labels a band and needs measuring,
 * and a measurement has no business overruling a decision.
 */
export function levelOf(label: string, sentences: { text: string }[]): Cefr {
  if (isCefr(label)) return label;
  return measureLevel(label as Band, sentences).level;
}

export function measureLevel(band: Band, sentences: { text: string }[]): TextDifficulty {
  // A label outside the three known bands would otherwise destructure to
  // undefined and take the whole shelf down with it.
  if (!HALVES[band]) {
    return { level: "B1", rank: 0, sentenceLength: 0 };
  }

  const ranks: number[] = [];
  let words = 0;

  for (const sentence of sentences) {
    const tokens = tokenise(sentence.text);
    words += tokens.length;
    for (const token of tokens) {
      // An unknown word is rarer than anything in the list, not missing data:
      // treating it as absent would make an exotic text look easy.
      ranks.push(rankOf(token) ?? 12000);
    }
  }

  const sentenceLength = sentences.length === 0 ? 0 : words / sentences.length;

  ranks.sort((a, b) => a - b);
  const rank = ranks.length === 0 ? 0 : ranks[Math.min(ranks.length - 1, Math.floor(ranks.length * 0.9))];

  const [lower, upper] = HALVES[band];
  // The two signals are averaged rather than or-ed. Either one alone crossing
  // its median would send three quarters of the shelf into the harder half,
  // and a text of rare words in short sentences is not obviously harder than
  // one of common words in long winding ones — they trade off.
  const score = 0.5 * (rank / RANK_SPLIT[band]) + 0.5 * (sentenceLength / LENGTH_SPLIT[band]);
  const harder = score >= 1;

  return { level: harder ? upper : lower, rank, sentenceLength };
}

