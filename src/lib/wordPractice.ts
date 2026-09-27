import { askModel, AiError } from "./aiClient";
import { fold } from "./wordMatch";

/**
 * Putting the new words into sentences of your own.
 *
 * Answering four questions proves a text was followed. It does not prove a
 * word could be produced — and production is the direction that stays broken
 * longest, because everything else here rehearses recognition. A word you have
 * only ever recognised is a word you will not reach for in conversation.
 *
 * It is not a retelling, and asking for one was a mistake: a summary makes the
 * text the subject and the words incidental, so a learner writes around the
 * hard ones. Separate sentences, connected to nothing, put each word at the
 * centre of its own attempt — which is the only thing being practised.
 *
 * Offered, never required: the text is already finished and counted by the
 * time this appears.
 */

export type WordStatus = "good" | "wrong" | "missing";

export interface WordVerdict {
  word: string;
  status: WordStatus;
  /** Why, in Russian — one sentence. */
  note: string;
}

export interface LanguageNote {
  /** The learner's own wording, so they can find it. */
  quote: string;
  fix: string;
  why: string;
}

export interface PracticeFeedback {
  /** One warm, honest sentence about the whole thing, in Russian. */
  summary: string;
  words: WordVerdict[];
  grammar: LanguageNote[];
  /** One way to say something better — style rather than correctness. */
  style: LanguageNote | null;
}

const SYSTEM = [
  "You are a warm, exacting English tutor writing to a Russian-speaking learner.",
  "They have just met some new English words and have written sentences of their own using them.",
  "The sentences do not have to connect to each other or to any text, and they need not be a summary.",
  "Do not ask for a retelling or criticise the sentences for being unrelated.",
  "Judge two things separately and never confuse them:",
  "(1) whether each target word is used correctly and with its real meaning;",
  "(2) whether the English is grammatical.",
  "A word can be used perfectly inside a sentence that has a grammar mistake, and the reverse.",
  "Be specific and brief. Never invent mistakes to seem useful: if something is right, say it is right.",
  "All explanations must be in Russian. The quotes and fixes stay in English.",
  "Reply with JSON only, in this exact shape:",
  '{"summary": string, "words": [{"word": string, "status": "good"|"wrong"|"missing", "note": string}],',
  '"grammar": [{"quote": string, "fix": string, "why": string}], "style": {"quote": string, "fix": string, "why": string} | null}',
  "status is 'good' if the word is used correctly, 'wrong' if used with the wrong sense or form,",
  "'missing' if the learner did not use it at all. Include every target word exactly once.",
  "Keep grammar to the three most useful corrections. Omit it entirely if the English is clean.",
].join(" ");

export type PracticeResult =
  | { ok: true; feedback: PracticeFeedback }
  | { ok: false; reason: "unavailable" | "unreadable" };

export async function checkSentences(
  context: string,
  words: string[],
  written: string,
): Promise<PracticeResult> {
  let raw: string;
  try {
    raw = await askModel({
      temperature: 0.2,
      max_completion_tokens: 1100,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            `Where the words came from: ${context}`,
            `Target words: ${words.join(", ")}`,
            "The learner's sentences:",
            written,
          ].join("\n"),
        },
      ],
    });
  } catch (error) {
    if (error instanceof AiError) return { ok: false, reason: "unavailable" };
    throw error;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PracticeFeedback>;
    const verdicts = Array.isArray(parsed.words) ? parsed.words : [];

    /*
     * "Missing" is checked here rather than taken on trust. Models are
     * agreeable: asked whether a learner used a word, they lean towards yes,
     * and a false "good" teaches nothing while a false "missing" is merely
     * annoying. Matching is done on folded text so inflections still count.
     */
    const folded = fold(written);
    const words_ = words.map((word) => {
      const said = folded.includes(fold(word).split(" ")[0]);
      const found = verdicts.find((v) => fold(v.word) === fold(word));
      if (!said) {
        return { word, status: "missing" as WordStatus, note: found?.note ?? "" };
      }
      return {
        word,
        status: (found?.status === "wrong" ? "wrong" : "good") as WordStatus,
        note: found?.note ?? "",
      };
    });

    return {
      ok: true,
      feedback: {
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        words: words_,
        grammar: Array.isArray(parsed.grammar) ? parsed.grammar.slice(0, 3) : [],
        style: parsed.style && typeof parsed.style === "object" ? (parsed.style as LanguageNote) : null,
      },
    };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}
