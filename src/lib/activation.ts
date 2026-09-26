import { askModel, AiError } from "./aiClient";
import type { VocabularyWord } from "./vocabularyStore";

/**
 * Turning a known word into a usable one.
 *
 * A word you can translate on a card and have never once produced is not yet
 * yours. It sits in recognition memory, where it answers when prompted, and
 * stays silent in the half-second speech actually allows: you know that a
 * marsh is a marsh, and in conversation you say "wet place" because the word
 * never had a path out. Every flashcard app stops at the point where that
 * problem begins.
 *
 * So the exercise is production, one word at a time. Write a sentence with it.
 * Get told whether a native would say that — not whether it is "correct" in the
 * abstract, but whether the word is doing the job you gave it. Two levels of
 * help sit behind a click for the moment nothing comes to mind, and they are
 * ordered so the easier one still demands production: first a Russian sentence
 * to render, which leaves the English entirely to you, and only then a model
 * sentence, which does not.
 *
 * What this measures is different from what the scheduler measures, and it is
 * tracked separately: a word can be firmly held and never once used.
 */

/** What kind of thing went wrong, so the learner can tell one from another. */
export type IssueKind = "grammar" | "tense" | "preposition" | "article" | "wordChoice" | "typo" | "naturalness";

export interface Issue {
  kind: IssueKind;
  /** One sentence in Russian naming the fix. */
  note: string;
}

export interface UsageVerdict {
  /**
   * Whether the target word was used correctly — and nothing else.
   *
   * These were one verdict, and that was wrong. "I just ghosted my friend
   * since she won't insult me" uses "ghost someone" perfectly and has a
   * separate problem with its tenses, and reporting that as "not quite" tells
   * the learner their word was wrong when it was the only part that was right.
   * The two questions are independent and are now answered separately.
   */
  correct: boolean;
  /** One sentence in Russian about the word's use. */
  verdict: string;
  /** The sentence rewritten minimally, when anything needs fixing. */
  fix?: string;
  /** Everything else, each labelled by kind. */
  issues: Issue[];
  /**
   * Other sentences the same word could have made — including its other
   * senses. A word met once in one context gets filed as if it had one
   * meaning, and this is where that quietly gets corrected.
   */
  alternatives: string[];
  unavailable?: "no-key" | "failed";
}

export interface Hint {
  /** A Russian sentence for the learner to render into English. */
  toTranslate?: string;
  /** A model English sentence, shown only when asked for twice. */
  model?: string;
  unavailable?: "no-key" | "failed";
}

function reasonOf(error: unknown): "no-key" | "failed" {
  return error instanceof AiError ? error.reason : "failed";
}

/**
 * Judges one sentence.
 *
 * The prompt is deliberately narrow: the question is whether *this word* is
 * doing its job, not whether the sentence would pass an exam. A learner who
 * gets five corrections for one attempt stops attempting, and the grammar they
 * need is the grammar around the word they are practising.
 */
export async function checkSentence(word: VocabularyWord, sentence: string): Promise<UsageVerdict> {
  const prompt = `A Russian-speaking learner is practising one English word by writing a sentence with it.

WORD: "${word.word}"
ITS MEANING FOR THEM: "${word.translation}"
${word.sentence ? `THEY FIRST MET IT IN: "${word.sentence}"` : ""}

THEIR SENTENCE:
"""
${sentence}
"""

The entry "${word.word}" may be a phrase with a placeholder — "someone", "something", "one's" — which the learner fills in with their own words, and it may appear in any inflected form: ghost → ghosted, make a decision → made the decision. Any of those count as using it. Ignore missing accents: a learner typing "cafe" for "café" has used the word.

Judge one thing above all: is "${word.word}" used the way a native speaker would use it — right sense, right grammar around it, natural collocation? A sentence can be clumsy elsewhere and still use the word correctly; say so when that is the case.

- "correct": true only if the target word itself is used naturally.
- "verdict": ONE sentence in Russian. If correct, say specifically what made it work — the collocation, the preposition, the register. If not, name exactly what is wrong with that word's use and what to say instead.
- "fix": the learner's sentence rewritten with the smallest possible change, or null if nothing needs changing. Keep their idea and their voice.
- "issues": everything wrong with the sentence APART from the target word, at most three. Each is {"kind": one of "grammar" | "tense" | "preposition" | "article" | "wordChoice" | "typo" | "naturalness", "note": one sentence in Russian naming the concrete fix}. A misspelling is "typo". Ignore punctuation entirely, and ignore a lower-case first letter — that is typing, not English. If the sentence is clean, return an empty array.

Crucially: "correct" is about the target word ALONE. A sentence can be full of tense errors and still use the word perfectly, and it must be reported that way.
- "alternatives": two short ENGLISH sentences the learner could also have written with "${word.word}". If the word has a clearly different common sense from the one they used, make one of them show that other sense — meeting a word in one context leaves people believing it has one meaning. Natural, everyday sentences; never repeat theirs.

Never invent praise. Never correct style where the grammar is fine.

Return JSON only:
{"correct": true, "verdict": "...", "fix": null, "issues": [{"kind": "tense", "note": "..."}], "alternatives": ["...", "..."]}`;

  let content: string;
  try {
    content = await askModel({
      temperature: 0.2,
      max_completion_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a precise English tutor judging whether one particular word was used naturally. You answer with JSON only, in Russian where the schema asks for Russian, and you never inflate a verdict to be encouraging.",
        },
        { role: "user", content: prompt },
      ],
    });
  } catch (error) {
    return { correct: false, verdict: "", issues: [], alternatives: [], unavailable: reasonOf(error) };
  }

  try {
    const raw = JSON.parse(content || "{}");
    return {
      correct: Boolean(raw.correct),
      verdict: String(raw.verdict ?? "").trim(),
      fix: raw.fix ? String(raw.fix).trim() : undefined,
      issues: Array.isArray(raw.issues)
        ? raw.issues
            .filter((issue: unknown): issue is Issue => {
              if (typeof issue !== "object" || issue === null) return false;
              const { kind, note } = issue as Record<string, unknown>;
              return typeof kind === "string" && typeof note === "string" && note.trim().length > 0;
            })
            .slice(0, 3)
        : [],
      alternatives: Array.isArray(raw.alternatives)
        ? raw.alternatives.map(String).filter(Boolean).slice(0, 2)
        : [],
    };
  } catch {
    return { correct: false, verdict: "", issues: [], alternatives: [], unavailable: "failed" };
  }
}

/**
 * Help, in two strengths.
 *
 * Both are fetched together because they cost one call instead of two, and the
 * second is simply withheld until asked for — the learner should meet the
 * harder help first, since a Russian sentence to render still makes them build
 * the English themselves.
 */
export async function getHint(word: VocabularyWord): Promise<Hint> {
  const prompt = `A Russian-speaking learner is practising the English word "${word.word}" (for them: "${word.translation}").

Give two kinds of help.

"toTranslate": one short, natural RUSSIAN sentence whose English version would naturally contain "${word.word}". Everyday situation, 6-10 words, nothing literary. Do not include the English word in it.

"model": one short, natural ENGLISH sentence using "${word.word}" correctly — the kind of sentence a person would actually say, not a dictionary example.

Return JSON only: {"toTranslate": "...", "model": "..."}`;

  try {
    const content = await askModel({
      temperature: 0.7,
      max_completion_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You help a learner practise one word. You answer with JSON only." },
        { role: "user", content: prompt },
      ],
    });
    const raw = JSON.parse(content || "{}");
    return {
      toTranslate: raw.toTranslate ? String(raw.toTranslate).trim() : undefined,
      model: raw.model ? String(raw.model).trim() : undefined,
    };
  } catch (error) {
    return { unavailable: reasonOf(error) };
  }
}

/* ── Which words have actually been used ──────────────────────────────── */

const KEY = "activeWords";

export interface Activation {
  /** When the word was first produced correctly. */
  at: number;
  /** The learner's own sentence, kept because it is the best mnemonic there is. */
  sentence: string;
  /** How many times it has been produced correctly. */
  times: number;
}

export function getActivations(): Record<string, Activation> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Activation>) : {};
  } catch {
    return {};
  }
}

export function markActivated(word: string, sentence: string): void {
  const key = word.trim().toLowerCase();
  const all = getActivations();
  const existing = all[key];
  all[key] = {
    at: existing?.at ?? Date.now(),
    // The newest sentence replaces the old one: a learner's later attempt is
    // usually the better example, and one example per word is enough.
    sentence,
    times: (existing?.times ?? 0) + 1,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* losing this costs a badge, never the review schedule */
  }
}

export function isActivated(word: string): boolean {
  return Boolean(getActivations()[word.trim().toLowerCase()]);
}

export function activatedCount(): number {
  return Object.keys(getActivations()).length;
}
