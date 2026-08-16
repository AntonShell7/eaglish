import type { ReadingText } from "@/data/readingTexts";

export interface WordLookupResult {
  word: string;
  translation: string;
  partOfSpeech?: string;
  isLive: boolean;
  /** True when no translation could be produced — the UI must not let the
      user save an error message into their vocabulary. */
  unavailable?: boolean;
}

export interface SentenceTranslationResult {
  translation: string;
  isLive: boolean;
}

const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Looks up a word in the current text's curated glossary first (accurate,
 * hand-checked, zero cost). Falls back to a live Groq call once
 * VITE_GROQ_API_KEY is set, and finally to an honest "demo mode" message
 * if neither is available.
 */
export async function lookupWord(rawWord: string, sentence: string, text: ReadingText): Promise<WordLookupResult> {
  const word = rawWord.toLowerCase().replace(/[^a-z']/g, "");
  const entry = text.glossary[word];

  if (entry) {
    return { word: rawWord, translation: entry.translation, partOfSpeech: entry.partOfSpeech, isLive: false };
  }

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey) {
    try {
      return await callLiveWordLookup(rawWord, sentence, apiKey);
    } catch (err) {
      console.error("Groq word lookup failed", err);
    }
  }

  return {
    word: rawWord,
    translation: "Перевод недоступен в демо-режиме — подключи бесплатный Groq API.",
    isLive: false,
    unavailable: true,
  };
}

export async function translateSentence(sentenceText: string, text: ReadingText): Promise<SentenceTranslationResult> {
  const known = text.sentences.find((s) => s.text === sentenceText);
  if (known) {
    return { translation: known.translationRu, isLive: false };
  }

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey) {
    try {
      return await callLiveSentenceTranslation(sentenceText, apiKey);
    } catch (err) {
      console.error("Groq sentence translation failed", err);
    }
  }

  return {
    translation: "Перевод предложения недоступен в демо-режиме — подключи бесплатный AI API.",
    isLive: false,
  };
}

async function callLiveWordLookup(word: string, sentence: string, apiKey: string): Promise<WordLookupResult> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Translate a single English word into Russian, using the surrounding sentence for context. Respond with strict JSON only, no markdown: {"translation": string, "partOfSpeech": string}',
        },
        { role: "user", content: `Sentence: "${sentence}"\nWord: "${word}"` },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

  return {
    word,
    translation: parsed.translation ?? "—",
    partOfSpeech: parsed.partOfSpeech,
    isLive: true,
  };
}

async function callLiveSentenceTranslation(sentence: string, apiKey: string): Promise<SentenceTranslationResult> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Translate the given English sentence into natural Russian. Reply with only the translation, no quotes, no extra text.",
        },
        { role: "user", content: sentence },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const translation = data.choices?.[0]?.message?.content?.trim() ?? "—";

  return { translation, isLive: true };
}
