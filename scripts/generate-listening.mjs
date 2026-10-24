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

/*
 * The Advanced shelf, and the only brief in this file that Anton specified
 * himself — ten subjects put to him, all ten chosen, and what they have in
 * common is the whole instruction: a mechanism explained concretely, a named
 * thing somebody already half-knows, and a fact at the end that pays for the
 * forty lines it took to type.
 *
 * The register is hard words in easy syntax. That is not a compromise forced
 * by the fragment ceiling, it is the point: a learner who can follow the
 * grammar is free to spend all their attention on the vocabulary, which is
 * the part they came for.
 */
const ADVANCED_SUBJECTS = [
  "why a Formula 1 pit stop takes twenty people and two seconds",
  "what a film's sound team records when the screen is silent",
  "how one basketball endorsement built a sportswear empire",
  "how a creator works out whether a video pays before filming it",
  "why you recognise a song in half a second",
  "how a stadium is built so the pitch can be driven out of it",
  "why one animation studio tells the same story for a century",
  "what happens inside a boxer's body across three minutes",
  "why Formula 1 rewrites its rules so nobody wins too long",
  "why the most expensive watches keep worse time than cheap ones",
  "what a football club's medical staff know by Tuesday",
  "how a concert tour decides which cities it can afford",
  "what a cinema projectionist did that nobody replaced",
  "why a goalkeeper's gloves are replaced every few matches",
  "how a streaming service prices a country it is losing money in",
  "what a stunt coordinator negotiates before a single take",
  "why a sprinter's start is decided before the gun",
  "how a luxury brand decides what never goes on sale",
  "what a video game studio does with a delayed release",
  "why a marathon course is measured by bicycle",
  "how an orchestra tunes to one note and why that note",
  "what a Formula 1 driver's neck is trained to survive",
  "why a film is edited to music that will not be used",
  "how a football transfer fee is actually paid",

  /* A second set, same shape: a mechanism taken apart, a named thing
     somebody already half-knows, and a fact at the end worth repeating. */
  "what a Premier League groundsman does on a Monday",
  "how a film trailer is cut before the film is finished",
  "why a tennis player changes racket mid-match",
  "what an airline does with a plane overnight",
  "how a record label decides which song is the single",
  "why a Michelin inspector eats alone",
  "what a Formula 1 wind tunnel is actually measuring",
  "how a video game is tested by people paid to break it",
  "why a boxing weigh-in happens the day before",
  "what a museum conservator does to a painting nobody sees",
  "how an NBA team decides who to trade at the deadline",
  "why a skyscraper is designed to sway",
  "what a sommelier is doing when they swirl the glass",
  "how a Disney park moves a crowd without it noticing",
  "why a football kit is redesigned every season",
  "what a submarine crew does about sound",
  "how an auction house sets a reserve price",
  "why a marathon's final mile is the one that breaks people",
  "what a concert's front-of-house engineer controls",
  "how a watch brand decides a model will be discontinued",
  "why an Olympic pool is deeper than a normal one",
  "what a football scout writes down",
  "how a theatre handles an actor falling ill at the interval",
  "why a Grand Slam court is resurfaced between tournaments",
  "what a chef does with a dish that keeps coming back",
  "how a stadium decides what the air smells like",
];

const ADVANCED_SPEC = {
  count: "40 to 48",
  guidance:
    "Rich, exact vocabulary inside very short sentences. The difficulty is the words, never the syntax: a confident B1 reader should follow every sentence and still meet English no coursebook prints. Name the real thing — the club, the studio, the brand — and say only what is public and checkable.",
  /* Counted requirements rather than described ones. The first run came back
     with "pit stops are a marvel" and "their timing must be impeccable",
     which is a B2 text with three nice adjectives in it: asking for an
     advanced register in the abstract gets ordinary English written
     confidently. These are the floor. */
  extra: `ADVANCED MEANS THIS, COUNTABLY
- At least 12 sentences must carry a word or phrase an intermediate learner would not produce themselves. Precise verbs (hoist, slot, brace, shear, taper), exact nouns (clearance, tolerance, margin, cadence, sequence), and the vocabulary of the trade being described.
- At least 5 idioms or figurative expressions, spread through the lesson, never two in a row, never explained.
- Never a sentence whose only content is an adjective of praise. "It is a marvel", "their timing is impeccable", "it is truly remarkable" — these are padding and they are banned. If a sentence does not add a fact, a step or a reason, cut it.

HOW IT OPENS
On the thing itself, mid-action, with a concrete detail. Not "Formula 1 pit stops are a marvel" but "The car stops within a painted box." Never open by announcing the subject or by praising it.`,
};

const SPEC = {
  A1: { count: "34 to 40", guidance: "Present simple and past simple only. The most common 800 words. No subordinate clauses." },
  A2: { count: "36 to 42", guidance: "Present, past and going-to future. Common words only. At most one short subordinate clause per sentence." },
  B1: { count: "38 to 44", guidance: "Mixed tenses, some linking words, a few phrasal verbs. Still one idea per sentence." },
  B2: { count: "38 to 46", guidance: "Natural spoken English, passives and conditionals allowed. One idea per sentence." },
  C1: { count: "40 to 48", guidance: "Precise vocabulary and natural idiom, but never a long sentence — the constraint is length, not difficulty." },
  C2: { count: "40 to 48", guidance: "Rich vocabulary and confident phrasing inside very short sentences. The difficulty is the words, never the syntax." },
};

function buildPrompt({ level, subject, avoidTitles, advanced }) {
  const spec = advanced ? ADVANCED_SPEC : SPEC[level];
  return `Write one dictation lesson for a Russian speaker learning English${advanced ? " at an advanced level" : ` at CEFR ${level}`}.

SUBJECT: ${subject}

THE ONE RULE THAT MATTERS
Every sentence will be heard once and typed from memory. So each one is SHORT: 25 to 50 characters, never more than 56, one idea each. Count the characters. A sentence a learner cannot hold in their head is a sentence they cannot type, and the whole lesson fails on it.

SHAPE: ${spec.count} sentences, in order, telling one connected story about the subject. ${spec.guidance}
${spec.extra ?? ""}

MAKE IT WORTH FORTY SENTENCES
Somebody is going to type every one of these. Give them something they want to hear the end of: the detail that is stranger than expected, the reason behind a thing everybody has seen, the number that changes how it looks. Not a description — a small piece of knowledge that arrives.

HOW TO BUILD IT
Open on the thing itself, not on context. Then take it apart: who does what, in what order, and why it has to be that order. Name the real club, studio or brand where there is one. End on the fact that reframes the rest — the part a listener repeats to somebody else the next day. Never pad: forty short sentences is a lot of typing and every one has to earn itself.

HARD RULES
- Real people, teams, films and companies may be named, and nothing may be invented about them. Public, checkable facts only: no invented quotations, dates, figures or private life.
- No invented evidence: never "studies show", "data suggests" or anything of that shape.
- No wording taken from an article, a book or an interview. Every sentence is your own.
- Rules and practices change, and a detail that was true once is not true now. The first draft of this very brief had a Formula 1 crew refuelling during a pit stop, which has been banned since 2010. If you are not certain a detail is current, leave it out: the lesson loses one sentence and keeps its credibility.
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
function validate(raw, level, subject, advanced) {
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
      ...(advanced ? { register: "advanced" } : {}),
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

  const advanced = args.includes("--advanced");
  const jobs = [];

  if (advanced) {
    /* The shelf's own subjects, in order, so a top-up continues the list
       instead of going round it. */
    const have = existing.filter((t) => t.register === "advanced").length;
    if (have + count > ADVANCED_SUBJECTS.length) {
      console.warn(
        `  ! ${have} lessons and ${count} more wanted, but only ${ADVANCED_SUBJECTS.length} subjects exist.`,
      );
    }
    for (let i = 0; i < count; i++) {
      jobs.push({
        level: i % 2 === 0 ? "C1" : "C2",
        advanced: true,
        subject: ADVANCED_SUBJECTS[(have + i) % ADVANCED_SUBJECTS.length],
      });
    }
  } else {
    const levels = onlyLevel ? [onlyLevel] : LEVELS;
    let pick = existing.length;
    for (const level of levels) {
      for (let i = 0; i < count; i++) {
        jobs.push({ level, subject: SUBJECTS[pick % SUBJECTS.length] });
        pick++;
      }
    }
  }

  const outFile = advanced ? "batch21.json" : "batch20.json";
  /*
   * What is already in the file this run writes to.
   *
   * The run used to write out only what it had just made, which is correct
   * for the first run of a batch and destroys the previous twenty-four on the
   * second. The file is the shelf, not the session.
   */
  const outPath = join(OUT_DIR, outFile);
  const made = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : [];
  const before = made.length;
  console.log(`${jobs.length} lessons → ${outFile}, model ${engine === "openai" ? OPENAI_MODEL : GROQ_MODEL}`);
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

    const result = validate(raw, job.level, job.subject, job.advanced);
    if (result.problems.length > 0) {
      console.warn(`  ✗ ${job.level} — ${result.problems.join(", ")}`);
    } else if (ids.has(result.text.id)) {
      console.warn(`  ✗ duplicate title "${result.text.title}"`);
    } else {
      ids.add(result.text.id);
      titles.push(result.text.title);
      made.push(result.text);
      const note = result.overlong > 0 ? ` (${result.overlong} dropped as too long)` : "";
      console.log(`  ✓ [${made.length - before}] ${job.level} — ${result.text.title}, ${result.text.sentences.length} lines${note}`);
      writeFileSync(outPath, `${JSON.stringify(made, null, 1)}\n`);
    }
    if (engine !== "openai") await sleep(MIN_GAP_MS);
  }

  console.log(`\n${made.length - before} new lessons, ${made.length} in ${outFile}`);
  console.log("next: python3 scripts/voice.py --voice tara   # speaks only the new lines");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
