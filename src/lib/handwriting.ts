import { askModel, AiError } from "./aiClient";
import { fold } from "./wordMatch";

/**
 * Reading a word written by hand.
 *
 * The point of writing a word rather than typing it is that the hand has to
 * produce the whole shape from memory — no keyboard to autocomplete it, no
 * spelling that arrives one plausible key at a time. That is a harder and more
 * honest recall test than typing, and on a tablet with a stylus it is also the
 * most pleasant way to review anything.
 *
 * The model is asked to transcribe, never to judge. If it were asked "is this
 * the word 'brittle'?" it would agree far too readily — it has been told the
 * answer, and it will read the answer into almost any scribble. So it gets the
 * picture and nothing else, and the comparison happens here, in code the
 * learner can trust to be strict.
 */

/** Groq's vision model. The only one the endpoint will bill for pictures. */
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const PROMPT =
  "You are an OCR engine for English handwriting. The image shows a single " +
  "handwritten English word on ruled paper. Reply with that word and nothing " +
  "else: no punctuation, no quotes, no explanation. If the writing is empty or " +
  "genuinely illegible, reply with exactly: ???";

export type Reading =
  /** The transcription matches the word being practised. */
  | { verdict: "match"; read: string }
  /** Legible, but a different word — usually a spelling slip. */
  | { verdict: "different"; read: string }
  /** Nothing readable on the canvas. */
  | { verdict: "unreadable" }
  /** The model could not be reached, or is not configured. */
  | { verdict: "unavailable" };

/**
 * Transcribes the canvas and compares it with the expected word.
 *
 * Case and accents are folded away, because handwriting rarely marks either
 * and a learner writing "cafe" for "café" has not made a vocabulary mistake.
 * Everything else must match letter for letter: this is a spelling test, and
 * accepting near misses would quietly teach the near miss.
 */
export async function readHandwriting(image: string, expected: string): Promise<Reading> {
  let raw: string;
  try {
    raw = await askModel({
      model: MODEL,
      temperature: 0,
      max_completion_tokens: 20,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof AiError) return { verdict: "unavailable" };
    throw error;
  }

  // Models add stray punctuation and the occasional "The word is" however
  // firmly they are told not to; the last word of the reply is the answer.
  const cleaned = raw.replace(/["'.,!?]/g, " ").trim();
  if (!cleaned || cleaned.includes("?")) return { verdict: "unreadable" };

  const read = cleaned.split(/\s+/).pop() ?? "";
  if (!read) return { verdict: "unreadable" };

  return fold(read) === fold(expected) ? { verdict: "match", read } : { verdict: "different", read };
}
