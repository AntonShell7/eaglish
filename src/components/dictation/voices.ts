/**
 * Which voices are allowed to read dictation.
 *
 * The browser hands over everything the system has, and on macOS that is two
 * dozen English voices of which more than half are toys: bells, bubbles, a
 * croak called Wobble, a voice named Bad News. Offering them next to a real
 * one is not neutrality, it is a list the learner has to clean up before they
 * can start.
 *
 * Filtering them out by name is complicated by the platform localising the
 * names — and the identifiers with them — so on a Russian system the list
 * reads "Пузырьки" and "Шутник". Hence an allowlist keyed by every spelling a
 * voice is known to appear under, rather than a blocklist that a new locale
 * would silently defeat.
 *
 * Anything the vendor ships as a premium voice is admitted on sight: Google,
 * Microsoft and Apple's downloadable Enhanced and Premium sets are all built
 * for reading prose aloud, and their names come from the vendor rather than
 * the locale.
 */

export interface CuratedVoice {
  voice: SpeechSynthesisVoice;
  /** Lower sorts first. */
  rank: number;
}

/** Speaking voices worth offering, by every name they are known under. */
const ALLOWED: { names: string[]; rank: number }[] = [
  // Clear, unhurried, and the closest thing on a stock machine to the voice
  // used for exam listening sections.
  { names: ["samantha", "саманта", "serena", "серена", "ava", "ава", "kate", "кейт"], rank: 0 },
  { names: ["daniel", "дэниэл", "дэниел", "oliver", "оливер", "arthur", "артур"], rank: 1 },
  { names: ["karen", "карен", "matilda", "матильда"], rank: 2 },
  { names: ["moira", "мойра", "tessa", "тесса", "fiona", "фиона"], rank: 3 },
  { names: ["rishi", "риши", "veena", "вина"], rank: 4 },
  { names: ["alex", "алекс", "tom", "том", "aaron", "аарон", "nicky", "ники"], rank: 5 },
];

const VENDOR = /google|microsoft|natural|neural|enhanced|premium|siri/i;

/** How many to show. More than this is a list, not a choice. */
const LIMIT = 5;

export function curateVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const english = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const picked: CuratedVoice[] = [];

  for (const voice of english) {
    const name = voice.name.toLowerCase();

    if (VENDOR.test(voice.name)) {
      picked.push({ voice, rank: -1 });
      continue;
    }

    const match = ALLOWED.find((entry) => entry.names.some((n) => name.includes(n)));
    if (match) picked.push({ voice, rank: match.rank });
  }

  // One voice per accent is enough variety; a second British voice adds a
  // choice nobody wants to make.
  const byAccent = new Map<string, CuratedVoice>();
  for (const entry of picked.sort((a, b) => a.rank - b.rank)) {
    const accent = entry.voice.lang.toLowerCase();
    if (!byAccent.has(accent)) byAccent.set(accent, entry);
  }

  const curated = [...byAccent.values()].sort((a, b) => a.rank - b.rank).slice(0, LIMIT);

  // Never leave the learner with nothing: an unknown system that matches none
  // of the above still gets its English voices, just unsorted.
  return curated.length > 0 ? curated.map((entry) => entry.voice) : english.slice(0, LIMIT);
}

/** "en-GB" → a name for the accent, not for the country. */
export function accentKey(lang: string): string {
  const code = lang.toLowerCase().split("-")[1] ?? "us";
  return ["us", "gb", "au", "ie", "in", "za", "ca", "nz"].includes(code) ? code : "other";
}
