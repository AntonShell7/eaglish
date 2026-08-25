import type { ReadingText } from "@/data/readingTexts";
import type { ReadingLevel } from "./placement";
import type { Unavailable } from "./translate";
import { getVocabulary } from "./vocabularyStore";
import { normalise } from "./lexicon";

/**
 * Texts written around the words you are currently learning.
 *
 * This is the half of the loop a library alone cannot provide. Spaced repetition
 * brings a word back on a card; what it cannot do is put the word back in front
 * of you *in use*, which is where meaning actually settles. A fixed library can
 * only do that by accident — the right word has to happen to appear in the text
 * you happen to open.
 *
 * So the app writes the text instead: same level, a topic you chose, and your
 * own learning words woven through it, each appearing more than once because a
 * single encounter teaches almost nothing.
 *
 * The result is stored like any other text, so it can be reread, and its words
 * looked up and reviewed exactly as before.
 */

const STORAGE_KEY = "personalTexts";
const KEEP = 12;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-120b";
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/** Enough words to build a text around, few enough to appear naturally. */
export const TARGET_WORDS = 6;

export interface PersonalText extends ReadingText {
  /** The learning words this text was built around. */
  targets: string[];
  createdAt: number;
}

export function getPersonalTexts(): PersonalText[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersonalText[]) : [];
  } catch {
    return [];
  }
}

function store(text: PersonalText) {
  const all = [text, ...getPersonalTexts()].slice(0, KEEP);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deletePersonalText(id: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersonalTexts().filter((t) => t.id !== id)));
}

/**
 * Which words to build the next text around.
 *
 * Due words first — a text is a better review than a card — then the newest
 * saves, which are the ones still fragile enough to need the encounter.
 */
export function pickTargets(limit = TARGET_WORDS): string[] {
  const now = Date.now();
  const vocabulary = getVocabulary();
  const due = vocabulary.filter((w) => w.dueAt <= now);
  const rest = vocabulary.filter((w) => w.dueAt > now);

  const chosen: string[] = [];
  for (const word of [...due, ...rest]) {
    const key = normalise(word.word);
    if (!key || chosen.some((w) => normalise(w) === key)) continue;
    chosen.push(word.word);
    if (chosen.length >= limit) break;
  }
  return chosen;
}

const LEVEL_BRIEF: Record<ReadingLevel, string> = {
  "A1-A2": "Very simple English: present and past simple, short sentences, the most common words. 180 to 260 words.",
  "B1-B2":
    "Everyday and semi-formal English: mixed tenses, linking words, some phrasal verbs, varied sentence length. 280 to 400 words.",
  "C1-C2":
    "Advanced English: argument rather than description, precise collocation, hedging, some abstract nouns. Dense but readable. 350 to 480 words.",
};

export interface PersonalTextOptions {
  level: ReadingLevel;
  topic: string;
  targets: string[];
}

function buildPrompt({ level, topic, targets }: PersonalTextOptions) {
  return `Write one reading text for an English learner at CEFR ${level}.

TOPIC: ${topic}
LEVEL: ${LEVEL_BRIEF[level]}

MUST USE THESE WORDS: ${targets.join(", ")}
Each of them must appear at least twice, in different sentences, used naturally and correctly. Do not define them, do not draw attention to them, do not list them — they are simply part of the text. Inflect them freely (plural, past tense, and so on).

HARD RULES
- Never state facts about a named real person, company product or event. Write about unnamed people and general patterns.
- No invented statistics or study citations.
- Several paragraphs, a real beginning and a real ending.

Return JSON exactly like this:
{
  "title": "3-6 words, specific, no colon",
  "sentences": [
    { "text": "One English sentence.", "translationRu": "Естественный перевод на русский." }
  ],
  "glossary": {
    "word": { "translation": "русский перевод", "partOfSpeech": "noun|verb|adjective|adverb|phrase" }
  },
  "questions": [
    {
      "question": "A question about the text in English",
      "options": ["four plain options", "one of them correct", "no letters", "no numbering"],
      "answer": 0,
      "explanation": "One sentence on why that option is right."
    }
  ]
}

- Every sentence needs a natural Russian translation, meaning for meaning.
- glossary: 6 to 10 of the harder words that actually appear, lowercase keys, base form. Include the required words above.
- questions: exactly 3, four options each, exactly one correct, answerable only from the text. Vary which index is correct.
- Output nothing but the JSON.`;
}

export type PersonalTextResult = { text: PersonalText } | { error: Unavailable | "rejected" };

/** Generates, validates and stores a text. Anything malformed is rejected. */
export async function generatePersonalText(options: PersonalTextOptions): Promise<PersonalTextResult> {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) return { error: "no-key" };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.9,
        max_completion_tokens: 5500,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You write graded reading material for an English-learning app, and you answer with JSON only.",
          },
          { role: "user", content: buildPrompt(options) },
        ],
      }),
    });

    if (!response.ok) return { error: "failed" };
    const data = await response.json();
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

    const sentences = Array.isArray(raw.sentences) ? raw.sentences : [];
    const clean = sentences
      .map((s: { text?: string; translationRu?: string }) => ({
        text: String(s?.text ?? "").trim(),
        translationRu: String(s?.translationRu ?? "").trim(),
      }))
      .filter((s: { text: string; translationRu: string }) => s.text && s.translationRu);

    if (clean.length < 8) return { error: "rejected" };

    const questions = (Array.isArray(raw.questions) ? raw.questions : [])
      .slice(0, 3)
      .map((q: { question?: string; options?: unknown[]; answer?: number; explanation?: string }, i: number) => ({
        id: `q${i + 1}`,
        question: String(q?.question ?? "").trim(),
        options: (Array.isArray(q?.options) ? q.options : []).map((o) => String(o).trim()),
        answer: Number.isInteger(q?.answer) && Number(q?.answer) >= 0 && Number(q?.answer) <= 3 ? Number(q?.answer) : 0,
        explanation: String(q?.explanation ?? "").trim(),
      }))
      .filter((q: { question: string; options: string[] }) => q.question && q.options.length === 4);

    if (questions.length !== 3) return { error: "rejected" };

    const glossary: ReadingText["glossary"] = {};
    const body = clean.map((s: { text: string }) => s.text).join(" ").toLowerCase();
    for (const [word, entry] of Object.entries(raw.glossary ?? {})) {
      const item = entry as { translation?: string; partOfSpeech?: string };
      const lower = String(word).toLowerCase().trim();
      if (!lower || !item?.translation || !body.includes(lower.split(" ")[0])) continue;
      glossary[lower] = { translation: item.translation, partOfSpeech: item.partOfSpeech };
    }

    const text: PersonalText = {
      id: `personal-${Date.now()}`,
      level: options.level,
      topic: "personal",
      generated: true,
      title: String(raw.title ?? "").trim() || options.topic,
      sentences: clean,
      glossary,
      questions,
      targets: options.targets,
      createdAt: Date.now(),
    };

    store(text);
    return { text };
  } catch {
    return { error: "failed" };
  }
}

/** How many of the target words really made it into the finished text. */
export function targetsPresent(text: PersonalText): string[] {
  const body = text.sentences.map((s) => s.text).join(" ").toLowerCase();
  return text.targets.filter((word) => body.includes(word.toLowerCase().split(" ")[0]));
}
