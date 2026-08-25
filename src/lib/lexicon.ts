/**
 * Word frequency, and what it buys us.
 *
 * Two facts drive everything here. First, a small number of very common words
 * carries most of any English text — so an unknown word from the first few
 * thousand is worth learning, and a rare one usually isn't. Second, a text is
 * comprehensible when the reader already knows roughly 95–98% of its running
 * words; below that, reading turns into decoding and the context stops teaching
 * anything.
 *
 * So the app needs to know, for any word, how common it is — and for any text,
 * what share of it the reader already knows. That is what this module provides.
 *
 * The list is the top 5000 of the Google Trillion Word Corpus ranking
 * (first20hours/google-10000-english, MIT), cleaned of markup and domain noise.
 * It is loaded on demand: a reader who never opens the library never pays for it.
 */

export type FrequencyBand = 1 | 2 | 3 | 5 | 0;

let ranks: Map<string, number> | null = null;
let loading: Promise<void> | null = null;

/** Loads the list once. Safe to call from anywhere, including render effects. */
export function ensureLexicon(): Promise<void> {
  if (ranks) return Promise.resolve();
  if (!loading) {
    loading = import("@/data/frequency.json").then((module) => {
      const words = (module.default ?? []) as string[];
      ranks = new Map(words.map((word, index) => [word, index + 1]));
    });
  }
  return loading;
}

export function lexiconReady(): boolean {
  return ranks !== null;
}

/** Strips punctuation and case; keeps internal apostrophes out of the way. */
export function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z]/g, "");
}

/**
 * Candidate base forms, cheapest first.
 *
 * A real lemmatiser is a dependency and a download; for deciding "is this word
 * roughly known", undoing the four regular English endings gets almost all of
 * the value. Nothing here has to be right every time — a missed lemma only
 * makes the coverage estimate slightly pessimistic.
 */
function baseForms(word: string): string[] {
  const forms = [word];
  const push = (form: string) => form.length >= 2 && forms.push(form);

  if (word.endsWith("ies")) push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es")) push(word.slice(0, -2));
  if (word.endsWith("s")) push(word.slice(0, -1));
  if (word.endsWith("ed")) {
    push(word.slice(0, -2));
    push(word.slice(0, -1));
    if (/([bdfglmnprt])\1ed$/.test(word)) push(word.slice(0, -3));
  }
  if (word.endsWith("ing")) {
    push(word.slice(0, -3));
    push(`${word.slice(0, -3)}e`);
    if (/([bdgklmnprt])\1ing$/.test(word)) push(word.slice(0, -4));
  }
  if (word.endsWith("ly")) push(word.slice(0, -2));
  if (word.endsWith("er")) push(word.slice(0, -2));
  if (word.endsWith("est")) push(word.slice(0, -3));

  return forms;
}

/**
 * Position in the frequency list, or null for anything outside the top 5000.
 *
 * The *best* rank across the word family wins, not the first one found: this
 * list ranks inflected forms separately, so "readers" sits at 2250 while
 * "reader" sits at 1582. Someone who knows the base form knows the plural, and
 * scoring the plural as rarer than it is was making every text look harder than
 * it is.
 */
export function rankOf(raw: string): number | null {
  if (!ranks) return null;
  const word = normalise(raw);
  if (!word) return null;

  let best: number | null = null;
  for (const form of baseForms(word)) {
    const rank = ranks.get(form);
    if (rank && (best === null || rank < best)) best = rank;
  }
  return best;
}

/** Coarse band, for telling a learner why a word is (or isn't) worth saving. */
export function bandOf(raw: string): FrequencyBand {
  const rank = rankOf(raw);
  if (rank === null) return 0;
  if (rank <= 1000) return 1;
  if (rank <= 2000) return 2;
  if (rank <= 3000) return 3;
  return 5;
}

/** Splits running text into word tokens, dropping numbers and punctuation. */
export function tokenise(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalise)
    .filter((word) => word.length > 0);
}
