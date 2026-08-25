import { getLearnerProfile } from "./learnerProfile";
import { getVocabulary } from "./vocabularyStore";
import { normalise, rankOf, tokenise } from "./lexicon";

/**
 * What the learner already knows.
 *
 * Without this the app can only guess: it knows a CEFR band and a list of saved
 * words, which says nothing about the thousands of words in between. Three
 * sources are combined, weakest first:
 *
 *   1. a prior from the placement level — a band of frequency ranks the reader is
 *      assumed to hold. A starting estimate, not a claim.
 *   2. explicit marks: "I already know this" in the lookup popup, which is the
 *      single most reliable signal we can get and costs one tap.
 *   3. mastered vocabulary: a saved word that has survived to a three-week
 *      interval has been recalled several times over weeks.
 *
 * Words currently being learned count as *unknown* on purpose — that is the
 * whole point of them being in the queue.
 */

const KNOWN_KEY = "knownWords";
/** Below this interval a word is still being learned, not known. */
const MASTERED_DAYS = 21;

/**
 * Frequency ranks a reader at each level is assumed to hold already.
 *
 * The research counts word *families*; our list counts forms, and a family
 * spans several of them, so the numbers here are deliberately larger than the
 * familiar "2000 words for B1". They were fitted against this library: with
 * these priors a reader lands around 91% coverage on texts of their own level,
 * which is where the labels below are anchored.
 */
const PRIOR_BY_LEVEL: Record<string, number> = {
  "A1-A2": 3500,
  "B1-B2": 6500,
  "C1-C2": 9900,
};

function readExplicit(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeExplicit(words: Set<string>) {
  localStorage.setItem(KNOWN_KEY, JSON.stringify([...words]));
}

export function markKnown(raw: string) {
  const word = normalise(raw);
  if (!word) return;
  const words = readExplicit();
  words.add(word);
  writeExplicit(words);
}

export function unmarkKnown(raw: string) {
  const words = readExplicit();
  words.delete(normalise(raw));
  writeExplicit(words);
}

export function isMarkedKnown(raw: string): boolean {
  return readExplicit().has(normalise(raw));
}

export function priorRank(): number {
  return PRIOR_BY_LEVEL[getLearnerProfile()?.level ?? "A1-A2"] ?? 3500;
}

/**
 * A snapshot for scoring a whole text without re-reading storage per word.
 * Build it once, then ask it about as many words as you like.
 */
export interface KnownModel {
  prior: number;
  explicit: Set<string>;
  mastered: Set<string>;
  learning: Set<string>;
  knows: (word: string) => boolean;
}

export function buildKnownModel(): KnownModel {
  const explicit = readExplicit();
  const vocabulary = getVocabulary();
  const mastered = new Set(
    vocabulary.filter((w) => w.interval >= MASTERED_DAYS).map((w) => normalise(w.word)),
  );
  const learning = new Set(
    vocabulary.filter((w) => w.interval < MASTERED_DAYS).map((w) => normalise(w.word)),
  );
  const prior = priorRank();

  const knows = (raw: string) => {
    const word = normalise(raw);
    if (!word) return true; // punctuation-only token: nothing to know
    if (explicit.has(word) || mastered.has(word)) return true;
    if (learning.has(word)) return false; // in the queue = not yet known
    const rank = rankOf(word);
    return rank !== null && rank <= prior;
  };

  return { prior, explicit, mastered, learning, knows };
}

export interface Coverage {
  /** Share of running words the reader is expected to know, 0..1. */
  known: number;
  total: number;
  /** The unknown words themselves, most frequent first — what to teach. */
  unknown: string[];
}

/**
 * Lexical coverage: the share of running words that fall inside what this reader
 * is assumed to know. Anything outside the ten-thousand-word list counts as
 * unknown, which biases the number downwards on advanced texts — those are
 * exactly the texts full of words no general frequency list carries. The
 * thresholds below absorb that bias; the raw number is still comparable between
 * texts, which is what the ordering needs.
 */
export function coverageOf(sentences: string[], model = buildKnownModel()): Coverage {
  const tokens = sentences.flatMap(tokenise);
  if (tokens.length === 0) return { known: 1, total: 0, unknown: [] };

  const unknown = new Map<string, number>();
  let known = 0;

  for (const token of tokens) {
    if (model.knows(token)) {
      known++;
      continue;
    }
    if (!unknown.has(token)) unknown.set(token, rankOf(token) ?? Number.MAX_SAFE_INTEGER);
  }

  return {
    known: known / tokens.length,
    total: tokens.length,
    unknown: [...unknown.entries()].sort((a, b) => a[1] - b[1]).map(([word]) => word),
  };
}

/** How the reading list labels a text once coverage is known. */
export type Fit = "easy" | "ideal" | "stretch" | "hard";

/**
 * Calibrated against the library rather than against the textbook 95/98 figures,
 * because our measure runs low (see coverageOf). Measured across all 88 texts for
 * a B1–B2 reader, the medians are 96% on A1–A2 material, 92% on their own level
 * and 78% a level above — so these cuts put each of those where it belongs.
 */
export function fitOf(coverage: number): Fit {
  if (coverage >= 0.955) return "easy";
  if (coverage >= 0.88) return "ideal";
  if (coverage >= 0.72) return "stretch";
  return "hard";
}
