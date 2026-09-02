import { askModel, AiError } from "./aiClient";
import type { Unavailable } from "./translate";

/**
 * Checking whether a learner can actually *use* their words.
 *
 * Recognising a word, recalling it on a card and using it in a sentence of your
 * own are three different levels of knowing, and only the last one is what
 * people mean when they say they know a word. Everything else in the app builds
 * the first two; this is what tests the third.
 *
 * So the assessment is deliberately not an essay grade. It answers one question
 * per word — did you use it, and does a native speaker recognise that use — and
 * gives back the fix rather than a score. A number would tell the learner
 * nothing they could act on.
 */


export interface WordVerdict {
  word: string;
  /** Did the word appear at all, in any form? */
  used: boolean;
  /** Used in a way a native speaker would accept. */
  correct: boolean;
  /** One sentence: what worked, or exactly what to change. */
  comment: string;
  /** The learner's own sentence, so the verdict has something to point at. */
  quote?: string;
}

export interface UsageReport {
  verdicts: WordVerdict[];
  /** Two or three fixes for the writing itself, beyond the target words. */
  notes: string[];
  /** A rewritten version of the learner's text, kept close to their own. */
  improved?: string;
  unavailable?: Unavailable;
}

/** Cheap local check, so a missing word is never blamed on the model. */
function appears(text: string, word: string): boolean {
  const stem = word.toLowerCase().replace(/[^a-z]/g, "").slice(0, Math.max(4, word.length - 2));
  return stem.length > 0 && text.toLowerCase().includes(stem);
}

export async function checkWordUsage(text: string, targets: string[]): Promise<UsageReport> {
  /** The local-only report, used whenever the model cannot be reached. */
  const offline = (reason: "no-key" | "failed"): UsageReport => ({
    verdicts: targets.map((word) => ({
      word,
      used: appears(text, word),
      correct: false,
      comment: "",
    })),
    notes: [],
    unavailable: reason,
  });

  const prompt = `A learner wrote this text, trying to use specific English words they are learning.

THEIR TEXT:
"""
${text}
"""

TARGET WORDS: ${targets.join(", ")}

For each target word, decide:
- "used": did it appear at all, in any inflected form?
- "correct": is it used the way a native speaker would use it — right meaning, right grammar around it, natural collocation? Judge usage, not spelling of the rest of the text.
- "comment": ONE sentence. If correct, say briefly what made it work. If not, say exactly what to change, with the corrected phrase in quotes. Write the comment in Russian.
- "quote": the learner's own clause containing the word, verbatim, or an empty string.

Then give 2-3 "notes": the most useful fixes for the rest of the text — grammar or naturalness, not style opinions. In Russian, each naming a concrete fix.

Finally "improved": their text rewritten minimally — same content, same length, same voice, with the errors fixed and the target words kept. Do not embellish it.

Return JSON only:
{"verdicts":[{"word":"...","used":true,"correct":true,"comment":"...","quote":"..."}],"notes":["..."],"improved":"..."}`;

  let content: string;
  try {
    content = await askModel({
      temperature: 0.2,
      max_completion_tokens: 2200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a precise, kind English tutor who judges whether specific words were used correctly. You answer with JSON only, and you never inflate a verdict to be encouraging.",
        },
        { role: "user", content: prompt },
      ],
    });
  } catch (err) {
    return offline(err instanceof AiError ? err.reason : "failed");
  }

  try {
    const raw = JSON.parse(content || "{}");

    const verdicts: WordVerdict[] = targets.map((word) => {
      const found = (Array.isArray(raw.verdicts) ? raw.verdicts : []).find(
        (v: { word?: string }) => String(v?.word ?? "").toLowerCase() === word.toLowerCase(),
      );
      // The local check overrides the model on presence: whether a string is in
      // a text is not a question worth trusting a language model with.
      const used = appears(text, word);
      return {
        word,
        used,
        correct: used && Boolean(found?.correct),
        comment: String(found?.comment ?? "").trim(),
        quote: String(found?.quote ?? "").trim() || undefined,
      };
    });

    return {
      verdicts,
      notes: (Array.isArray(raw.notes) ? raw.notes : []).map((n: unknown) => String(n).trim()).filter(Boolean).slice(0, 3),
      improved: String(raw.improved ?? "").trim() || undefined,
    };
  } catch {
    return offline("failed");
  }
}
