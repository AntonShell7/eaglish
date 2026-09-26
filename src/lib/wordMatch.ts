/**
 * Did the learner actually use the word?
 *
 * Harder than it looks, and the first version — a literal substring search —
 * got three ordinary cases wrong in a row.
 *
 * A dictionary entry is not a string to find. "ghost someone" is a pattern:
 * the "someone" is a slot, and "I ghosted my friend" fills it correctly.
 * Demanding the literal phrase asks the learner to write something no one says.
 *
 * English words inflect. "ghost" appears as ghosted, ghosting, ghosts; "make a
 * decision" appears as "made a decision". A check that only accepts the
 * citation form rejects every natural sentence and accepts only the unnatural
 * one.
 *
 * And a learner cannot always type what the dictionary prints. "café" carries
 * an accent that is not on a Russian or English keyboard layout, and refusing
 * "cafe" punishes someone for the shape of their keyboard rather than for
 * their English.
 *
 * So: fold the accents, drop the slots, allow the endings, and let the pieces
 * sit apart — "look forward to" still matches "I'm really looking forward to
 * it". The check stays generous on purpose. Its job is to catch the case where
 * the word is plainly absent, and when it is unsure the model decides, which
 * it can do far better than a regular expression.
 */

/** Placeholders that stand for whatever the learner puts there. */
const SLOTS = new Set([
  "someone", "somebody", "something", "sb", "sth", "oneself", "one", "one's", "ones",
  "your", "yours", "yourself", "his", "her", "their", "its", "my",
]);

/**
 * Irregular verbs, which no amount of suffix-stripping will reach: "made" and
 * "make" share three letters and no ending. Only the common ones are listed —
 * the long tail is handled by the fallback below, and a dictionary here would
 * be a dictionary to maintain.
 */
const IRREGULAR: Record<string, string> = {
  made: "make", went: "go", gone: "go", said: "say", got: "get", gotten: "get",
  took: "take", taken: "take", came: "come", saw: "see", seen: "see",
  gave: "give", given: "give", found: "find", thought: "think", told: "tell",
  became: "become", left: "leave", felt: "feel", brought: "bring", kept: "keep",
  held: "hold", meant: "mean", met: "meet", paid: "pay", put: "put", ran: "run",
  sat: "sit", spoke: "speak", spoken: "speak", stood: "stand", understood: "understand",
  won: "win", wrote: "write", written: "write", bought: "buy", caught: "catch",
  chose: "choose", chosen: "choose", drove: "drive", fell: "fall", broke: "break",
  broken: "break", built: "build", sent: "send", spent: "spend", lost: "lose",
  led: "lead", heard: "hear", knew: "know", known: "know", grew: "grow",
  drew: "draw", threw: "throw", wore: "wear", woke: "wake", had: "have",
  was: "be", were: "be", been: "be", am: "be", is: "be", are: "be",
};

/** Endings English adds without making a different word. */
const ENDINGS = ["'s", "s", "es", "ed", "d", "ing", "ies", "ied"];

/** Lowercase, strip accents, keep letters, digits and inner apostrophes. */
export function fold(raw: string): string {
  return raw
    .normalize("NFD")
    // Combining marks: é becomes e, ü becomes u. A learner's keyboard should
    // never be the reason an answer is rejected.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’]/g, "'");
}

function tokens(raw: string): string[] {
  return fold(raw)
    .split(/[^a-z0-9']+/)
    .filter(Boolean);
}

/** The part of a token that survives inflection. */
function stem(token: string): string {
  const irregular = IRREGULAR[token];
  if (irregular) return irregular;

  for (const ending of ENDINGS) {
    if (token.length > ending.length + 2 && token.endsWith(ending)) {
      return token.slice(0, token.length - ending.length);
    }
  }
  return token;
}

/** Two tokens are the same word if either one's stem starts the other. */
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  if (sa === sb) return true;
  // Doubled consonant before a suffix: "ghosting" is fine, "stopped" needs it.
  const short = sa.length <= sb.length ? sa : sb;
  const long = sa.length <= sb.length ? sb : sa;
  return short.length >= 3 && long.startsWith(short);
}

/**
 * Whether `text` uses `entry`, where `entry` may be a single word or a phrase
 * with slots. Phrase parts must appear in order, but not next to each other.
 */
export function usesWord(text: string, entry: string): boolean {
  const wanted = tokens(entry).filter((token) => !SLOTS.has(token));
  if (wanted.length === 0) return true;

  const given = tokens(text);
  let from = 0;
  let matched = true;

  for (const part of wanted) {
    const at = given.findIndex((token, i) => i >= from && sameWord(token, part));
    if (at === -1) {
      matched = false;
      break;
    }
    from = at + 1;
  }
  if (matched) return true;

  /*
   * Fallback for phrases: the distinctive part is enough.
   *
   * "make a decision" written as "the decision came easily" has dropped the
   * verb the entry happened to cite, and that is a usage question rather than
   * an absence — exactly the judgement the model is better at than this
   * function. Requiring the longest token keeps "plainly absent" catchable
   * while refusing to argue about the rest.
   */
  if (wanted.length > 1) {
    const distinctive = wanted.reduce((longest, part) => (part.length > longest.length ? part : longest));
    if (distinctive.length >= 4 && given.some((token) => sameWord(token, distinctive))) return true;
  }

  return false;
}
