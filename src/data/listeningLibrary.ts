import batch3 from "./listening/batch3.json";
import batch4 from "./listening/batch4.json";
import batch5 from "./listening/batch5.json";
import batch6 from "./listening/batch6.json";
import batch7 from "./listening/batch7.json";
import batch8 from "./listening/batch8.json";
import batch9 from "./listening/batch9.json";
import batch10 from "./listening/batch10.json";
import batch11 from "./listening/batch11.json";
import batch12 from "./listening/batch12.json";
import batch13 from "./listening/batch13.json";
import batch14 from "./listening/batch14.json";
import batch15 from "./listening/batch15.json";
import batch16 from "./listening/batch16.json";
import batch17 from "./listening/batch17.json";
import batch18 from "./listening/batch18.json";
import batch19 from "./listening/batch19.json";
import batch20 from "./listening/batch20.json";
import batch21 from "./listening/batch21.json";
import type { ReadingText } from "./readingTexts";

/**
 * The dictation library.
 *
 * Separate from the reading shelf, because these are a different kind of text
 * and the difference is measurable rather than a matter of taste. A reading
 * piece is written for the eye: its sentences can run long, because a reader
 * can go back. A dictation fragment has to be held in the head while it is
 * typed, which puts a hard ceiling on its length.
 *
 * Measured across both libraries, reading sentences run to a median of 67
 * characters and a maximum of 324, with a fifth of them over 120. These run to
 * a median of 35 and a maximum of 56, with none over 98. That is the whole
 * reason the two shelves are not one shelf.
 *
 * The first seven texts written here have been removed rather than kept. They
 * predated the rule and showed it: a median of 45 and a maximum of 98, one of
 * them only 25 fragments long. They were replaced rather than tightened,
 * because a text written to a different constraint reads as one.
 *
 * They are written rather than collected. Public-domain books are the wrong
 * register — nineteenth-century prose is nobody's spoken English — and
 * anything under a share-alike licence would tie a commercial product to that
 * licence. Writing them also buys the two things dictation specifically needs:
 * control of the level, and fragments short enough to be typed from memory.
 *
 * Eight texts at each of the six levels, six in each of eight topics, and no
 * subject repeated from the 120 reading texts — checked, not assumed.
 */
/*
 * One file per batch, merged here. Written material arrives a few pieces at a
 * time — each one is an hour of writing rather than a generator run — and a
 * single growing file would turn every addition into a diff nobody can read.
 */
export const listeningTexts = [
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
  ...batch12,
  ...batch13,
  ...batch14,
  ...batch15,
  ...batch16,
  ...batch17,
  ...batch18,
  ...batch19,
  // Written rather than hand-written, under a brief of its own: see
  // scripts/generate-listening.mjs. The fragment ceiling is what makes these
  // typable, and it is enforced by throwing away the lines that break it.
  ...batch20,
  // The Advanced shelf: a register rather than a band, so these carry
  // `register: "advanced"` and are filed by it rather than by their level.
  ...batch21,
] as ReadingText[];

export const listeningCount = listeningTexts.length;

/**
 * The shelf, by level rather than by subject.
 *
 * It was eight topics — animals, food, sport — and the first question the page
 * asked was which of them you fancied. That is the wrong first question for a
 * dictation: what decides whether a fragment can be typed from memory is its
 * level, not whether it is about a bicycle. The subject of a lesson is its
 * title's business now.
 */
export const listeningBands = ["a1-a2", "b1-b2", "c1-c2", "advanced"] as const;

export type ListeningBand = (typeof listeningBands)[number];

export function bandOfLevel(level: string): ListeningBand {
  if (level === "A1" || level === "A2") return "a1-a2";
  if (level === "B1" || level === "B2") return "b1-b2";
  return "c1-c2";
}

/**
 * Which shelf a lesson belongs on.
 *
 * Advanced is a register and not a level — idiom and literary vocabulary
 * inside sentences short enough to type from memory — so it cannot be derived
 * from a CEFR band. A lesson written for that shelf says so, and everything
 * else is filed by its level as before.
 */
export function bandOfText(text: { level: string; register?: string }): ListeningBand {
  return text.register === "advanced" ? "advanced" : bandOfLevel(text.level);
}

/** How many lessons each band holds, and at which levels inside it. */
export function listeningShelf() {
  const out = new Map<string, { total: number; counts: Record<string, number> }>();
  for (const band of listeningBands) out.set(band, { total: 0, counts: {} });
  for (const text of listeningTexts) {
    const entry = out.get(bandOfText(text));
    if (!entry) continue;
    entry.total += 1;
    entry.counts[text.level] = (entry.counts[text.level] ?? 0) + 1;
  }
  return [...out.entries()].map(([id, value]) => ({ id, ...value }));
}
