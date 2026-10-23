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
 *   - real people, clubs and companies may be named, and nothing may be
 *     invented about them: public record only, no invented quotes, figures or
 *     private life, and no wording lifted from anybody's article;
 *   - the Russian is a natural translation, not a word-for-word gloss, because
 *     that is what the reader compares against while reading.
 *
 * Texts are coursebook length — several paragraphs, not a paragraph — because a
 * three-sentence text cannot repeat a word often enough to teach it, and
 * repetition inside one text is the cheapest repetition there is.
 *
 * Usage:
 *   node scripts/generate-reading.mjs                     # fill every topic to TARGET_PER_LEVEL
 *   node scripts/generate-reading.mjs --topic sport --count 2
 *   node scripts/generate-reading.mjs --topic famous --level A1-A2 --count 7
 *   node scripts/generate-reading.mjs --advanced          # fill the Advanced shelf
 *   node scripts/generate-reading.mjs --advanced --openai # same, paid, no daily cap
 *   node scripts/generate-reading.mjs --dry               # one text, printed, nothing written
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "src/data/reading");
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const CONCURRENCY = 1;
/** Texts per request. Batching amortises the prompt and roughly triples throughput
 *  against a tokens-per-minute cap. */
let BATCH = 2;
/**
 * Tokens-per-minute is the real ceiling (8k on the free tier, ~2k per text), so
 * the runner spaces requests instead of sprinting into a 429 and then waiting
 * out a full minute. Steady beats bursty: this is about four texts a minute.
 */
const MIN_GAP_MS = 15000;
const TARGET_PER_LEVEL = 7;

const LEVELS = ["A1-A2", "B1-B2", "C1-C2"];

/** Topic id → label plus the angles that keep generated texts from converging. */
/*
 * Naming names.
 *
 * These prompts used to forbid every real person, club and company, and that
 * was one rule doing the work of two. The risk was never the name — facts are
 * not anybody's property, and a text about why a club plays the way it does is
 * both legal and the kind of thing people actually open. The risk is invention:
 * a made-up quote, a made-up transfer fee, a sentence about somebody's private
 * life. So the rule is now about truth rather than about names, and the shelf
 * can carry the subjects a reader came for.
 *
 * The line that does not move: nothing is copied. Articles, interviews and
 * books are somebody's copyright, and a commercial site that reprints them is
 * a takedown waiting to happen. Facts are free; the sentences are ours.
 */
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
  /* Named subjects, on the public record. Everything here is the kind of
     thing a reader already half-knows and wants the rest of — which is what
     makes somebody open a text instead of scrolling past it. The angles name
     the field rather than the person, so the model picks a subject it is
     actually sure about instead of being pushed into inventing detail about
     one it is not. */
  famous: {
    label: "Famous people, clubs and companies",
    angles: [
      "why one football club's playing style became the one everyone copied",
      "how a streaming service decides what to make next",
      "what a record-breaking footballer actually changed about the position",
      "how a phone company turned a product launch into an event",
      "why a film franchise keeps working after a dozen films",
      "what a long-running animated series got right at the start",
      "how a sportswear brand built its name on one endorsement idea",
      "why a basketball league exports better than any other",
      "what a famous director does that other directors do not",
      "how a social app's recommendation feed changed what gets made",
      "why one video game sold to people who do not play video games",
      "what happened to the music industry when downloads arrived",
      "how a search company ended up running an operating system",
      "why a hockey league plays a season that long",
      "what a pop star's re-recording of their own albums was about",
      "how a short-video trend starts and why most die in a week",
      "why some film plots are the same story told again",
      "what a Formula 1 team's pit crew is actually doing",
      "how an electric car company made its batteries the product",
      "why a streaming show from one country became a worldwide habit",
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
  /* Longer than they were, at every level.
     The old floors — 180 words at A1, 280 at B1 — produced texts that ended
     before their subject had gone anywhere, and the model habitually
     undershoots a range by a fifth, so a 180 floor meant texts of 110. The
     numbers below are what it takes to land where the shelf needs to be. */
  "A1-A2": {
    sentences: "26 to 32",
    words: "320 to 400",
    guidance:
      "Very simple English. Present simple and past simple only, short sentences, the most frequent 1000 words. No idioms, no subordinate clauses longer than one.",
  },
  "B1-B2": {
    sentences: "30 to 38",
    words: "450 to 560",
    guidance:
      "Everyday and semi-formal English. A mix of tenses, some linking words, a few phrasal verbs. Sentences of varied length, no rare vocabulary.",
  },
  "C1-C2": {
    sentences: "32 to 40",
    words: "520 to 650",
    guidance:
      "Advanced, essay-like register. Nuanced argument, precise collocation, hedging, some abstract nouns. Still readable — dense but never ornamental.",
  },
};

/*
 * The fourth shelf.
 *
 * Not "C1-C2 but harder" — harder in a particular direction. What a learner
 * who already reads C2 prose is short of is not grammar; it is the stock of
 * idiom, collocation and literary vocabulary that native writers reach for
 * without noticing, and which no coursebook prints because none of it is on a
 * syllabus. So these are written to carry that and to be worth reading on
 * their own terms, which is the only way anybody finishes one.
 */
const ADVANCED_SPEC = {
  sentences: "30 to 40",
  words: "550 to 750",
  guidance:
    "The hardest English this library holds, and a pleasure to read. Essayistic: a real argument that turns at least once, built from precise collocation and confident rhythm. Reach deliberately for idiom and figurative phrasing a native writer would use and a textbook never teaches, and equally for literary and academic vocabulary — the register of a good long-form essay, not of a grammar exercise. Long sentences are welcome where they earn their length, but never ornament for its own sake: every clause carries meaning. Aim at a reader who wants their English to sound educated in writing and in conversation alike.",
};

/** Angles for the Advanced shelf. Subjects an adult reader would choose. */
const ADVANCED_ANGLES = [
  "why some cities feel alive and others feel staged",
  "what boredom is for",
  "the quiet economics of a second-hand market",
  "why experts disagree about things they both understand",
  "how a language loses a word",
  "the case against measuring everything",
  "what a good apology actually does",
  "why old buildings are rebuilt rather than preserved",
  "the difference between confidence and certainty",
  "how reputations outlive the people who earned them",
  "why rules get written after the accident",
  "what nostalgia conceals",
  "the hidden cost of convenience",
  "how a crowd decides anything",
  "why some ideas spread and better ones do not",
  "what silence does in a conversation",
  "the logic of superstition",
  "why forecasts are wrong in the same direction",
  "how taste is learned and then denied",
  "what a map leaves out on purpose",

  /* The second twenty: named, popular, and the reason somebody opens a text
     instead of scrolling past it. The register is the same — idiom, literary
     vocabulary, an argument that turns — and the subject is something the
     reader already half-knows. An essay about a streaming empire can be as
     well written as an essay about boredom, and far more people finish it. */
  "why a two-second pit stop takes twenty people",
  "how an animation studio built a century on the same few stories",
  "what American college sport actually funds",
  "why one children's network sounded different from all the others",
  "how a creator turned giving money away into a format",
  "why a streamer's live reaction became the product",
  "what a pop star's quiet singing did to recording",
  "how a footballer's body becomes a career strategy",
  "why Formula 1 rules change every few years on purpose",
  "what a superhero franchise borrowed from serialised television",
  "how a university endowment actually works",
  "why American football stops the clock so often",
  "what a film score does that the script cannot",
  "how a fashion house survives its founder",
  "why an animated film outlives the children who saw it first",
  "what a late-night format is really selling",
  "how a game studio turned a delay into trust",
  "why some sequels are remakes in disguise",
  "what a stadium costs a city after the final whistle",
  "how a magazine cover decided who was famous",

  /* A third twenty. The list is the ceiling on how large this shelf can get:
     with forty angles and forty texts, the next run wrapped onto subjects
     already written and produced fifteen near-duplicates — the same essay
     under a different title. Every top-up needs its own angles. */
  "why a theme park is designed as a film set",
  "how a sports documentary changes the sport it films",
  "what a country gains from hosting a tournament it cannot afford",
  "why luxury watches survived the phone",
  "how a comedian's timing is actually built",
  "what a flagship store sells besides the product",
  "why a long-running sitcom gets funnier on rewatch",
  "how a transfer window distorts a whole season",
  "what an awards ceremony is really deciding",
  "why cooking shows became competitions",
  "how a brand recovers from a disaster of its own making",
  "what makes a stadium atmosphere impossible to export",
  "why a streaming platform cancels a popular show",
  "how an athlete's second career begins before the first one ends",
  "what a trailer gives away and what it hides",
  "why some musicians refuse to tour",
  "how a league decides where to put a new team",
  "what a reality format exports when it is sold abroad",
  "why a sequel costs more than the original",
  "how a sports rivalry outlives everyone who started it",
];

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

/*
 * The other engine.
 *
 * Groq is free and fast and has a daily token ceiling that a full shelf runs
 * straight into — twice now, both times in the middle of a batch. OpenAI has
 * no such cliff and costs money, which makes it the right tool for topping a
 * shelf up rather than for building one. Same prompt, same JSON, so a text is
 * no different for having come from here; only the bill is.
 */
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

async function openai(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing — put it in .env.local");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.9,
      max_tokens: 6000,
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

  if (response.status === 429) {
    await sleep(8000);
    throw new Error("openai rate limited");
  }
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/** Which engine this run uses. Set once from the command line. */
let engine = "groq";

function ask(prompt) {
  return engine === "openai" ? openai(prompt) : groq(prompt);
}

async function groq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing — put it in .env.local");

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

EACH TEXT: ${spec.sentences} sentences, ${spec.words} words in total. Write to the full length — a text that stops at half of it has said half of what it could.
STYLE: ${spec.guidance}

HARD RULES
- Real people, clubs, companies, films and apps are welcome subjects — they are most of what anybody actually wants to read about. What is forbidden is inventing anything about them. Write only what is settled, public and checkable: what a club is, where it plays, what a film is about, how a product works, what a trend consists of, why something became popular.
- Never invent a quotation, a date, a transfer fee, a chart position, a box-office figure or a statistic. If you are not certain of a number, write the sentence without it — "one of the most-watched finals" is true and safe where a made-up viewing figure is neither.
- Nothing about anybody's private life, health, family, finances or opinions. Nothing a person could reasonably object to. Public work, public record, public events only.
- Do not reproduce wording from an article, an interview, a song or a book. Every sentence is your own.
- No invented evidence of any kind. Do not write "data from X shows", "studies suggest", "research indicates", "surveys found" or anything of that shape — not even about unnamed sources. Describe the mechanism instead; a sentence that needs a statistic to stand up is a sentence to rewrite.
- Do not invent a quotation, including from an unnamed business, report or expert. A sentence like 'a studio in London advertises "the sound of a candlelit confession"' is fabrication even though it names nobody.
- Never present a phrase as "the idiom X" unless it is genuinely established English that a dictionary would list. Inventing an idiom in a text written for learners teaches somebody to say a thing nobody says, which is the worst single failure this file can produce.
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

/*
 * No examples of the idiom or the vocabulary.
 *
 * The first run named five idioms and eight words as illustrations of the
 * register, and told the model not to copy them. It copied them: "tacit"
 * landed in eighteen of nineteen texts, "by the same token" in seventeen.
 * A prohibition does not undo an anchor — the only reliable way not to get a
 * word back is not to say it. The register is described instead, and what has
 * already been used is passed in as a list to avoid, which is a fact about the
 * shelf rather than a suggestion about style.
 */
function buildAdvancedPrompt({ angles, avoidTitles, avoidPhrases }) {
  return `Write ${angles.length} separate reading texts for advanced learners of English — people who already read C2 prose comfortably and want the English that textbooks never teach.

Write one text per subject, in this order:
${angles.map((a, i) => `${i + 1}. ${a}`).join("\n")}

EACH TEXT: ${ADVANCED_SPEC.sentences} sentences, ${ADVANCED_SPEC.words} words in total.
STYLE: ${ADVANCED_SPEC.guidance}

WHAT MAKES THESE DIFFERENT
- At least six idioms or figurative expressions per text, used naturally, never explained and never clustered.
- Choose different idioms and different advanced words for each text. Twenty texts sharing five idioms is a phrasebook, not a library.
- At least eight words of genuinely literary or academic register per text, each doing real work in its sentence.
- The idiom and the vocabulary serve the argument. A text that is a showcase for phrases is a failed text: a reader must want to finish it for what it says.

HARD RULES
- Real people, clubs, companies, films and apps are welcome subjects — they are most of what anybody actually wants to read about. What is forbidden is inventing anything about them. Write only what is settled, public and checkable: what a club is, where it plays, what a film is about, how a product works, what a trend consists of, why something became popular.
- Never invent a quotation, a date, a transfer fee, a chart position, a box-office figure or a statistic. If you are not certain of a number, write the sentence without it — "one of the most-watched finals" is true and safe where a made-up viewing figure is neither.
- Nothing about anybody's private life, health, family, finances or opinions. Nothing a person could reasonably object to. Public work, public record, public events only.
- Do not reproduce wording from an article, an interview, a song or a book. Every sentence is your own.
- No invented evidence of any kind. Do not write "data from X shows", "studies suggest", "research indicates", "surveys found" or anything of that shape — not even about unnamed sources. Describe the mechanism instead; a sentence that needs a statistic to stand up is a sentence to rewrite.
- Do not invent a quotation, including from an unnamed business, report or expert. A sentence like 'a studio in London advertises "the sound of a candlelit confession"' is fabrication even though it names nobody.
- Never present a phrase as "the idiom X" unless it is genuinely established English that a dictionary would list. Inventing an idiom in a text written for learners teaches somebody to say a thing nobody says, which is the worst single failure this file can produce.
- Each text is self-contained and ends on a real closing thought, not a cliffhanger.
- Do not reuse any of these titles: ${avoidTitles.slice(0, 24).join("; ") || "(none yet)"}.
- These idioms and words are already used elsewhere on this shelf. Do not use any of them: ${avoidPhrases.slice(0, 120).join("; ") || "(none yet)"}.

Return JSON exactly like this, with ${angles.length} items in "texts":
{
  "texts": [
    {
      "title": "3-6 words, specific, intriguing, no colon",
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
- Every sentence needs a natural Russian translation — meaning-for-meaning, not word-for-word. Idioms are translated by sense, never literally.
- glossary: 10 to 14 entries per text, the idioms and the hardest vocabulary that actually appear. Lowercase keys, base form; a multi-word idiom is one key.
- questions: exactly 3 per text, 4 options each, exactly one correct, answerable from the text alone. Vary which index is correct.
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
  if (sentences.length < 14 || sentences.length > 34) problems.push(`sentence count ${sentences.length}`);
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

/*
 * The library is filed by level, not by subject.
 *
 * It used to be one file per topic, because the shelf asked for a topic
 * first. The shelf asks for a level now — a learner picks something they can
 * read, not a genre — so the chunks follow, and the topics below survive only
 * as angles that keep generated texts from converging on the same article.
 */
const BANDS = ["a1-a2", "b1-b2", "c1-c2", "advanced"];

/** CEFR level to band. "advanced" is never derived: it is written for. */
function bandOf(level) {
  if (level === "A1" || level === "A2" || level === "A1-A2") return "a1-a2";
  if (level === "B1" || level === "B2" || level === "B1-B2") return "b1-b2";
  return "c1-c2";
}

function bandFile(band) {
  return join(OUT_DIR, `${band}.json`);
}

function readBand(band) {
  const file = bandFile(band);
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function writeBand(band, texts) {
  mkdirSync(dirname(bandFile(band)), { recursive: true });
  writeFileSync(bandFile(band), `${JSON.stringify(texts, null, 1)}\n`);
}

function writeIndex() {
  const index = BANDS.map((id) => {
    const texts = readBand(id);
    const counts = {};
    for (const text of texts) counts[text.level] = (counts[text.level] ?? 0) + 1;
    return { id, counts, total: texts.length };
  });
  writeFileSync(join(OUT_DIR, "index.json"), `${JSON.stringify(index, null, 1)}\n`);
  return index;
}

/* ── Runner ───────────────────────────────────────────────────────────────── */

async function generateBatch(job, existing) {
  const prompt = job.advanced
    ? buildAdvancedPrompt({
        angles: job.angles,
        avoidTitles: existing.map((t) => t.title),
        avoidPhrases: [...new Set(existing.flatMap((t) => Object.keys(t.glossary ?? {})))],
      })
    : buildPrompt({
        ...job,
        avoidTitles: existing.filter((t) => t.level === job.level).map((t) => t.title),
      });

  // Retries are generous because the usual failure is a rate limit, not a bad
  // model response — giving up there would leave holes in the library.
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const raw = await ask(prompt);
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
  const advanced = args.includes("--advanced");
  /* --openai tops a shelf up when Groq's daily ceiling is spent. Same prompt,
     same output; it simply costs money instead of waiting until tomorrow. */
  if (args.includes("--openai")) {
    engine = "openai";
    /* One text per request on this engine.
       Two in one response made the model split a single answer budget between
       them, and it chose to shorten rather than to stop: texts came back at
       250 words against a 450-to-560 brief, consistently. Asking for one at a
       time costs an extra round trip and gets the length that was ordered. */
    BATCH = 1;
  }

  /* --level narrows a run to one band, for topping a single shelf up. */
  const onlyLevel = args.includes("--level") ? args[args.indexOf("--level") + 1] : null;

  const topics = only ? [only] : Object.keys(TOPICS);
  const jobs = [];

  if (advanced) {
    const have = readBand("advanced");
    const want = count ?? Math.max(0, 20 - have.length);
    for (let i = 0; i < want; i += BATCH) {
      jobs.push({
        topic: "advanced",
        band: "advanced",
        level: "C2",
        advanced: true,
        /* Wrapped, not sliced off the end — the list used to be indexed from
           however many texts the shelf already held, so the first top-up after
           it filled asked for texts about nothing at all.

           Wrapping is a guard, not a plan. Going round a second time asks for
           subjects already written, and the model obliges: fifteen texts came
           back as the same essays under new titles. The warning below is the
           only thing standing between a top-up and a shelf of twins. */
        angles: Array.from({ length: Math.min(BATCH, want - i) }, (_, k) =>
          ADVANCED_ANGLES[(have.length + i + k) % ADVANCED_ANGLES.length],
        ),
      });
    }
  }

  for (const topic of advanced ? [] : topics) {
    const meta = TOPICS[topic];
    if (!meta) throw new Error(`unknown topic ${topic}`);
        for (const level of LEVELS) {
      if (onlyLevel && level !== onlyLevel) continue;
      const have = readBand(bandOf(level)).filter((t) => t.topic === topic).length;
      const want = count ?? Math.max(0, TARGET_PER_LEVEL - have);
      for (let i = 0; i < want; i += BATCH) {
        const angles = [];
        for (let k = i; k < Math.min(i + BATCH, want); k++) {
          angles.push(meta.angles[(have + k) % meta.angles.length]);
        }
        jobs.push({ topic, band: bandOf(level), label: meta.label, level, angles });
      }
    }
  }

  if (dry) {
    const texts = await generateBatch(jobs[0], []);
    console.log(JSON.stringify(texts, null, 2));
    return;
  }

  if (advanced) {
    const have = readBand("advanced").length;
    const wantNow = count ?? Math.max(0, 20 - have);
    if (have + wantNow > ADVANCED_ANGLES.length) {
      console.warn(
        `  ! ${have} texts and ${wantNow} more wanted, but only ${ADVANCED_ANGLES.length} angles exist.\n` +
          "    The surplus will repeat subjects already on the shelf. Add angles first.",
      );
    }
  }

  const wanted = jobs.reduce((sum, job) => sum + job.angles.length, 0);
  console.log(`${wanted} texts in ${jobs.length} requests, model ${engine === "openai" ? OPENAI_MODEL : MODEL}`);
  let done = 0;
  let kept = 0;

  // Grouped by band so each file is written once per batch, not once per text.
  const byBand = new Map();
  for (const job of jobs) {
    if (!byBand.has(job.band)) byBand.set(job.band, []);
    byBand.get(job.band).push(job);
  }

  for (const [band, bandJobs] of byBand) {
    const texts = readBand(band);
    const queue = [...bandJobs];

    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const job = queue.shift();
        const batch = await generateBatch(job, texts);
        done++;
        for (const text of batch) {
          const base = slug(text.title) || `${band}-${texts.length + 1}`;
          if (texts.some((t) => t.id === base || t.title.toLowerCase() === text.title.toLowerCase())) {
            console.warn(`  ✗ duplicate title "${text.title}"`);
            continue;
          }
          text.id = base;
          texts.push(text);
          kept++;
          writeBand(band, texts);
          console.log(`  ✓ [${kept}] ${band} ${job.level} — ${text.title}`);
        }
      }
    });

    await Promise.all(workers);
    writeBand(band, texts);
  }

  const index = writeIndex();
  console.log(`\nkept ${kept} texts from ${done} requests`);
  console.log(index.map((t) => `${t.id}: ${t.total}`).join("  "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
