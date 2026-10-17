import { getUntranslated, setTranslation } from "./vocabularyStore";
import { lookupWord } from "./translate";

/**
 * Fill in the words that were saved without a translation.
 *
 * Saving no longer waits for the model, so the vocabulary can hold entries
 * with a blank back — kept during an outage, or past the hour's quota. They
 * are real words the learner chose, and they should not stay blank forever
 * just because of when they happened to be tapped.
 *
 * This runs when the vocabulary is opened: the one moment the learner is
 * looking at exactly these entries, and the moment a filled-in translation is
 * most useful. `lookupWord` consults the cache and the offline set before the
 * model, so most of these cost nothing at all.
 *
 * A few at a time, in sequence. The hourly allowance is sixty calls, and
 * emptying it on a backlog would leave none for the reading the learner is
 * about to do — the backlog can wait for the next visit, their reading
 * cannot. Serial rather than parallel for the same reason it is elsewhere:
 * nobody is watching these land, and a burst is a burst.
 */
const PER_VISIT = 5;

let running = false;

export async function backfillTranslations(): Promise<number> {
  if (running) return 0;
  running = true;
  let filled = 0;

  try {
    for (const word of getUntranslated().slice(0, PER_VISIT)) {
      try {
        const found = await lookupWord(word.word, { sentence: word.sentence });
        if (found.translation) {
          setTranslation(word.id, found.translation);
          filled++;
        } else {
          /* No answer and no error worth retrying against right now. Stopping
             beats walking the rest of the list into the same wall. */
          break;
        }
      } catch {
        break;
      }
    }
  } finally {
    running = false;
  }

  return filled;
}
