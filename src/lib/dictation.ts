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

/**
 * `typo` is a word heard right and typed wrong.
 *
 * It used to be folded into `correct`, on the reasoning that a slipped key is
 * not a listening mistake and the word should not be collected as unknown.
 * That reasoning holds for the vocabulary and fails for the learner, who was
 * told "exactly right" over a sentence containing "sumer" and "insekts" — a
 * dictation that calls a misspelling exact is teaching the misspelling.
 *
 * So it keeps its own name: still not collected as a word to study, still not
 * counted as exact.
 */
export type MarkKind = "correct" | "typo" | "wrong" | "missing" | "extra";

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
      const near = distance(e[i], g[j]) <= 1 && e[i].length >= 5;
      const same = e[i] === g[j];
      marks.push({ kind: same ? "correct" : near ? "typo" : "wrong", expected: exp[i], typed: got[j] });
      // A typo is not a word the learner failed to know, so it stays out of
      // the study list — but it is still shown, and still not exact.
      if (!same && !near) missed.push(exp[i]);
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

/* ── Marking the learner's own line ───────────────────────────────────── */

export interface Segment {
  text: string;
  /**
   * `word` — this word is wrong somewhere; `letters` — these characters are;
   * `gap` — a word was dropped and belongs at this point in the line.
   */
  kind: "ok" | "word" | "letters" | "gap";
}

/**
 * The learner's text, cut into pieces that can be underlined in place.
 *
 * The point is that the answer is never taken away. The text stays in the box
 * exactly as it was typed, and the mistakes are drawn underneath it — so
 * fixing one is editing a word, not re-entering a sentence. Everything else
 * this file does is in service of a verdict; this is in service of a repair.
 *
 * Two depths of mark, because two different things go wrong. A word heard as
 * another word is wrong from end to end and the whole of it is flagged. A word
 * heard correctly and typed badly is wrong in two or three characters, and
 * flagging the whole of it hides the only part worth looking at — so the
 * common beginning and ending are left alone and the middle is marked.
 */
export function segmentTyped(expected: string, typed: string): Segment[] {
  const got = tokenize(typed);
  const out: Segment[] = [];

  // The same alignment the marks use, so the two can never disagree about
  // which typed word was being compared with which spoken one.
  const marks = checkDictation(expected, typed).marks;
  let gi = 0;

  const push = (text: string, kind: Segment["kind"]) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ text, kind });
  };

  for (const mark of marks) {
    /*
     * A dropped word has nothing of itself in the line to mark, and leaving it
     * silent was the worst of the failures here: the verdict said "one
     * mistake" and the line showed none, so the learner was told they were
     * wrong and given no idea where. The gap itself is marked instead — a
     * flagged space at the point the missing word belongs, between the two
     * words it belongs between.
     */
    if (mark.kind === "missing") {
      push("\u00a0", "gap");
      continue;
    }
    const word = got[gi];
    if (word === undefined) break;
    gi += 1;

    if (mark.kind === "correct") {
      push(word, "ok");
    } else if (mark.kind === "typo" && mark.expected) {
      // Keep whatever the two spellings share at each end; mark what is left.
      const a = normalize(mark.expected);
      const b = normalize(word);
      let head = 0;
      while (head < a.length && head < b.length && a[head] === b[head]) head += 1;
      let tail = 0;
      while (
        tail < a.length - head &&
        tail < b.length - head &&
        a[a.length - 1 - tail] === b[b.length - 1 - tail]
      ) {
        tail += 1;
      }
      // Offsets are into the normalised form; map them onto the raw word by
      // counting from each end, which is exact for the only thing that differs
      // between the two — leading and trailing punctuation.
      const lead = word.length - word.replace(/^[^\p{L}\p{N}]+/u, "").length;
      let start = lead + head;
      let end = word.length - tail;

      /*
       * A missing letter has no letters of its own to mark.
       *
       * "summer" typed as "sumer" shares the whole of "sum" at the front and
       * the whole of "er" at the back — between them there is nothing left to
       * underline, and marking the entire word would hide the fact that five
       * of its six characters were right. So the mark lands on the seam: one
       * character at the join, which is where the eye needs to go.
       */
      if (start >= end) {
        start = Math.min(start, word.length - 1);
        end = Math.min(word.length, start + 1);
      }

      if (start < end) {
        push(word.slice(0, start), "ok");
        push(word.slice(start, end), "letters");
        push(word.slice(end), "ok");
      } else {
        push(word, "letters");
      }
    } else {
      push(word, "word");
    }

    push(" ", "ok");
  }

  // Anything typed past the end of the sentence.
  for (; gi < got.length; gi += 1) {
    push(got[gi], "word");
    push(" ", "ok");
  }

  return out;
}
