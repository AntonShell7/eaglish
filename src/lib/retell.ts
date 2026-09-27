import { askModel, AiError } from "./aiClient";
import { fold } from "./wordMatch";

/**
 * Retelling what you have just read, in your own words.
 *
 * Answering four questions proves you followed a text. It does not prove you
 * could produce any of it — and producing is the direction that stays broken
 * longest, because every other exercise in a reading app rehearses
 * recognition. A word you have only ever recognised is a word you will not
 * reach for in a conversation.
 *
 * So this is offered, never required: the text is already finished and counted
 * by the time it appears. Something optional that people do because they want
 * to is worth more than something compulsory they learn to click past.
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

export interface RetellFeedback {
  /** One warm, honest sentence about the whole thing, in Russian. */
  summary: string;
  words: WordVerdict[];
  grammar: LanguageNote[];
  /** One way to say something better — style rather than correctness. */
  style: LanguageNote | null;
}

const SYSTEM = [
  "You are a warm, exacting English tutor writing to a Russian-speaking learner.",
  "They have read a text and retold it in their own words, trying to use specific words from it.",
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

export type RetellResult =
  | { ok: true; feedback: RetellFeedback }
  | { ok: false; reason: "unavailable" | "unreadable" };

export async function checkRetelling(
  title: string,
  words: string[],
  retelling: string,
): Promise<RetellResult> {
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
            `Text title: ${title}`,
            `Target words: ${words.join(", ")}`,
            "Learner's retelling:",
            retelling,
          ].join("\n"),
        },
      ],
    });
  } catch (error) {
    if (error instanceof AiError) return { ok: false, reason: "unavailable" };
    throw error;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<RetellFeedback>;
    const verdicts = Array.isArray(parsed.words) ? parsed.words : [];

    /*
     * "Missing" is checked here rather than taken on trust. Models are
     * agreeable: asked whether a learner used a word, they lean towards yes,
     * and a false "good" teaches nothing while a false "missing" is merely
     * annoying. Matching is done on folded text so inflections still count.
     */
    const written = fold(retelling);
    const words_ = words.map((word) => {
      const said = written.includes(fold(word).split(" ")[0]);
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
