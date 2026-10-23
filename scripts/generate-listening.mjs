#!/usr/bin/env node
/**
 * Writes dictation lessons.
 *
 * These are not reading texts with the paragraphs removed. A reading sentence
 * can run long because a reader can go back; a dictation fragment has to be
 * held in the head while it is typed, which puts a hard ceiling on its length.
 * Measured across the shelf that exists: a median of 35 characters and nothing
 * over 56. That constraint is the whole brief, and it is why this file exists
 * rather than a flag on the reading generator.
 *
 * The subjects are the other half. A lesson somebody types forty fragments of
 * has to be worth forty fragments — how something came to exist, what a famous
 * thing is actually doing, the fact that turns out to be stranger than the
 * story about it. "Nice weather today" is grammatically ideal and nobody
 * finishes it.
 *
 * Voicing is a separate step: scripts/voice.py reads what this writes, hashes
 * each sentence and speaks only the ones it has not spoken before.
 *
 *   node scripts/generate-listening.mjs --count 8
 *   node scripts/generate-listening.mjs --count 4 --level B1 --openai
 *   node scripts/generate-listening.mjs --dry
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "src/data/listening");
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MIN_GAP_MS = 12000;

function loadEnv() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * What a lesson is about.
 *
 * Grouped so a run spreads across the shelf rather than producing forty
 * variations on one idea, and written as questions a person would actually
 * stop to hear the answer to.
 */
const SUBJECTS = [
  "how a famous logo came to look like that",
  "why a stadium roof is shaped the way it is",
  "how a film studio makes a city street indoors",
  "what a pit crew does in two seconds",
  "how a famous song was recorded by accident",
  "why a goalkeeper stands where they stand",
  "how a skyscraper is washed",
  "what happens to a football shirt after a match",
  "how an animated film is made before it is drawn",
  "why athletes sleep more than anybody else",
  "how a famous theme park hides its service corridors",
  "what a sports commentator prepares before a game",
  "how a chocolate factory keeps its smell inside",
  "why racing tyres are different colours",
  "how a stunt driver practises a crash",
  "what a museum does with the art it cannot show",
  "how a famous building was moved without breaking",
  "why some sports are played indoors in summer",
  "how a video game world is made to feel large",
  "what a referee hears that the crowd does not",
  "how a lighthouse keeper used to live",
  "why the first bicycles had no pedals",
  "how a famous bridge was built from both ends",
  "what an orchestra does in the hour before a concert",
  "how a snow machine makes snow when it is warm",
  "why a submarine crew has no windows",
  "how a famous cartoon character got its voice",
  "what a zoo does when an animal will not eat",
  "how a ship's name is chosen",
  "why some trains have no driver",
  "how a famous photograph was almost lost",
  "what a fire crew carries that nobody expects",
  "how a pizza oven reaches its temperature",
  "why a tennis ball is covered in fuzz",
  "how an airport finds lost luggage",
  "what a film editor throws away",
];

const SPEC = {
  A1: { count: "34 to 40", guidance: "Present simple and past simple only. The most common 800 words. No subordinate clauses." },
  A2: { count: "36 to 42", guidance: "Present, past and going-to future. Common words only. At most one short subordinate clause per sentence." },
  B1: { count: "38 to 44", guidance: "Mixed tenses, some linking words, a few phrasal verbs. Still one idea per sentence." },
  B2: { count: "38 to 46", guidance: "Natural spoken English, passives and conditionals allowed. One idea per sentence." },
  C1: { count: "40 to 48", guidance: "Precise vocabulary and natural idiom, but never a long sentence — the constraint is length, not difficulty." },
  C2: { count: "40 to 48", guidance: "Rich vocabulary and confident phrasing inside very short sentences. The difficulty is the words, never the syntax." },
};

function buildPrompt({ level, subject, avoidTitles }) {
  const spec = SPEC[level];
  return `Write one dictation lesson for a Russian speaker learning English at CEFR ${level}.

SUBJECT: ${subject}

THE ONE RULE THAT MATTERS
Every sentence will be heard once and typed from memory. So each one is SHORT: 25 to 50 characters, never more than 56, one idea each. Count the characters. A sentence a learner cannot hold in their head is a sentence they cannot type, and the whole lesson fails on it.

SHAPE: ${spec.count} sentences, in order, telling one connected story about the subject. ${spec.guidance}

MAKE IT WORTH FORTY SENTENCES
Somebody is going to type every one of these. Give them something they want to hear the end of: the detail that is stranger than expected, the reason behind a thing everybody has seen, the number that changes how it looks. Not a description — a small piece of knowledge that arrives.

HARD RULES
- Real people, teams, films and companies may be named, and nothing may be invented about them. Public, checkable facts only: no invented quotations, dates, figures or private life.
- No invented evidence: never "studies show", "data suggests" or anything of that shape.
- No wording taken from an article, a book or an interview. Every sentence is your own.
- Do not reuse any of these titles: ${avoidTitles.slice(0, 30).join("; ") || "(none yet)"}.

Return JSON exactly like this:
{
  "title": "3 to 6 words, concrete and intriguing, no colon",
  "sentences": [
    { "text": "One short English sentence.", "translationRu": "Естественный перевод на русский." }
  ]
}

- Every sentence needs a natural Russian translation, meaning for meaning.
- Output nothing but the JSON.`;
}

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.9,
      reasoning_effort: "low",
      max_completion_tokens: 5500,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Groq ${response.status}: ${(await response.text()).slice(0, 160)}`);
  return JSON.parse((await response.json()).choices[0].message.content);
}

async function callOpenai(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.9,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 160)}`);
  return JSON.parse((await response.json()).choices[0].message.content);
}

let engine = "groq";
const ask = (prompt) => (engine === "openai" ? callOpenai(prompt) : callGroq(prompt));

const MAX_CHARS = 56;

/**
 * Keeps the lesson only if it obeys the one rule.
 *
 * A fragment over the ceiling is not a slightly worse fragment, it is one the
 * learner cannot type — so the long ones are dropped rather than shipped, and
 * a lesson left too short by that is dropped whole.
 */
function validate(raw, level, subject) {
  const title = String(raw?.title ?? "").trim();
  if (!title) return { problems: ["no title"] };

  const sentences = [];
  let overlong = 0;
  for (const item of raw?.sentences ?? []) {
    const text = String(item?.text ?? "").trim();
    const ru = String(item?.translationRu ?? "").trim();
    if (!text || !ru) continue;
    if (!/[А-Яа-яЁё]/.test(ru)) continue;
    if (text.length > MAX_CHARS) {
      overlong++;
      continue;
    }
    sentences.push({ text, translationRu: ru });
  }

  if (sentences.length < 28) return { problems: [`only ${sentences.length} usable sentences (${overlong} too long)`] };

  return {
    text: {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48),
      level,
      topic: subject.split(" ").slice(0, 2).join("-").replace(/[^a-z-]/g, "") || "general",
      title,
      generated: true,
      sentences,
    },
    overlong,
    problems: [],
  };
}

function readAll() {
  const out = [];
  for (const name of readdirSync(OUT_DIR)) {
    if (!name.endsWith(".json")) continue;
    try {
      out.push(...JSON.parse(readFileSync(join(OUT_DIR, name), "utf8")));
    } catch {
      /* a malformed batch is not a reason to stop */
    }
  }
  return out;
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  if (args.includes("--openai")) engine = "openai";
  const count = args.includes("--count") ? Number(args[args.indexOf("--count") + 1]) : 6;
  const onlyLevel = args.includes("--level") ? args[args.indexOf("--level") + 1] : null;
  const dry = args.includes("--dry");

  const existing = readAll();
  const titles = existing.map((t) => t.title);
  const ids = new Set(existing.map((t) => t.id));

  if (dry) {
    console.log(JSON.stringify(await ask(buildPrompt({ level: "B1", subject: SUBJECTS[0], avoidTitles: titles })), null, 2));
    return;
  }

  const levels = onlyLevel ? [onlyLevel] : LEVELS;
  const jobs = [];
  let pick = existing.length;
  for (const level of levels) {
    for (let i = 0; i < count; i++) {
      jobs.push({ level, subject: SUBJECTS[pick % SUBJECTS.length] });
      pick++;
    }
  }

  console.log(`${jobs.length} lessons, model ${engine === "openai" ? OPENAI_MODEL : GROQ_MODEL}`);
  const made = [];
  let refusals = 0;

  for (const job of jobs) {
    let raw;
    try {
      raw = await ask(buildPrompt({ ...job, avoidTitles: titles }));
    } catch (error) {
      refusals++;
      console.warn(`  ✗ ${job.level} ${job.subject}: ${error.message}`);
      if (refusals >= 4) {
        console.warn("stopping: four refusals running");
        break;
      }
      await sleep(MIN_GAP_MS);
      continue;
    }
    refusals = 0;

    const result = validate(raw, job.level, job.subject);
    if (result.problems.length > 0) {
      console.warn(`  ✗ ${job.level} — ${result.problems.join(", ")}`);
    } else if (ids.has(result.text.id)) {
      console.warn(`  ✗ duplicate title "${result.text.title}"`);
    } else {
      ids.add(result.text.id);
      titles.push(result.text.title);
      made.push(result.text);
      const note = result.overlong > 0 ? ` (${result.overlong} dropped as too long)` : "";
      console.log(`  ✓ [${made.length}] ${job.level} — ${result.text.title}, ${result.text.sentences.length} lines${note}`);
      writeFileSync(join(OUT_DIR, "batch20.json"), `${JSON.stringify(made, null, 1)}\n`);
    }
    if (engine !== "openai") await sleep(MIN_GAP_MS);
  }

  console.log(`\n${made.length} lessons written to batch20.json`);
  console.log("next: python3 scripts/voice.py --voice tara   # speaks only the new lines");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
