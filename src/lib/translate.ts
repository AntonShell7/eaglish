import { askModel, AiError, type AiFailure, type AiMessage, type AiRequest } from "./aiClient";

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

/**
 * A word explained in English rather than translated.
 *
 * This is the coursebook move: meeting a definition in the language you are
 * learning keeps you inside it, and the effort of decoding the definition is
 * itself practice. It is not better than a translation for every learner or
 * every word — a beginner staring at an unknown word explained in more unknown
 * words learns nothing — so the app offers both and lets the reader choose.
 */
export interface WordExplanationResult {
  word: string;
  definition: string;
  example: string;
  synonyms?: string[];
  unavailable?: Unavailable;
}

export interface TextTranslationResult {
  translation: string;
  isLive: boolean;
  unavailable?: Unavailable;
}

/** Distinguishes "never configured" from "configured but the call failed". */
export type Unavailable = AiFailure;

/**
 * Every lookup goes through the server endpoint now, so there is no key here to
 * check before calling. The old `if (apiKey())` guards existed to avoid a
 * pointless round trip; `askModel` remembers a missing key after the first
 * 503 and fails instantly thereafter, which does the same job without the
 * provider ever being named in the browser.
 */
async function groq(body: Omit<AiRequest, "messages"> & { messages: AiMessage[] }): Promise<string> {
  return askModel(body);
}

function reasonOf(error: unknown): Unavailable {
  return error instanceof AiError ? error.reason : "failed";
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

  let failure: Unavailable = "failed";

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
    failure = reasonOf(err);
    if (failure === "failed") console.error("[translate] word lookup failed", err);
  }

  return { word: cleaned, translation: "", isLive: false, unavailable: failure };
}

/** English → Russian for a whole sentence or passage. */
export async function translateToRussian(
  text: string,
  options: { known?: string } = {},
): Promise<TextTranslationResult> {
  if (options.known) return { translation: options.known, isLive: false };

  let failure: Unavailable = "failed";

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
    failure = reasonOf(err);
    if (failure === "failed") console.error("[translate] to-Russian failed", err);
  }

  return { translation: "", isLive: false, unavailable: failure };
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
  let failure: Unavailable = "failed";

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
    failure = reasonOf(err);
    if (failure === "failed") console.error("[translate] to-English failed", err);
  }

  return { english: "", note: "", example: "", isLive: false, unavailable: failure };
}

/**
 * Explains a word in simple English, at the level of a learner who is reading
 * above their comfort zone: short definition, one example, a couple of near
 * synonyms if there are any obvious ones.
 */
export async function explainInEnglish(
  rawWord: string,
  options: { sentence?: string } = {},
): Promise<WordExplanationResult> {
  const word = rawWord.trim();
  const context = options.sentence ? `\nIt appears in: "${options.sentence}"` : "";

  try {
    const content = await groq({
      temperature: 0.2,
      max_completion_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a learner's dictionary. You explain English words in plain English, using words simpler than the one being explained, and you answer with JSON only.",
        },
        {
          role: "user",
          content: `Explain the English word or phrase "${word}" for an intermediate learner.${context}

Return JSON: {"definition": "one sentence, plain English, simpler words than the headword", "example": "one natural example sentence using the word", "synonyms": ["at most three close synonyms, or an empty array"]}

Explain the meaning it carries in that sentence, not every meaning it can have. Never use Russian.`,
        },
      ],
    });

    const parsed = JSON.parse(content) as {
      definition?: string;
      example?: string;
      synonyms?: string[];
    };

    const definition = (parsed.definition ?? "").trim();
    if (!definition) return { word, definition: "", example: "", unavailable: "failed" };

    return {
      word,
      definition,
      example: (parsed.example ?? "").trim(),
      synonyms: (parsed.synonyms ?? []).filter(Boolean).slice(0, 3),
    };
  } catch (err) {
    return { word, definition: "", example: "", unavailable: reasonOf(err) };
  }
}

/**
 * Everything the corner translator needs, in one request.
 *
 * Separate from lookupWord because it answers a different question. A reader
 * tapping a word in a text wants *this* word in *this* sentence, and a second
 * sense would be noise. Somebody typing into the translator has no sentence
 * and usually no idea the word has more than one meaning — which is exactly
 * where the damage happens. "date" is дата, and it is also свидание and финик,
 * and a learner given only the first writes a sentence about a calendar when
 * they meant dinner.
 *
 * So: up to three equivalents, the commonest first, plus a definition and a
 * sentence. Both directions return the same shape, because the card that shows
 * it should not have to know which way the learner was going.
 */
export interface TranslatorEntry {
  /** Exactly what was typed. */
  source: string;
  /** The commonest equivalent in the other language. */
  primary: string;
  /** Up to two further senses, distinct rather than near-synonyms. */
  alternatives: string[];
  /** Which side is English, so a saved card gets its two halves the right way. */
  english: string;
  russian: string;
  partOfSpeech?: string;
  /** In English: the coursebook move, kept short. */
  definition?: string;
  /** One natural sentence using it. */
  example?: string;
  unavailable?: Unavailable;
}

export async function translatorEntry(raw: string): Promise<TranslatorEntry> {
  const source = raw.trim();
  const fromRussian = /[Ѐ-ӿ]/.test(source);
  const empty: TranslatorEntry = {
    source,
    primary: "",
    alternatives: [],
    english: "",
    russian: "",
  };

  const brief = fromRussian
    ? "The learner typed Russian and wants the English. Give the commonest English equivalent, then up to two further ones that mean something genuinely different."
    : "The learner typed English and wants the Russian. Give the commonest Russian equivalent, then up to two further senses that mean something genuinely different — not synonyms of the first.";

  try {
    const content = await groq({
      temperature: 0.2,
      max_completion_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are a bilingual dictionary for a Russian speaker learning English.",
            brief,
            "Only list a further sense when the word really has one: most words have a single meaning, and inventing a second is worse than giving one.",
            "definition: a short English definition of the commonest sense, under fifteen words.",
            "example: one natural English sentence using the word in that sense.",
            "partOfSpeech: in English, lowercase.",
            'Reply with strict JSON only: {"primary": string, "alternatives": [string], "definition": string, "example": string, "partOfSpeech": string}',
          ].join(" "),
        },
        { role: "user", content: source },
      ],
    });

    const parsed = JSON.parse(content || "{}") as {
      primary?: string;
      alternatives?: unknown;
      definition?: string;
      example?: string;
      partOfSpeech?: string;
    };

    if (!parsed.primary) return { ...empty, unavailable: "failed" };

    const alternatives = (Array.isArray(parsed.alternatives) ? parsed.alternatives : [])
      .map((item) => String(item).trim())
      .filter((item) => item && item.toLowerCase() !== String(parsed.primary).toLowerCase())
      .slice(0, 2);

    return {
      source,
      primary: parsed.primary,
      alternatives,
      english: fromRussian ? parsed.primary : source,
      russian: fromRussian ? source : parsed.primary,
      partOfSpeech: parsed.partOfSpeech,
      definition: parsed.definition,
      example: parsed.example,
    };
  } catch (err) {
    const failure = reasonOf(err);
    if (failure === "failed") console.error("[translate] translator entry failed", err);
    return { ...empty, unavailable: failure };
  }
}
