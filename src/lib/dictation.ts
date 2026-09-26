/**
 * Dictation: comparing what you heard with what was said.
 *
 * The exercise itself is old and well-proven — listen, write it down, check.
 * What the apps built on it all stop short of is the part that follows. A
 * learner meets a word they do not know, cannot spell it (they only heard it),
 * cannot look it up, and so copies it into a notebook to deal with later. The
 * practice and the remembering end up in different places, and the notebook is
 * where most of it dies.
 *
 * Here the check itself is the collector. Every word you missed is a word you
 * demonstrably do not hold yet, together with the sentence you met it in — the
 * exact thing the vocabulary wants. So the mistakes become the study list
 * without anyone writing anything down.
 */

export type MarkKind = "correct" | "wrong" | "missing" | "extra";

export interface Mark {
  kind: MarkKind;
  /** What the speaker actually said, for correct/wrong/missing. */
  expected?: string;
  /** What the learner typed, for correct/wrong/extra. */
  typed?: string;
}

export interface DictationResult {
  marks: Mark[];
  /** Share of the sentence's words got right, 0..1. */
  accuracy: number;
  /** Words worth offering to the vocabulary: missed or badly mistyped. */
  missed: string[];
}

/** Compared without case or punctuation: this tests hearing, not typing. */
export function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\-]/g, "");
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Edit distance capped at 2 — past that, it is a different word, not a typo. */
function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Aligns the two sentences before comparing them.
 *
 * Comparing position by position would be useless: one missed article shifts
 * everything after it and reports a whole sentence wrong. A longest-common-
 * subsequence alignment finds which words genuinely correspond, so a single
 * dropped word is reported as a single dropped word.
 */
export function checkDictation(expected: string, typed: string): DictationResult {
  const exp = tokenize(expected);
  const got = tokenize(typed);
  const e = exp.map(normalize);
  const g = got.map(normalize);

  // Classic LCS table over the normalised tokens.
  const n = e.length;
  const m = g.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = e[i] === g[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const marks: Mark[] = [];
  const missed: string[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (e[i] === g[j]) {
      marks.push({ kind: "correct", expected: exp[i], typed: got[j] });
      i++;
      j++;
      continue;
    }

    // A word that aligns with nothing on either side is a substitution rather
    // than an insertion plus a deletion — and if it is within a character or
    // two it was heard correctly and typed badly, which is not a listening
    // mistake and should not be collected as an unknown word.
    if (lcs[i + 1][j + 1] >= lcs[i + 1][j] && lcs[i + 1][j + 1] >= lcs[i][j + 1]) {
      // Five letters, not four: "than" heard as "then" is exactly the kind of
      // minimal pair this exercise exists to catch, and forgiving it as a
      // typo would hide the mistake worth seeing.
      const typo = distance(e[i], g[j]) <= 1 && e[i].length >= 5;
      marks.push({ kind: typo ? "correct" : "wrong", expected: exp[i], typed: got[j] });
      if (!typo) missed.push(exp[i]);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      marks.push({ kind: "missing", expected: exp[i] });
      missed.push(exp[i]);
      i++;
    } else {
      marks.push({ kind: "extra", typed: got[j] });
      j++;
    }
  }

  while (i < n) {
    marks.push({ kind: "missing", expected: exp[i] });
    missed.push(exp[i]);
    i++;
  }
  while (j < m) {
    marks.push({ kind: "extra", typed: got[j] });
    j++;
  }

  const right = marks.filter((mark) => mark.kind === "correct").length;

  return {
    marks,
    accuracy: n === 0 ? 0 : right / n,
    missed: dedupe(missed),
  };
}

/**
 * Which missed words are worth offering to the vocabulary.
 *
 * Function words are dropped: missing "the" is a listening slip, not a gap in
 * anyone's vocabulary, and a review queue full of articles teaches nothing
 * while making the queue feel like punishment.
 */
const FUNCTION_WORDS = new Set([
  "a","an","the","and","or","but","if","of","to","in","on","at","by","for","with","from","as","is","are","was",
  "were","be","been","am","do","does","did","have","has","had","will","would","can","could","should","may",
  "might","must","i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","its",
  "our","their","this","that","these","those","there","here","not","no","so","too","very","just","then","than",
]);

export function worthLearning(words: string[]): string[] {
  return dedupe(words.filter((word) => {
    const key = normalize(word);
    return key.length > 2 && !FUNCTION_WORDS.has(key);
  }));
}

/** The sentence's punctuation belongs to the sentence, not to the word. */
function bare(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}']+$/gu, "");
}

function dedupe(words: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of words) {
    const word = bare(raw);
    const key = normalize(word);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(word);
  }
  return out;
}


/* ── The skeleton ───────────────────────────────────────────────────────── */

export interface MaskedWord {
  /** The word as it should be, when the learner got it. */
  text: string;
  /** Otherwise its shape: one dot per letter. */
  mask?: string;
}

/**
 * What to show after a wrong attempt.
 *
 * "Incorrect" is a verdict with no information in it: the learner knows they
 * were wrong, and knowing nothing else they either guess again blindly or give
 * up and reveal. Showing the words they did get, in place, with the rest
 * reduced to their letter counts, turns the same failure into a clue — you can
 * see it was one short word you missed, and where.
 *
 * The answer itself is still one click away. This is what sits between trying
 * and surrendering, and most of the learning happens there.
 */
export function maskAgainst(expected: string, typed: string): MaskedWord[] {
  const result = checkDictation(expected, typed);
  const out: MaskedWord[] = [];

  for (const mark of result.marks) {
    if (mark.kind === "extra") continue;
    const word = mark.expected ?? "";
    if (!word) continue;

    if (mark.kind === "correct") {
      out.push({ text: word });
    } else {
      // Punctuation stays visible: it is part of the shape, and hiding a comma
      // teaches nothing.
      out.push({
        text: word,
        mask: word.replace(/[\p{L}\p{N}]/gu, "·"),
      });
    }
  }

  return out;
}
