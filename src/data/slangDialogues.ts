import type { Cefr } from "@/lib/textLevel";
import { batch1 } from "./slang/batch1";
import { batch2 } from "./slang/batch2";

/**
 * Slang, as it is actually met.
 *
 * A phrasebook teaches "break the ice" and the learner still does not
 * understand the sentence it turns up in, because the difficulty was never the
 * phrase — it was the speed, the ellipsis, the four other idioms around it and
 * the fact that nobody announces an idiom before using one. So the unit here
 * is a conversation, not a card: two people talking the way people talk, with
 * the expressions buried in it where they belong.
 *
 * What the module is really teaching is the gap between what an expression
 * looks like it means and what it means. That gap is the whole subject, so it
 * is a field on every entry rather than a note at the bottom.
 *
 * Every dialogue here is written for this app. Film and video transcripts are
 * the obvious source and the one we cannot use: they belong to whoever made
 * them, and a language app built on lifted subtitles is a lawsuit with a
 * landing page.
 */

/**
 * What kind of thing this is. Learners treat these as one undifferentiated
 * mass of "stuff natives say", and they behave differently: slang dates and
 * can embarrass you, idioms are stable and safe, a phrasal verb is grammar
 * wearing a disguise.
 */
export type Kind =
  /** Current, informal, and it will age — say it to friends. */
  | "slang"
  /** Fixed and durable. Nobody sounds young or old for using one. */
  | "idiom"
  /** Verb plus particle, where the particle rewrites the verb entirely. */
  | "phrasal"
  /** One word, several unrelated meanings — the trap that survives fluency. */
  | "multi"
  /** How people actually open and close a conversation. */
  | "greeting"
  /** A sharper word for something the learner already says a duller way. */
  | "synonym";

/** How formal it is — which decides what room you can say it in. */
export type Register = "neutral" | "casual" | "veryCasual";

export interface Expression {
  phrase: string;
  kind: Kind;
  /** The meaning in English; the learner should meet the idea in English. */
  meaning: string;
  /** The Russian bridge, for when the definition alone does not land. */
  ru: string;
  /**
   * What the words appear to say on their own.
   *
   * This is the field the module exists for. A learner who reads "he's on the
   * fence" as a man standing on a fence has not made a vocabulary mistake —
   * they have made the only reasonable inference from the words, and naming
   * that wrong reading is what makes the right one stick.
   */
  trap?: string;
  register: Register;
  /** For `multi`: the other meanings this word carries elsewhere. */
  senses?: string[];
}

export interface Line {
  /** Which of the two speakers. */
  who: 0 | 1;
  /**
   * The line, with expressions marked as `[[what is written|the entry]]`.
   * Marking them by hand rather than matching text is the only way that
   * survives inflection: "ghosted me" has to point at "ghost someone".
   */
  text: string;
}

/**
 * A comprehension check, always on a *new* sentence.
 *
 * Asking about the dialogue's own line tests memory of the last thirty
 * seconds. The question worth asking is whether the expression is recognised
 * somewhere it has not been seen, which is the only thing that will happen in
 * real life.
 */
export interface Check {
  /** The new sentence, in English. */
  text: string;
  /** What is being asked, in Russian. */
  question: string;
  options: string[];
  answer: number;
  /** Why, in Russian — shown after the answer, right or wrong. */
  why: string;
}

export interface Dialogue {
  id: string;
  title: string;
  titleRu: string;
  level: Cefr;
  /** Who these two are to each other, and where this is happening. */
  scene: string;
  sceneRu: string;
  cast: [string, string];
  lines: Line[];
  expressions: Expression[];
  checks: Check[];
}

export const slangDialogues: Dialogue[] = [...batch1, ...batch2];

/** Every expression in the module, for counting and for search. */
export function allExpressions(): Expression[] {
  return slangDialogues.flatMap((d) => d.expressions);
}

/** Splits a marked line into plain text and expression references. */
export type Piece = { text: string; ref?: string };

export function parseLine(text: string): Piece[] {
  const out: Piece[] = [];
  const pattern = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push({ text: text.slice(last, match.index) });
    out.push({ text: match[1], ref: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
