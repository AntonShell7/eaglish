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
   * The attempt repeats one the learner already made.
   *
   * Its own state rather than a wrong answer: the word was used correctly, and
   * calling that "not how the word is used" makes exactly the mistake this
   * screen was rebuilt to stop making.
   */
  repeat?: boolean;
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
export async function getHint(word: VocabularyWord, avoid: string[] = []): Promise<Hint> {
  const avoidBlock =
    avoid.length > 0
      ? `\n\nThey have already written these sentences with it, so both your suggestions must point somewhere clearly different — another situation, another sense of the word:\n${avoid.map((line) => `- ${line}`).join("\n")}`
      : "";

  const prompt = `A Russian-speaking learner is practising the English word "${word.word}" (for them: "${word.translation}").${avoidBlock}

Give two kinds of help.

"toTranslate": one short, natural RUSSIAN sentence whose English version would naturally contain "${word.word}". Everyday situation, 6-10 words, nothing literary. Do not include the English word in it.

"model": one short, natural ENGLISH sentence using "${word.word}" correctly — the kind of sentence a person would actually say, not a dictionary example.

Return JSON only: {"toTranslate": "...", "model": "..."}`;

  try {
    const content = await askModel({
      // Warm, because the point of asking again is to get somewhere else.
      temperature: 0.9,
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
  /**
   * Every sentence the learner has built with this word, newest last.
   *
   * Kept in full rather than replaced, for two reasons. Their own sentences are
   * the best mnemonics they will ever have, and one is worth less than four.
   * And the next time the word comes round, these are what the exercise has to
   * beat: writing "I ghosted my friend" a second time rehearses a sentence
   * rather than a word, which is the flashcard trap one level up.
   */
  sentences: string[];
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
  const kept = existing?.sentences ?? [];
  all[key] = {
    at: existing?.at ?? Date.now(),
    // Six is enough to show the range of a word without turning the card into
    // a wall of the learner's own prose.
    sentences: [...kept, sentence].slice(-6),
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

/** What this learner has already written with a word, oldest first. */
export function sentencesFor(word: string): string[] {
  return getActivations()[word.trim().toLowerCase()]?.sentences ?? [];
}

/**
 * Whether a new attempt says something genuinely different.
 *
 * A cheap check, on purpose. Reusing a sentence with one word swapped is the
 * obvious way to game the exercise, and catching it locally costs nothing and
 * answers instantly; anything subtler than that is a judgement, and the model
 * is asked to make it.
 */
export function tooSimilar(attempt: string, previous: string[]): boolean {
  const words = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z\s']/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2),
    );

  const now = words(attempt);
  if (now.size === 0) return false;

  return previous.some((old) => {
    const before = words(old);
    if (before.size === 0) return false;
    let shared = 0;
    for (const token of now) if (before.has(token)) shared++;
    // Four fifths of the content words in common is a rewrite, not a new
    // sentence.
    return shared / Math.max(now.size, before.size) >= 0.8;
  });
}
