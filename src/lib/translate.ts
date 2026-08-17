export interface GlossaryLike {
  [word: string]: { translation: string; partOfSpeech?: string };
}

export interface WordLookupResult {
  word: string;
  translation: string;
  partOfSpeech?: string;
  /** Came from a live model rather than a curated glossary. */
  isLive: boolean;
  /**
   * No translation could be produced. The UI shows its own message and must
   * not let the user save an error string into their vocabulary.
   */
  unavailable?: Unavailable;
}

export interface TextTranslationResult {
  translation: string;
  isLive: boolean;
  unavailable?: Unavailable;
}

/**
 * Providers retire models without warning — llama-3.3-70b vanished from Groq's
 * catalogue mid-project and every call started 404ing while the UI quietly
 * showed its offline fallback. Keeping the name in an env var means the next
 * retirement is a config change, not a code hunt.
 */
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-120b";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** Distinguishes "never configured" from "configured but the call failed". */
export type Unavailable = "no-key" | "failed";

function apiKey(): string | undefined {
  return import.meta.env.VITE_GROQ_API_KEY;
}

async function groq(body: Record<string, unknown>): Promise<string> {
  const key = apiKey();
  if (!key) throw new Error("no api key");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: GROQ_MODEL, ...body }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Look up an English word or short phrase.
 *
 * A curated glossary is checked first when one is supplied — those entries are
 * hand-checked and cost nothing, which matters because the popup fires on
 * almost every unfamiliar word. Only misses reach the model.
 */
export async function lookupWord(
  rawWord: string,
  options: { sentence?: string; glossary?: GlossaryLike } = {},
): Promise<WordLookupResult> {
  const cleaned = rawWord.trim();
  const key = cleaned.toLowerCase().replace(/[^a-z'\s-]/g, "");

  const entry = options.glossary?.[key];
  if (entry) {
    return { word: cleaned, translation: entry.translation, partOfSpeech: entry.partOfSpeech, isLive: false };
  }

  if (apiKey()) {
    try {
      const raw = await groq({
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Translate an English word or short phrase into Russian. Use the surrounding sentence for context when given. Respond with strict JSON only, no markdown: {"translation": string, "partOfSpeech": string}',
          },
          {
            role: "user",
            content: options.sentence
              ? `Sentence: "${options.sentence}"\nWord: "${cleaned}"`
              : `Word: "${cleaned}"`,
          },
        ],
      });
      const parsed = JSON.parse(raw || "{}");
      if (parsed.translation) {
        return { word: cleaned, translation: parsed.translation, partOfSpeech: parsed.partOfSpeech, isLive: true };
      }
    } catch (err) {
      console.error("[translate] word lookup failed", err);
    }
  }

  return { word: cleaned, translation: "", isLive: false, unavailable: apiKey() ? "failed" : "no-key" };
}

/** English → Russian for a whole sentence or passage. */
export async function translateToRussian(
  text: string,
  options: { known?: string } = {},
): Promise<TextTranslationResult> {
  if (options.known) return { translation: options.known, isLive: false };

  if (apiKey()) {
    try {
      const out = await groq({
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Translate the given English text into natural Russian. Reply with only the translation — no quotes, no commentary.",
          },
          { role: "user", content: text },
        ],
      });
      if (out) return { translation: out, isLive: true };
    } catch (err) {
      console.error("[translate] to-Russian failed", err);
    }
  }

  return { translation: "", isLive: false, unavailable: apiKey() ? "failed" : "no-key" };
}

/**
 * Russian → English. This is the direction a writer needs mid-sentence: they
 * know the idea in their own language and are missing the English for it.
 * Returns the word plus a usage note, so the learner sees how it behaves rather
 * than just a dictionary equivalent.
 */
export async function translateToEnglish(
  phrase: string,
): Promise<{ english: string; note: string; example: string; isLive: boolean; unavailable?: Unavailable }> {
  if (apiKey()) {
    try {
      const raw = await groq({
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You help a Russian-speaking learner find the English they need while writing. Given a Russian word or phrase, reply with strict JSON only, no markdown: {"english": string, "note": string, "example": string}. "english" is the most natural English equivalent. "note" is one short sentence in Russian about register or usage (formal/informal, common collocations). "example" is one short sentence IN ENGLISH that uses the "english" value. Never write the example in Russian.',
          },
          { role: "user", content: phrase },
        ],
      });
      const parsed = JSON.parse(raw || "{}");
      if (parsed.english) {
        return {
          english: parsed.english,
          note: parsed.note ?? "",
          example: parsed.example ?? "",
          isLive: true,
        };
      }
    } catch (err) {
      console.error("[translate] to-English failed", err);
    }
  }

  return { english: "", note: "", example: "", isLive: false, unavailable: apiKey() ? "failed" : "no-key" };
}
