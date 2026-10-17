/**
 * The three stores that never left the device they were written on.
 *
 * Which dictation lessons have been worked through, how far each slang
 * dialogue got, and the words the learner has marked "I already know this".
 * All three are real work and all three used to reset silently the moment the
 * app was opened anywhere else — a phone, a second laptop, the same machine
 * after a browser clear-out.
 *
 * The known-words list is the one that stings. Marking a word known is the
 * single most informative tap in the app: one piece of ground truth beats a
 * level's worth of assumption, and it keeps the review queue free of words
 * that were never a problem. Losing it means the learner is handed back words
 * they have already said they know — which teaches them, quickly and
 * correctly, that the app does not listen.
 *
 * Merging rather than overwriting, because two devices can both be right.
 * Per-item recency for the two keyed stores, union for the known list: an
 * "I know this" is a statement that stays true, so the only safe merge of two
 * lists is to keep both. Unmarking a word is therefore local until it is
 * unmarked everywhere, which is the right way round — wrongly forgetting a
 * learner's claim is worse than wrongly remembering it.
 */

import type { Progress } from "./dictationProgress";
import type { SlangResult } from "./slangProgress";

export interface SectionProgress {
  dictation: Record<string, Progress>;
  slang: Record<string, SlangResult>;
  knownWords: string[];
  updatedAt: number;
}

const DICTATION_KEY = "dictationProgress";
const SLANG_KEY = "slangProgress";
const KNOWN_KEY = "knownWords";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage unavailable. The section still works from memory this session. */
  }
}

/** Everything this device knows, as one object to send. */
export function getSectionProgress(): SectionProgress {
  return {
    dictation: readJson<Record<string, Progress>>(DICTATION_KEY, {}),
    slang: readJson<Record<string, SlangResult>>(SLANG_KEY, {}),
    knownWords: readJson<string[]>(KNOWN_KEY, []),
    updatedAt: Date.now(),
  };
}

/**
 * Fold a remote copy into the local one.
 *
 * Each dictation lesson and slang dialogue carries its own timestamp, so the
 * comparison is per item rather than per store: finishing lesson four on a
 * phone and lesson nine on a laptop should leave both finished, which a
 * whole-object "newest wins" would not.
 */
export function mergeSectionProgress(remote: Partial<SectionProgress> | null | undefined) {
  if (!remote) return;

  if (remote.dictation) {
    const local = readJson<Record<string, Progress>>(DICTATION_KEY, {});
    let changed = false;
    for (const [id, entry] of Object.entries(remote.dictation)) {
      if (!entry) continue;
      const mine = local[id];
      /* Further through the lesson wins, and a tie goes to whichever was
         recorded later. Position is the thing the learner cares about: being
         sent back to fragment three after reaching fragment twenty is the
         failure this is here to prevent. */
      const better =
        !mine || entry.index > mine.index || (entry.index === mine.index && (entry.at ?? 0) > (mine.at ?? 0));
      if (better) {
        local[id] = entry;
        changed = true;
      }
    }
    if (changed) writeJson(DICTATION_KEY, local);
  }

  if (remote.slang) {
    const local = readJson<Record<string, SlangResult>>(SLANG_KEY, {});
    let changed = false;
    for (const [id, entry] of Object.entries(remote.slang)) {
      if (!entry) continue;
      const mine = local[id];
      /* The better score wins, and the attempt counts add nothing useful
         when merged, so the whole record of the stronger run is taken. The
         store already keeps `bestCorrect` precisely so a retake can raise a
         score and never lower it; merging across devices follows the same
         rule for the same reason. */
      if (!mine || (entry.bestCorrect ?? 0) > (mine.bestCorrect ?? 0)) {
        local[id] = entry;
        changed = true;
      }
    }
    if (changed) writeJson(SLANG_KEY, local);
  }

  if (remote.knownWords?.length) {
    const local = readJson<string[]>(KNOWN_KEY, []);
    const merged = new Set([...local, ...remote.knownWords]);
    if (merged.size !== local.length) writeJson(KNOWN_KEY, [...merged]);
  }
}
