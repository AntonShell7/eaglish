import { readingTexts as curated, type ReadingText } from "./readingTexts";
import levelIndex from "./reading/index.json";

/**
 * The reading library, addressed by level.
 *
 * It used to be addressed by subject — ten topics, each written across the
 * whole CEFR range, and the first thing the page asked was "animals or
 * sport?". That is the wrong first question. A learner does not open a reading
 * app to pick a genre; they open it to read something they can actually read,
 * and a B1 reader handed a C2 text about sport has been handed nothing. Every
 * topic card also said "A1–C2", which is a fact that is identical on ten cards
 * and therefore not a fact on a card at all.
 *
 * So the shelf is four bands now, and the subject of a text is its title's
 * business. The chunks are per band for the same reason they were per topic:
 * two hundred bilingual texts is most of a megabyte, and nobody should
 * download the C-level shelf to read an A2 piece.
 *
 * The hand-written texts in `readingTexts.ts` are folded into whichever band
 * their level puts them in, so nothing about them depends on a generator.
 */

export type LevelBand = "a1-a2" | "b1-b2" | "c1-c2" | "advanced";

export const LEVEL_BANDS: LevelBand[] = ["a1-a2", "b1-b2", "c1-c2", "advanced"];

export interface ReadingLevel {
  id: LevelBand;
  counts: Record<string, number>;
  total: number;
}

/** Which band a CEFR level belongs to. "advanced" is never derived: it is a
 *  shelf of its own, filled only by what is written for it. */
export function bandOf(level: string): LevelBand {
  if (level === "A1" || level === "A2") return "a1-a2";
  if (level === "B1" || level === "B2") return "b1-b2";
  return "c1-c2";
}

function curatedFor(band: LevelBand): ReadingText[] {
  return band === "advanced" ? [] : curated.filter((text) => bandOf(text.level) === band);
}

export const readingLevels: ReadingLevel[] = (levelIndex as unknown as ReadingLevel[]).map((entry) => {
  const extra = curatedFor(entry.id);
  const counts = { ...entry.counts };
  for (const text of extra) counts[text.level] = (counts[text.level] ?? 0) + 1;
  return { ...entry, counts, total: entry.total + extra.length };
});

export const readingLibrarySize = readingLevels.reduce((sum, level) => sum + level.total, 0);

export function findLevel(id: string): ReadingLevel | undefined {
  return readingLevels.find((level) => level.id === id);
}

const cache = new Map<string, ReadingText[]>();

/**
 * Loads one band. A missing chunk is not an error — "advanced" exists in the
 * index before anything has been written for it, and the hand-written texts
 * should still show up either way.
 */
export async function loadLevelTexts(band: string): Promise<ReadingText[]> {
  const cached = cache.get(band);
  if (cached) return cached;

  let generated: ReadingText[] = [];
  try {
    const chunk = await import(`./reading/${band}.json`);
    generated = (chunk.default ?? []) as ReadingText[];
  } catch {
    generated = [];
  }

  const texts = [...curatedFor(band as LevelBand), ...generated];
  cache.set(band, texts);
  return texts;
}

export function wordCount(text: ReadingText): number {
  return text.sentences.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
}
