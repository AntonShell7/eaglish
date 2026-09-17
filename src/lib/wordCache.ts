import { supabase } from "./supabase";

/**
 * The shared word cache, from the browser's side.
 *
 * Tapping a word is the gesture the whole app is built on, and every tap used
 * to cost a model call. Vocabulary being what it is — a few thousand words
 * carrying most of any text — readers of the same library ask for the same
 * words over and over, so a lookup is worth computing once for everyone.
 *
 * Two layers. A per-session map answers a word the reader already tapped
 * without touching the network at all, and the Supabase table answers a word
 * anyone has ever tapped. Both are strictly optimisations: every function here
 * fails quietly, because a cache that can break the feature it speeds up is
 * worse than no cache.
 */

export interface CachedWord {
  word: string;
  translation?: string | null;
  partOfSpeech?: string | null;
  definition?: string | null;
  example?: string | null;
  synonyms?: string[] | null;
}

/** Survives navigation within a session; cleared on reload, which is fine. */
const session = new Map<string, CachedWord>();

/**
 * The cache key.
 *
 * Lowercased and stripped to letters, apostrophes and hyphens, so "Brittle,"
 * and "brittle" are one entry. Anything left empty or absurdly long is not
 * cacheable — that is a selection accident rather than a word.
 */
export function cacheKey(word: string): string | null {
  const key = word.trim().toLowerCase().replace(/[^a-z'\s-]/g, "").trim();
  if (!key || key.length > 80) return null;
  return key;
}

export async function readCache(word: string): Promise<CachedWord | null> {
  const key = cacheKey(word);
  if (!key) return null;

  const local = session.get(key);
  if (local) return local;

  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("word_cache")
      .select("word, translation, part_of_speech, definition, example, synonyms")
      .eq("word", key)
      .maybeSingle();

    if (error || !data) return null;

    const entry: CachedWord = {
      word: data.word,
      translation: data.translation,
      partOfSpeech: data.part_of_speech,
      definition: data.definition,
      example: data.example,
      synonyms: data.synonyms,
    };
    session.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

/**
 * Store what the model returned.
 *
 * The two modes fill different columns and arrive at different times, so this
 * merges rather than replaces: asking for the English explanation of a word
 * that was already translated must not erase the translation.
 */
export async function writeCache(word: string, fields: Omit<CachedWord, "word">): Promise<void> {
  const key = cacheKey(word);
  if (!key) return;

  const merged: CachedWord = { ...(session.get(key) ?? { word: key }), ...fields, word: key };
  session.set(key, merged);

  if (!supabase) return;

  const row: Record<string, unknown> = { word: key, updated_at: new Date().toISOString() };
  if (fields.translation) row.translation = fields.translation;
  if (fields.partOfSpeech) row.part_of_speech = fields.partOfSpeech;
  if (fields.definition) row.definition = fields.definition;
  if (fields.example) row.example = fields.example;
  if (fields.synonyms?.length) row.synonyms = fields.synonyms;

  try {
    // Upsert rather than insert: another reader may have cached the other mode
    // of the same word a second earlier, and neither of us should lose.
    await supabase.from("word_cache").upsert(row, { onConflict: "word" });
  } catch {
    // A cache write failing is invisible to the learner, and should stay that way.
  }
}
