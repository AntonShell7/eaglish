#!/usr/bin/env node
/**
 * Add words to src/data/offlineDictionary.json using the model.
 *
 * THIS SPENDS MONEY. It is a separate script, run by hand, rather than part
 * of the build, because filling the whole of frequency.json means thousands
 * of model calls — nobody should be able to trigger that by accident, and no
 * assistant should trigger it on somebody's account without being asked.
 *
 * Usage:
 *   OPENAI_API_KEY=... node scripts/extend-offline-dictionary.mjs --limit 200
 *   GROQ_API_KEY=...   node scripts/extend-offline-dictionary.mjs --limit 200
 *
 * Options:
 *   --limit N   how many new words to add this run (default 100)
 *   --from N    rank in frequency.json to start scanning from (default 0)
 *   --dry       print what it would ask for and exit
 *
 * It only ever adds. Existing entries are left exactly as they are, so a hand
 * -written translation is never overwritten by a model's guess, and the file
 * stays sorted so the diff of a run is readable.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DICT = resolve(root, "src/data/offlineDictionary.json");
const FREQ = resolve(root, "src/data/frequency.json");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(args[i + 1]);
};
const limit = flag("limit", 100);
const from = flag("from", 0);
const dry = args.includes("--dry");

/* Both providers speak the OpenAI chat-completions protocol, so the only
   difference is the host, the key and the model name. */
const openAiKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
const provider = openAiKey
  ? { url: "https://api.openai.com/v1/chat/completions", key: openAiKey, model: "gpt-4o-mini" }
  : groqKey
    ? { url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "openai/gpt-oss-120b" }
    : null;

if (!provider && !dry) {
  console.error("No OPENAI_API_KEY or GROQ_API_KEY in the environment. Nothing was called.");
  process.exit(1);
}

const dict = JSON.parse(readFileSync(DICT, "utf8"));
const freq = JSON.parse(readFileSync(FREQ, "utf8"));

/* Only plain lowercase words. The frequency list is web-derived and carries
   file extensions, brand names and fragments that are not worth a call. */
const wanted = freq
  .slice(from)
  .filter((w) => /^[a-z][a-z'-]{2,}$/.test(w) && !(w in dict))
  .slice(0, limit);

if (wanted.length === 0) {
  console.log("Nothing to add — every candidate in that range is already in the dictionary.");
  process.exit(0);
}

console.log(`${wanted.length} words to translate, ${Object.keys(dict).length} already stored.`);
if (dry) {
  console.log(wanted.join(" "));
  process.exit(0);
}

/* Batched: one call per 40 words rather than one per word. The task is small
   and uniform, and forty short answers come back reliably in one response. */
const BATCH = 40;
let added = 0;

for (let i = 0; i < wanted.length; i += BATCH) {
  const batch = wanted.slice(i, i + BATCH);
  const res = await fetch(provider.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.key}` },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Translate English words into Russian for a learner\'s dictionary. Give the most common everyday sense, in Cyrillic, lowercase, no explanations. Where a word is commonly two different parts of speech, separate the senses with "; ". Respond with strict JSON only: {"word": "перевод", ...}',
        },
        { role: "user", content: batch.join(", ") },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`Request failed: ${res.status} ${await res.text()}`);
    break;
  }

  const body = await res.json();
  let parsed;
  try {
    parsed = JSON.parse(body.choices?.[0]?.message?.content ?? "{}");
  } catch {
    console.error("Could not parse that batch, skipping it.");
    continue;
  }

  for (const [word, translation] of Object.entries(parsed)) {
    /* Checked rather than trusted, exactly as the app checks live lookups:
       the model sometimes answers a request for Russian with an English
       gloss, and a wrong translation in a dictionary is worse than a gap,
       because nobody goes back to verify it. */
    if (typeof translation !== "string" || !/[Ѐ-ӿ]/.test(translation)) continue;
    if (word in dict) continue;
    dict[word] = translation.trim().toLowerCase();
    added++;
  }

  console.log(`  ${Math.min(i + BATCH, wanted.length)} / ${wanted.length}`);
}

const sorted = Object.fromEntries(Object.keys(dict).sort().map((k) => [k, dict[k]]));
writeFileSync(DICT, JSON.stringify(sorted, null, 0) + "\n");
console.log(`Added ${added}. The dictionary now holds ${Object.keys(sorted).length} words.`);
console.log("Read the diff before committing — these are model answers, not checked ones.");
