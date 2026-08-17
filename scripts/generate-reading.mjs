#!/usr/bin/env node
/**
 * Builds the reading library.
 *
 * Hand-writing two hundred bilingual texts — each with per-sentence Russian,
 * a glossary and three comprehension questions — is weeks of work, so the
 * library is generated and then *validated*: anything with a missing
 * translation, a malformed question or a duplicate title is thrown away rather
 * than shipped. Every generated text carries `generated: true` so it can be
 * audited or replaced later, and the six hand-written texts stay separate.
 *
 * Two deliberate content rules live in the prompt:
 *   - no factual claims about named real people (a public app must not invent
 *     biography), so the culture topic writes about unnamed figures and trends;
 *   - the Russian is a natural translation, not a word-for-word gloss, because
 *     that is what the reader compares against while reading.
 *
 * Usage:
 *   node scripts/generate-reading.mjs                     # fill every topic to TARGET_PER_LEVEL
 *   node scripts/generate-reading.mjs --topic sport --count 2
 *   node scripts/generate-reading.mjs --dry               # one text, printed, nothing written
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "src/data/reading");
const MODEL = process.env.VITE_GROQ_MODEL || "openai/gpt-oss-120b";
const CONCURRENCY = 1;
/** Texts per request. Batching amortises the prompt and roughly triples throughput
 *  against a tokens-per-minute cap. */
const BATCH = 3;
/**
 * Tokens-per-minute is the real ceiling (8k on the free tier, ~2k per text), so
 * the runner spaces requests instead of sprinting into a 429 and then waiting
 * out a full minute. Steady beats bursty: this is about four texts a minute.
 */
const MIN_GAP_MS = 15000;
const TARGET_PER_LEVEL = 7;

const LEVELS = ["A1-A2", "B1-B2", "C1-C2"];

/** Topic id → label plus the angles that keep generated texts from converging. */
const TOPICS = {
  "daily-life": {
    label: "Daily life",
    angles: [
      "a morning routine that changed after a small decision",
      "living with roommates",
      "learning to cook on a budget",
      "commuting in a big city",
      "how someone organises their week",
      "moving to a new flat",
      "a neighbourhood market",
      "keeping a small apartment tidy",
    ],
  },
  travel: {
    label: "Travel",
    angles: [
      "a night train journey",
      "getting lost in an unfamiliar city",
      "travelling with almost no luggage",
      "a village festival a traveller stumbled into",
      "why some travellers return to the same place",
      "learning a few phrases before a trip",
      "airports at four in the morning",
      "walking a long-distance trail",
    ],
  },
  technology: {
    label: "Technology",
    angles: [
      "how recommendation feeds shape what we watch",
      "the cost of keeping old devices alive",
      "why software gets slower over time",
      "smart homes that outlive their apps",
      "machine translation in daily use",
      "batteries and the limits of physics",
      "open-source software maintained by volunteers",
      "the data centres behind a simple search",
    ],
  },
  science: {
    label: "Science",
    angles: [
      "how memory is consolidated during sleep",
      "why replication matters in research",
      "the discovery of penicillin as an accident",
      "how vaccines train the immune system",
      "measuring time with atomic clocks",
      "why the deep ocean is harder to reach than orbit",
      "how bees navigate",
      "the mathematics behind weather forecasts",
    ],
  },
  sport: {
    label: "Sport",
    angles: [
      "why marathon records keep falling",
      "the training week of an amateur swimmer",
      "how a football club changes a small town",
      "recovering from a serious injury",
      "the rise of climbing gyms",
      "what coaches actually do during a match",
      "chess as a physical sport",
      "why some athletes retire early",
    ],
  },
  culture: {
    label: "Fame and culture",
    angles: [
      "how fame changes what a musician can release",
      "why film franchises dominate cinemas",
      "the economics of a stadium tour",
      "fan communities and the work they do for free",
      "what a viral video does to an ordinary person's life",
      "why some songs from decades ago come back",
      "the rise of the podcast interview",
      "how streaming changed album length",
    ],
  },
  business: {
    label: "Work and business",
    angles: [
      "a small business that survived by narrowing its focus",
      "what remote work did to city centres",
      "why meetings multiply",
      "a first job that taught an unexpected lesson",
      "how a coffee shop prices its menu",
      "the four-day week experiments",
      "why start-ups fail quietly",
      "learning to say no at work",
    ],
  },
  health: {
    label: "Health and the body",
    angles: [
      "what happens in the body during a long walk",
      "sleep debt and how it is repaid",
      "why hydration advice keeps changing",
      "the placebo effect",
      "screens and eye strain",
      "how habits form and break",
      "food labels and what they hide",
      "recovering after illness",
    ],
  },
  environment: {
    label: "Environment",
    angles: [
      "a river that was cleaned up",
      "why recycling is harder than it looks",
      "cities planting trees for shade",
      "the cost of fast fashion",
      "urban wildlife adapting to humans",
      "why some places lose their winters",
      "reusable packaging experiments",
      "the energy behind a single flight",
    ],
  },
  society: {
    label: "Society",
    angles: [
      "why attention has become a currency",
      "the decline of small local newspapers",
      "how libraries changed their role",
      "living in a city that never sleeps",
      "loneliness in crowded places",
      "volunteering and what motivates it",
      "how languages disappear",
      "public transport as a social space",
    ],
  },
};

const LEVEL_SPEC = {
  "A1-A2": {
    sentences: "7 to 9",
    words: "55 to 90",
    guidance:
      "Very simple English. Present simple and past simple only, short sentences, the most frequent 1000 words. No idioms, no subordinate clauses longer than one.",
  },
  "B1-B2": {
    sentences: "9 to 12",
    words: "110 to 170",
    guidance:
      "Everyday and semi-formal English. A mix of tenses, some linking words, a few phrasal verbs. Sentences of varied length, no rare vocabulary.",
  },
  "C1-C2": {
    sentences: "10 to 14",
    words: "170 to 240",
    guidance:
      "Advanced, essay-like register. Nuanced argument, precise collocation, hedging, some abstract nouns. Still readable — dense but never ornamental.",
  },
};

/* ── Groq ─────────────────────────────────────────────────────────────────── */

function loadEnv() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Groq's free tier caps tokens per minute (8k at the time of writing), and one
 * generation costs roughly 2k. Firing requests as fast as the network allows
 * therefore spends the first ten seconds of every minute and then collects 429s
 * for the other fifty. So the pacer reads the budget back out of the response
 * headers and waits for the window to reset before it runs dry.
 */
let tokensLeft = Infinity;
let resetInMs = 0;

function parseDuration(value) {
  if (!value) return 0;
  const m = String(value).match(/(?:([\d.]+)m)?([\d.]+)s/);
  if (!m) return Number(value) * 1000 || 0;
  return (Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)) * 1000;
}

let lastCallAt = 0;

async function respectBudget() {
  const since = Date.now() - lastCallAt;
  if (since < MIN_GAP_MS) await sleep(MIN_GAP_MS - since);
  lastCallAt = Date.now();

  if (tokensLeft < 2600 && resetInMs > 0) {
    const wait = Math.min(resetInMs + 750, 70000);
    console.log(`  … token budget low (${tokensLeft}), waiting ${Math.round(wait / 1000)}s`);
    await sleep(wait);
    tokensLeft = Infinity;
    resetInMs = 0;
  }
}

async function groq(prompt) {
  const key = process.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("VITE_GROQ_API_KEY missing — put it in .env.local");

  await respectBudget();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      // gpt-oss spends reasoning tokens against the same per-minute budget, and
      // graded reading material does not need deliberation — this roughly tripled
      // the number of texts per minute.
      reasoning_effort: "low",
      // Groq rejects a request whose prompt + max_completion_tokens exceeds the
      // per-minute token limit outright (413), so this stays well under 8000.
      max_completion_tokens: 5500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write graded reading material for an English-learning app, and you answer with JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const remaining = response.headers.get("x-ratelimit-remaining-tokens");
  if (remaining !== null) tokensLeft = Number(remaining);
  resetInMs = parseDuration(response.headers.get("x-ratelimit-reset-tokens"));

  if (response.status === 429) {
    const wait = Math.max(parseDuration(response.headers.get("retry-after")), resetInMs, 5000);
    console.log(`  … rate limited, waiting ${Math.round(wait / 1000)}s`);
    await sleep(wait + 500);
    const error = new Error("rate limited");
    error.retryable = true;
    throw error;
  }

  if (!response.ok) throw new Error(`Groq ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function buildPrompt({ label, level, angles, avoidTitles }) {
  const spec = LEVEL_SPEC[level];
  return `Write ${angles.length} separate short reading texts for English learners at CEFR ${level}.

TOPIC: ${label}
Write one text per angle, in this order:
${angles.map((a, i) => `${i + 1}. ${a}`).join("\n")}

EACH TEXT: ${spec.sentences} sentences, ${spec.words} words in total.
STYLE: ${spec.guidance}

HARD RULES
- Never state facts about a named real person, company product or event. Write about unnamed people ("a Norwegian runner", "one musician") and general patterns. Invented biography is not acceptable.
- No statistics, dates or study citations unless they are so widely known they cannot be wrong. Prefer describing mechanisms over quoting numbers.
- Each text is self-contained and ends on a real closing thought, not a cliffhanger.
- Do not reuse any of these titles: ${avoidTitles.slice(0, 24).join("; ") || "(none yet)"}.

Return JSON exactly like this, with ${angles.length} items in "texts":
{
  "texts": [
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
          "options": ["four options", "as plain strings", "one of them correct", "no letters or numbering"],
          "answer": 0,
          "explanation": "One sentence saying why that option is right, referring to the text."
        }
      ]
    }
  ]
}

REQUIREMENTS
- Every sentence needs a natural Russian translation — meaning-for-meaning, not word-for-word.
- glossary: 5 to 8 of the hardest words that actually appear in that text, lowercase keys, base form.
- questions: exactly 3 per text. Each has 4 options, exactly one correct, "answer" is its index. They must be answerable from the text and not from general knowledge.
- Vary which index is correct.
- Output nothing but the JSON.`;
}

/* ── Validation — the part that makes generated content shippable ─────────── */

function validate(raw, { topic, level }) {
  const problems = [];
  const text = {
    id: "",
    level,
    topic,
    generated: true,
    title: String(raw?.title ?? "").trim(),
    sentences: [],
    glossary: {},
    questions: [],
  };

  if (text.title.length < 4 || text.title.length > 70) problems.push("title length");
  if (/[:–—]/.test(text.title)) text.title = text.title.split(/[:–—]/)[0].trim();

  const sentences = Array.isArray(raw?.sentences) ? raw.sentences : [];
  if (sentences.length < 6 || sentences.length > 16) problems.push(`sentence count ${sentences.length}`);
  for (const s of sentences) {
    const en = String(s?.text ?? "").trim();
    const ru = String(s?.translationRu ?? "").trim();
    if (!en || !ru) return { problems: ["sentence missing a side"] };
    if (!/[Ѐ-ӿ]/.test(ru)) return { problems: ["translation is not Russian"] };
    if (/[Ѐ-ӿ]/.test(en)) return { problems: ["English side contains Cyrillic"] };
    text.sentences.push({ text: en, translationRu: ru });
  }

  const glossary = raw?.glossary && typeof raw.glossary === "object" ? raw.glossary : {};
  const body = text.sentences.map((s) => s.text).join(" ").toLowerCase();
  for (const [word, entry] of Object.entries(glossary)) {
    const key = String(word).toLowerCase().trim();
    const translation = String(entry?.translation ?? "").trim();
    // A glossary entry for a word that isn't in the text is noise at best.
    if (!key || !translation || !body.includes(key.split(" ")[0])) continue;
    text.glossary[key] = {
      translation,
      partOfSpeech: String(entry?.partOfSpeech ?? "").trim() || undefined,
    };
  }
  if (Object.keys(text.glossary).length < 3) problems.push("glossary too small");

  const questions = Array.isArray(raw?.questions) ? raw.questions : [];
  if (questions.length !== 3) problems.push(`question count ${questions.length}`);
  questions.slice(0, 3).forEach((q, i) => {
    const options = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()) : [];
    const answer = Number(q?.answer);
    const question = String(q?.question ?? "").trim();
    if (options.length !== 4 || new Set(options).size !== 4) problems.push(`q${i + 1} options`);
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) problems.push(`q${i + 1} answer index`);
    if (!question) problems.push(`q${i + 1} empty`);
    text.questions.push({
      id: `q${i + 1}`,
      question,
      options,
      answer: Number.isInteger(answer) ? answer : 0,
      explanation: String(q?.explanation ?? "").trim(),
    });
  });

  return problems.length ? { problems } : { text };
}

function slug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/* ── Store ────────────────────────────────────────────────────────────────── */

function topicFile(topic) {
  return join(OUT_DIR, `${topic}.json`);
}

function readTopic(topic) {
  const file = topicFile(topic);
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function writeTopic(topic, texts) {
  mkdirSync(dirname(topicFile(topic)), { recursive: true });
  writeFileSync(topicFile(topic), `${JSON.stringify(texts, null, 2)}\n`);
}

function writeIndex() {
  const index = Object.entries(TOPICS).map(([id, { label }]) => {
    const texts = readTopic(id);
    const counts = {};
    for (const level of LEVELS) counts[level] = texts.filter((t) => t.level === level).length;
    return { id, label, counts, total: texts.length };
  });
  writeFileSync(join(OUT_DIR, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

/* ── Runner ───────────────────────────────────────────────────────────────── */

async function generateBatch(job, existing) {
  const prompt = buildPrompt({
    ...job,
    avoidTitles: existing.filter((t) => t.level === job.level).map((t) => t.title),
  });

  // Retries are generous because the usual failure is a rate limit, not a bad
  // model response — giving up there would leave holes in the library.
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await groq(prompt);
      const list = Array.isArray(raw?.texts) ? raw.texts : [raw];
      const kept = [];
      for (const candidate of list) {
        const { text, problems } = validate(candidate, job);
        if (text) kept.push(text);
        else console.warn(`  ✗ ${job.topic}/${job.level} rejected: ${problems.join(", ")}`);
      }
      if (kept.length) return kept;
    } catch (error) {
      if (!error.retryable) {
        console.warn(`  ✗ ${job.topic}/${job.level} ${String(error.message).slice(0, 120)}`);
        await sleep(2000 * attempt);
      }
    }
  }
  return [];
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const only = args.includes("--topic") ? args[args.indexOf("--topic") + 1] : null;
  const count = args.includes("--count") ? Number(args[args.indexOf("--count") + 1]) : null;
  const dry = args.includes("--dry");

  const topics = only ? [only] : Object.keys(TOPICS);
  const jobs = [];

  for (const topic of topics) {
    const meta = TOPICS[topic];
    if (!meta) throw new Error(`unknown topic ${topic}`);
    const existing = readTopic(topic);
    for (const level of LEVELS) {
      const have = existing.filter((t) => t.level === level).length;
      const want = count ?? Math.max(0, TARGET_PER_LEVEL - have);
      for (let i = 0; i < want; i += BATCH) {
        const angles = [];
        for (let k = i; k < Math.min(i + BATCH, want); k++) {
          angles.push(meta.angles[(have + k) % meta.angles.length]);
        }
        jobs.push({ topic, label: meta.label, level, angles });
      }
    }
  }

  if (dry) {
    const texts = await generateBatch(jobs[0], []);
    console.log(JSON.stringify(texts, null, 2));
    return;
  }

  const wanted = jobs.reduce((sum, job) => sum + job.angles.length, 0);
  console.log(`${wanted} texts in ${jobs.length} requests, model ${MODEL}`);
  let done = 0;
  let kept = 0;

  // Grouped by topic so each file is written once per batch, not once per text.
  const byTopic = new Map();
  for (const job of jobs) {
    if (!byTopic.has(job.topic)) byTopic.set(job.topic, []);
    byTopic.get(job.topic).push(job);
  }

  for (const [topic, topicJobs] of byTopic) {
    const texts = readTopic(topic);
    const queue = [...topicJobs];

    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const job = queue.shift();
        const batch = await generateBatch(job, texts);
        done++;
        for (const text of batch) {
          const base = slug(text.title) || `${topic}-${texts.length + 1}`;
          if (texts.some((t) => t.id === base || t.title.toLowerCase() === text.title.toLowerCase())) {
            console.warn(`  ✗ duplicate title "${text.title}"`);
            continue;
          }
          text.id = base;
          texts.push(text);
          kept++;
          writeTopic(topic, texts);
          console.log(`  ✓ [${kept}] ${topic} ${job.level} — ${text.title}`);
        }
      }
    });

    await Promise.all(workers);
    writeTopic(topic, texts);
  }

  const index = writeIndex();
  console.log(`\nkept ${kept} texts from ${done} requests`);
  console.log(index.map((t) => `${t.id}: ${t.total}`).join("  "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
