import { askModel, AiError, type AiMessage } from "./aiClient";
import type { ReadingText } from "@/data/readingTexts";
import type { ReadingLevel } from "./placement";
import type { Unavailable } from "./translate";
import { getVocabulary } from "./vocabularyStore";
import { normalise } from "./lexicon";
import { countWordUses } from "./wordMatch";

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
Use each one EXACTLY TWICE across the whole text — no more. Twice is the point: once is not enough to learn from, and a third time makes the text obviously about the word list. Count them before you answer. Inflections of the same word (swim / swims / swimming / swimmer / swimmers) all count towards that total of two, so a text containing "swimmer" four times has broken this rule.
Put the two uses far apart, in different paragraphs, doing different work. Never define them, never draw attention to them, never list them.

THE TEXT MUST STAND ON ITS OWN
This is the rule that matters most, and it is the one that is usually broken. Write a real text first — one subject, an argument or a story that goes somewhere, paragraphs that follow from each other — and let the required words fall into it where they happen to fit. A reader who has never seen the word list should not be able to guess it.
What this forbids: sentences assembled to hold a target word, a scene that jumps from a swimmer to a park to a café because those were the words, any sentence that would be cut if the word were not required. If a word will not fit the subject naturally, build the subject around it from the start instead of bolting the word on at the end.

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

/** The English side of a draft, for counting before it is fully parsed. */
function bodyOf(content: string): string {
  try {
    const raw = JSON.parse(content || "{}") as { sentences?: { text?: string }[] };
    return (raw.sentences ?? []).map((s) => String(s?.text ?? "")).join(" ");
  } catch {
    return "";
  }
}

/** The most times one target word may appear before the text reads as a list. */
const MAX_USES = 2;

/**
 * Which targets the draft leaned on too hard.
 *
 * Asking for "exactly twice" in the prompt is necessary and not sufficient:
 * models count badly, and the failure mode is always the same direction —
 * swim, swimmer, swimming, swimmers, swimmer again, five underlines in a
 * paragraph and a text that is visibly about its own word list. So the draft
 * is counted here, and a text that overshoots is sent back once with the
 * actual numbers rather than shipped.
 */
function overused(body: string, targets: string[]): { word: string; used: number }[] {
  return targets
    .map((word) => ({ word, used: countWordUses(body, word) }))
    .filter(({ used }) => used > MAX_USES);
}

/** Generates, validates and stores a text. Anything malformed is rejected. */
export async function generatePersonalText(options: PersonalTextOptions): Promise<PersonalTextResult> {
  const messages: AiMessage[] = [
    {
      role: "system",
      content: "You write graded reading material for an English-learning app, and you answer with JSON only.",
    },
    { role: "user", content: buildPrompt(options) },
  ];

  let content: string;
  try {
    content = await askModel({
      temperature: 0.9,
      max_completion_tokens: 5500,
      response_format: { type: "json_object" },
      messages,
    });

    const excess = overused(bodyOf(content), options.targets);
    if (excess.length > 0) {
      messages.push(
        { role: "assistant", content },
        {
          role: "user",
          content: [
            "You used some of the required words too often. Counting every inflected form as the same word:",
            ...excess.map(({ word, used }) => `- "${word}" appears ${used} times; it must appear exactly ${MAX_USES}.`),
            "",
            "Rewrite the whole text. Do not simply delete the extra sentences, which would leave holes —",
            "rewrite the passages so they still say something and the subject still holds together,",
            "then check the counts again before answering. Same JSON shape, nothing else.",
          ].join("\n"),
        },
      );
      content = await askModel({
        temperature: 0.7,
        max_completion_tokens: 5500,
        response_format: { type: "json_object" },
        messages,
      });
    }
  } catch (err) {
    return { error: err instanceof AiError ? err.reason : "failed" };
  }

  try {
    const raw = JSON.parse(content || "{}");

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
