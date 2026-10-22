#!/usr/bin/env node
/**
 * The pool of subjects the text generator offers when a learner has none.
 *
 * "Pick a subject for me" shipped with twenty of them and that was not a small
 * pool, it was a broken one: with twenty, five clicks repeat about half the
 * time, which reads as the button being fake. A pool has to be large enough
 * that a person never meets the same subject twice in a sitting, and varied
 * enough that meeting it a month later still feels like a find.
 *
 * So: a few hundred, written in batches, each batch told what the earlier ones
 * already used — the same anti-convergence trick the Advanced shelf needed,
 * for the same reason. Each subject is a pair: the Russian the learner reads
 * in the field, and the English sense, so the two interfaces offer the same
 * library rather than two different ones.
 *
 * Re-run it to refresh the pool; it appends rather than replaces, and drops
 * anything it has seen before.
 *
 * Usage:
 *   node scripts/generate-topics.mjs              # top the pool up to TARGET
 *   node scripts/generate-topics.mjs --count 60
 *   node scripts/generate-topics.mjs --dry
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "src/data/topicPool.json");
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const TARGET = 300;
const BATCH = 30;
const MIN_GAP_MS = 12000;

function loadEnv() {
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* The thirty families below are what stops four hundred subjects turning into
   four hundred ways of saying "technology and society". A batch is given one
   family and told to stay inside it. */
const FAMILIES = [
  "how ordinary objects are actually made",
  "why cities look the way they do",
  "the body doing something surprising",
  "money, prices and why they move",
  "sport, and what the numbers in it mean",
  "food: where it comes from and what it does",
  "weather, oceans and the sky",
  "animals behaving in ways that look like thinking",
  "language, writing and how meaning travels",
  "work, trades and the crafts nobody sees",
  "music, sound and what the ear does with them",
  "machines that everybody uses and nobody understands",
  "history that explains something still in use today",
  "medicine and the strange logic of the body's repairs",
  "space, time and the measuring of both",
  "law, rules and the accidents that wrote them",
  "transport: ships, planes, trains and why they work",
  "plants, farming and the ground underneath",
  "memory, attention and what the mind does badly",
  "buildings, bridges and what holds them up",
  "clothes, materials and the chemistry inside them",
  "games, puzzles and the mathematics hiding in them",
  "maps, borders and the arguments drawn on them",
  "fire, heat, cold and the energy in between",
  "crowds, queues and how groups decide",
  "colour, light and what the eye is fooled by",
  "rubbish, recycling and where things end up",
  "risk, luck and the mathematics of both",
  "sleep, rhythm and the clock inside a person",
  "the economics of something small and ordinary",
];

async function ask(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing — put it in .env.local");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Groq ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function buildPrompt(family, count, avoid) {
  return `Write ${count} subjects for short English reading texts aimed at adult learners.

FAMILY: ${family}
Stay inside this family. Every subject must plainly belong to it.

WHAT MAKES A GOOD SUBJECT HERE
- Concrete and specific. "Why ships float" is a subject; "the sea" is a category.
- Something a curious adult would click on without being a student: a real question with a real answer, or a mechanism that is stranger than it looks.
- Rich enough in vocabulary that a 400-700 word text about it would teach useful English — processes, materials, cause and effect, comparisons.
- Answerable without naming a real person, company, product or event, and without inventing statistics.
- Not a life-advice or self-improvement subject. No "how to be more productive".

Return JSON exactly like this:
{ "subjects": [ { "ru": "почему корабли не тонут", "en": "why ships float" } ] }

- "ru": the subject in Russian, lowercase, 3 to 8 words, no final full stop.
- "en": the same subject in natural English, lowercase, 3 to 8 words, no final full stop. Not a word-for-word gloss — the same question as an English speaker would put it.
- ${count} items, all different from each other.
- Do not repeat any of these, which already exist: ${avoid.slice(0, 160).join("; ") || "(none yet)"}.
- Output nothing but the JSON.`;
}

function readPool() {
  if (!existsSync(OUT)) return [];
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return [];
  }
}

const key = (s) => String(s ?? "").toLowerCase().trim().replace(/\s+/g, " ");

function clean(raw) {
  const ru = key(raw?.ru).replace(/[.!?]+$/, "");
  const en = key(raw?.en).replace(/[.!?]+$/, "");
  if (!ru || !en) return null;
  if (ru.split(" ").length > 12 || en.split(" ").length > 12) return null;
  return { ru, en };
}

async function main() {
  loadEnv();
  const args = process.argv.slice(2);
  const count = args.includes("--count") ? Number(args[args.indexOf("--count") + 1]) : null;
  const dry = args.includes("--dry");

  const pool = readPool();
  const seen = new Set(pool.map((p) => p.ru));
  const seenEn = new Set(pool.map((p) => p.en));
  const want = count ?? Math.max(0, TARGET - pool.length);

  if (dry) {
    console.log(JSON.stringify(await ask(buildPrompt(FAMILIES[0], 10, [])), null, 2));
    return;
  }
  if (want <= 0) {
    console.log(`pool already holds ${pool.length}`);
    return;
  }

  console.log(`${want} subjects wanted, pool holds ${pool.length}, model ${MODEL}`);
  let added = 0;
  let family = pool.length % FAMILIES.length;
  /* The free tier has a daily token ceiling as well as a per-minute one, and
     the daily one does not clear by waiting twelve seconds. Without this the
     runner retried a dead request every twelve seconds until somebody noticed
     — which is how the first fill of this pool ended. Four refusals in a row
     is the end of the run, and what exists is already written out. */
  let refusals = 0;

  while (added < want && refusals < 4) {
    const ask_for = Math.min(BATCH, want - added);
    const name = FAMILIES[family % FAMILIES.length];
    family++;

    let raw;
    try {
      raw = await ask(buildPrompt(name, ask_for, [...seen]));
    } catch (error) {
      refusals++;
      console.warn(`  ✗ ${name}: ${error.message}`);
      if (refusals >= 4) break;
      await sleep(MIN_GAP_MS);
      continue;
    }
    refusals = 0;

    let kept = 0;
    for (const item of raw?.subjects ?? []) {
      const subject = clean(item);
      if (!subject || seen.has(subject.ru) || seenEn.has(subject.en)) continue;
      seen.add(subject.ru);
      seenEn.add(subject.en);
      pool.push(subject);
      kept++;
      added++;
    }

    writeFileSync(OUT, `${JSON.stringify(pool, null, 1)}\n`);
    console.log(`  ✓ ${name}: +${kept} (pool ${pool.length})`);
    if (added < want) await sleep(MIN_GAP_MS);
  }

  if (refusals >= 4) console.warn("stopped early: the model refused four times running");
  console.log(`\npool holds ${pool.length} subjects`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
