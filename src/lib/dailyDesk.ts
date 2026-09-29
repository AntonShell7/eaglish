import { getVocabulary } from "./vocabularyStore";
import { normalise } from "./lexicon";
import {
  generatePersonalText,
  getPersonalTexts,
  type PersonalText,
} from "./personalText";
import type { ReadingLevel } from "./placement";

/**
 * The three texts at the top of Reading, and when they turn over.
 *
 * A fixed library can only put a word back in front of you by accident. These
 * three are written around the words the learner saved most recently — the
 * ones still fragile enough that meeting them in a sentence is what makes them
 * stick — and they are replaced on a daily cycle so the desk is never the same
 * desk two mornings running.
 *
 *
 * WHY THE REFRESH RUNS ON OPEN RATHER THAN AT MIDNIGHT
 *
 * There is no server here: generation happens in the browser against the app's
 * own AI endpoint. So nothing can fire at 00:00 for everybody, and that turns
 * out to be the right answer rather than a limitation. A learner who does not
 * open the app costs nothing, which is most of the token bill avoided; and
 * because people open apps at different moments, the load is already spread
 * across the day without anyone arranging it.
 *
 * What the day boundary still needs is a stagger, because the people who *do*
 * open the app just after midnight would otherwise all arrive at once. Each
 * learner gets a stable offset of up to an hour, derived from their own id, so
 * one person's day turns over at 00:00 and the next person's at 00:37. Nobody
 * notices — the texts are new when they arrive either way — and no single
 * minute carries the whole population.
 *
 *
 * WHAT GETS REPLACED
 *
 * Three rules, in order:
 *
 * 1. A text that was read is always replaced. It has done its job: the words
 *    were met, looked up and reviewed, and re-reading it teaches nothing. This
 *    rule has no exceptions.
 * 2. A text that was not read is kept, unless the learner has saved enough new
 *    words since it was written that it is now about the wrong vocabulary. An
 *    unread text is not a failure — it is a text the learner has not got to
 *    yet — and throwing it away every night to spend tokens rewriting it would
 *    be the most expensive possible way to be unhelpful.
 * 3. If there are not enough saved words to build a text around at all,
 *    nothing is generated and the section says so. Reading four hundred words
 *    to meet one saved word is worse than reading nothing.
 *
 * The cases the learner described all fall out of those three. Read all three
 * texts and all three are replaced. Read one and add nothing, and only that
 * one is replaced. Add a pile of new words and all three go, because every one
 * of them is now about last week's vocabulary.
 */

/** The learning words a text is built around. Below four it is not worth reading. */
const MIN_WORDS = 4;
const MAX_WORDS = 7;
/** How many texts sit on the desk. */
const SLOTS = 3;
/**
 * New words saved since a text was written that make it stale even unread.
 * One new word does not date a text; a text's worth of them does.
 */
const STALE_AFTER_NEW_WORDS = MIN_WORDS;

const DAY_MS = 24 * 60 * 60 * 1000;
const DESK_KEY = "dailyDesk";
const SLOT_KEY = "deskSlotMinutes";
/** How far a learner's day boundary can be pushed past midnight. */
const STAGGER_MINUTES = 60;

export interface DeskEntry {
  text: PersonalText;
  /** Finished — the quiz was completed. Always replaced at the turn. */
  read: boolean;
  /** How many words the learner had when this was written, for the stale test. */
  vocabularyAt: number;
}

interface Desk {
  /** The learning day this desk belongs to, counted from the epoch. */
  day: number;
  entries: DeskEntry[];
}

/* ── The learner's own day boundary ───────────────────────────────────── */

/**
 * A stable offset in minutes, 0..59.
 *
 * Derived from the account id where there is one, so the same person gets the
 * same slot on every device and the stagger survives a reinstall. Without an
 * id it falls back to a number drawn once and kept — which is still stable for
 * that browser, and a signed-out learner is a single client either way.
 */
export function deskSlotMinutes(userId?: string | null): number {
  if (userId) {
    // FNV-1a: tiny, deterministic, and good enough to spread ids evenly across
    // an hour. Nothing here depends on it being hard to reverse.
    let hash = 0x811c9dc5;
    for (let i = 0; i < userId.length; i += 1) {
      hash ^= userId.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return Math.abs(hash) % STAGGER_MINUTES;
  }
  try {
    const saved = localStorage.getItem(SLOT_KEY);
    if (saved !== null) {
      const n = Number(saved);
      if (Number.isFinite(n)) return ((n % STAGGER_MINUTES) + STAGGER_MINUTES) % STAGGER_MINUTES;
    }
    const drawn = Math.floor(Math.random() * STAGGER_MINUTES);
    localStorage.setItem(SLOT_KEY, String(drawn));
    return drawn;
  } catch {
    return 0;
  }
}

/**
 * Which learning day it is for this learner.
 *
 * Local time, then pushed back by the learner's slot, so their day turns over
 * some minutes after midnight rather than on it. Using the local offset rather
 * than UTC matters: a desk that refreshes at 3am because the server is in
 * another timezone is a desk that refreshed in the middle of the evening.
 */
export function learningDay(userId?: string | null, now = new Date()): number {
  const local = now.getTime() - now.getTimezoneOffset() * 60_000;
  return Math.floor((local - deskSlotMinutes(userId) * 60_000) / DAY_MS);
}

/* ── Storage ──────────────────────────────────────────────────────────── */

function readDesk(): Desk | null {
  try {
    const raw = localStorage.getItem(DESK_KEY);
    if (!raw) return null;
    const desk = JSON.parse(raw) as Desk;
    return Array.isArray(desk.entries) ? desk : null;
  } catch {
    return null;
  }
}

function writeDesk(desk: Desk) {
  try {
    localStorage.setItem(DESK_KEY, JSON.stringify(desk));
  } catch {
    // A desk that cannot be remembered is rebuilt next time. Annoying, never
    // broken — and worth nothing to crash the page over.
  }
}

export function getDesk(): DeskEntry[] {
  return readDesk()?.entries ?? [];
}

/**
 * Marks a text finished, so the next turn replaces it.
 *
 * Called when the comprehension quiz is completed, which is the one signal
 * that the learner reached the end rather than opening it and leaving. A text
 * opened and abandoned is deliberately not counted: replacing something
 * nobody got to is how a learner loses a text they meant to come back to.
 */
export function markDeskTextRead(textId: string) {
  const desk = readDesk();
  if (!desk) return;
  let touched = false;
  for (const entry of desk.entries) {
    if (entry.text.id === textId && !entry.read) {
      entry.read = true;
      touched = true;
    }
  }
  if (touched) writeDesk(desk);
}

/* ── Choosing the words ───────────────────────────────────────────────── */

/**
 * The pool the day's texts are drawn from: freshest first.
 *
 * Newest rather than most-due, and that is a deliberate difference from the
 * review queue. The scheduler's job is to catch a word before it is lost; this
 * text's job is to show a word the learner has just met being *used* — what it
 * is for, what company it keeps, why it exists beyond its translation. A word
 * saved an hour ago has a translation attached to it and nothing else, and
 * that is the word that most needs a sentence around it.
 *
 * Multi-word phrases are skipped. A text cannot use "make a decision" twice in
 * different places without sounding like it is trying to.
 */
function freshPool(): string[] {
  const pool: string[] = [];
  const seen = new Set<string>();
  // getVocabulary is already newest-first.
  for (const word of getVocabulary()) {
    const key = normalise(word.word);
    if (!key || seen.has(key) || /\s/.test(word.word.trim())) continue;
    seen.add(key);
    pool.push(word.word);
    // Three overlapping windows never reach past this, and a longer list only
    // drags older words into a section that exists for the newest ones.
    if (pool.length >= MAX_WORDS * SLOTS) break;
  }
  return pool;
}

/**
 * The words for one slot: a sliding window over the pool.
 *
 * The first version handed each text a disjoint set, which meant three texts
 * needed twelve fresh words and a learner with eight got one text. Overlapping
 * windows fix that, and they turn out to be better teaching anyway: meeting
 * the same new word in three unrelated texts on the same day is exactly the
 * varied repetition the whole product is built on, and far more useful than
 * meeting twenty-one words once each.
 *
 * The windows still move, so a long list spreads across the three rather than
 * showing the same six words three times.
 */
function windowFor(pool: string[], slot: number): string[] {
  if (pool.length === 0) return [];
  const size = Math.min(MAX_WORDS, pool.length);
  const step = Math.max(2, Math.floor(pool.length / SLOTS));
  const start = (slot * step) % pool.length;
  const out: string[] = [];
  for (let i = 0; i < size; i += 1) out.push(pool[(start + i) % pool.length]);
  return out;
}

/* ── The turn ─────────────────────────────────────────────────────────── */

export type DeskStatus =
  | { kind: "ready"; entries: DeskEntry[] }
  /** Not enough saved words to write anything worth reading. */
  | { kind: "tooFewWords"; have: number; need: number }
  /** The model could not be reached; whatever survived from yesterday is shown. */
  | { kind: "partial"; entries: DeskEntry[] };

/**
 * The refresh currently running, if any.
 *
 * Two callers must never both generate. React runs an effect twice on mount in
 * development, and a learner who leaves Reading and comes straight back mounts
 * it again — either one would start a second refresh while the first was still
 * writing, and the two would race to produce the same three texts at double
 * the cost. Everyone who asks while one is in flight gets that same promise.
 */
let inFlight: { day: number; promise: Promise<DeskStatus> } | null = null;

export interface DeskOptions {
  level: ReadingLevel;
  /** Topics the learner chose, so three texts in a day are not three of the same. */
  topics: string[];
  userId?: string | null;
  /** Called after each text lands, so the page fills in as they arrive. */
  onProgress?: (entries: DeskEntry[]) => void;
}

/**
 * Brings the desk up to date, generating only what actually needs generating.
 *
 * Sequential on purpose. Three requests fired together is three times the
 * burst for no gain — nobody reads three texts in the second they appear — and
 * a serial queue means a slow or failing endpoint degrades into "two texts
 * today" instead of into three simultaneous timeouts. Each text is stored as
 * soon as it lands, so closing the tab halfway costs nothing already paid for.
 */
export function refreshDesk(options: DeskOptions): Promise<DeskStatus> {
  const today = learningDay(options.userId);
  if (inFlight && inFlight.day === today) return inFlight.promise;

  const promise = runRefresh(options, today).finally(() => {
    if (inFlight?.promise === promise) inFlight = null;
  });
  inFlight = { day: today, promise };
  return promise;
}

async function runRefresh(options: DeskOptions, today: number): Promise<DeskStatus> {
  const { level, topics, onProgress } = options;
  const desk = readDesk();
  const vocabularySize = getVocabulary().length;

  if (vocabularySize < MIN_WORDS) {
    return { kind: "tooFewWords", have: vocabularySize, need: MIN_WORDS };
  }

  /* Same day: nothing turns over. The desk is whatever it already was, read
     marks and all. This is the overwhelmingly common path and it costs one
     localStorage read. */
  if (desk && desk.day === today) {
    return { kind: "ready", entries: desk.entries };
  }

  const previous = desk?.entries ?? [];

  /* What survives. A read text never does. An unread one does, unless the
     learner has saved a text's worth of new words since it was written — at
     which point it is about the wrong vocabulary, whoever has read it. */
  const kept = previous.filter((entry) => {
    if (entry.read) return false;
    const newSince = vocabularySize - entry.vocabularyAt;
    return newSince < STALE_AFTER_NEW_WORDS;
  });

  const entries = [...kept];
  const missing = SLOTS - entries.length;

  if (missing <= 0) {
    writeDesk({ day: today, entries });
    return { kind: "ready", entries };
  }

  const pool = freshPool();
  if (pool.length < MIN_WORDS) {
    writeDesk({ day: today, entries });
    return entries.length > 0
      ? { kind: "ready", entries }
      : { kind: "tooFewWords", have: pool.length, need: MIN_WORDS };
  }

  /* Surviving texts keep their slot, so a new one starts its window where they
     left off rather than teaching the same words over again. */
  let slot = entries.length;

  let failed = false;
  for (let i = 0; i < missing; i += 1, slot += 1) {
    const targets = windowFor(pool, slot);
    if (targets.length < MIN_WORDS) break;

    const topic = topics.length > 0 ? topics[slot % topics.length] : "everyday life";
    const result = await generatePersonalText({ level, topic, targets });

    if ("error" in result) {
      failed = true;
      break;
    }

    entries.push({ text: result.text, read: false, vocabularyAt: vocabularySize });
    // Stored as it lands, not at the end: a text already paid for should
    // survive the tab being closed.
    writeDesk({ day: today, entries });
    onProgress?.([...entries]);
  }

  if (failed) {
    /* A failed refresh must never leave an empty desk. Yesterday's texts —
       including ones already read — are worth more than a blank section, and
       the day is left unmarked so the next visit tries again rather than
       waiting until tomorrow. */
    if (entries.length === 0 && previous.length > 0) {
      writeDesk({ day: desk?.day ?? today, entries: previous });
      return { kind: "partial", entries: previous };
    }
    if (entries.length < SLOTS) {
      writeDesk({ day: desk?.day ?? today, entries });
      return { kind: "partial", entries };
    }
  }

  writeDesk({ day: today, entries });
  return { kind: "ready", entries };
}

/** Everything the desk has ever shown, for the history view. */
export function deskHistory(): PersonalText[] {
  const live = new Set(getDesk().map((e) => e.text.id));
  return getPersonalTexts().filter((text) => !live.has(text.id));
}
