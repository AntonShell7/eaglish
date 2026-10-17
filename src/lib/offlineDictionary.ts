/**
 * Translations that need no model and no network.
 *
 * The app's central promise is that tapping an unknown word costs nothing.
 * That promise was held together entirely by a model call: with the quota
 * spent, the key missing or the connection down, a tap produced an apology
 * and the word could not even be saved. For the commonest words — which are
 * most of what gets tapped — the answer does not need a model at all.
 *
 * This is a curated set rather than the top of `frequency.json`. That list is
 * web-corpus derived, so its highest ranks are "dvd", "shipping", "forum" and
 * "york" — words nobody stops on in a reading app. These are the content
 * words an A2–B1 reader actually pauses over.
 *
 * It is imported lazily so it never sits in the bundle a visitor downloads to
 * look at the front page, and it is consulted *after* the cache and *before*
 * the model: free and instant beats paid and slow, and both beat nothing.
 */

let loading: Promise<Record<string, string>> | null = null;

/** Loads once per session and is shared by every caller after that. */
function dictionary(): Promise<Record<string, string>> {
  if (!loading) {
    loading = import("@/data/offlineDictionary.json")
      .then((m) => m.default as Record<string, string>)
      .catch(() => ({}));
  }
  return loading;
}

/**
 * The stored translation, if this word is in the set.
 *
 * Only the exact lemma is matched. Guessing at inflections — stripping an "s"
 * or an "ed" — would turn "needs" into "need" correctly and "glasses" into
 * "glass" wrongly, and a confidently wrong translation in somebody's
 * vocabulary is worse than no translation at all: they will learn it.
 */
export async function offlineTranslation(word: string): Promise<string | null> {
  const key = word.trim().toLowerCase();
  if (!key || /[^a-z'-]/.test(key)) return null;
  const dict = await dictionary();
  return dict[key] ?? null;
}
