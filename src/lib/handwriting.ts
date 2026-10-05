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

/**
 * The model that looks at the picture.
 *
 * OpenAI's, because Groq has no model with eyes — that is the whole reason the
 * endpoint carries two providers. The small one is deliberate: this is reading
 * a word written on a strip of canvas, not interpreting a document, and the
 * larger model costs several times more to do the same job no better.
 */
const MODEL = "gpt-4o-mini";

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
      max_completion_tokens: 40,
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

/**
 * Reads handwriting without judging it.
 *
 * The single-word drill above compares against a word it already knows. A
 * written sentence has nothing to compare against — the whole point is that
 * the learner made it up — so this returns the transcription and stops there.
 *
 * What happens next is the part that makes handwritten sentences workable at
 * all: the learner is shown what was read and confirms or corrects it before
 * anything is graded. Without that step a single misread word has the model
 * critiquing a sentence nobody wrote, and wrong feedback is worse than none —
 * the learner either stops trusting the app or "fixes" something that was
 * already right. With it, a misreading costs one tap.
 */
export async function transcribeHandwriting(image: string): Promise<string | null> {
  try {
    const raw = await askModel({
      model: MODEL,
      temperature: 0,
      max_completion_tokens: 120,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "You are an OCR engine for English handwriting. The image shows one handwritten " +
                "English sentence on ruled paper. Reply with exactly that sentence and nothing " +
                "else: no quotes, no commentary, no correction. Transcribe what is written, " +
                "including any spelling mistakes — do not fix them. If nothing is legible, reply " +
                "with exactly: ???",
            },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    });
    const text = raw.trim().replace(/^["']|["']$/g, "");
    return !text || text === "???" ? null : text;
  } catch (error) {
    if (error instanceof AiError) return null;
    throw error;
  }
}
