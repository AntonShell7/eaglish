import { askModel, AiError } from "./aiClient";

/**
 * Reading a sentence written by hand.
 *
 * The model is asked to transcribe, never to judge. If it were told what the
 * sentence was supposed to be it would agree far too readily — it reads the
 * expected answer into almost any scribble — so it gets the picture and
 * nothing else, and everything downstream treats the result as a draft the
 * learner still has to confirm.
 *
 * This used to have a second job: reading a single word off the vocabulary
 * card and deciding whether it matched. That is gone, and the reason is worth
 * recording so it does not come back. A person writing a word by hand lifts
 * the pen between letters, and that pause cannot be told apart from the pause
 * at the end — so the card began reading after the first letter and the rest
 * of the word had nowhere to go. No timeout fixes it: lengthen it and a slow
 * writer is still cut off, shorten it and everybody is. The card shows the
 * answer and lets the learner compare, which is what they were going to do
 * anyway, and costs nothing.
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
