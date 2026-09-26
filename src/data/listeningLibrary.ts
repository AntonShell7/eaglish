import batch1 from "./listening/batch1.json";
import type { ReadingText } from "./readingTexts";

/**
 * The listening library.
 *
 * Separate from the reading shelf, because these are a different kind of text.
 * A reading piece is sixty words and exists to put a few unknown words in front
 * of someone. A listening piece is five hundred, because dictation is worth
 * fifteen or twenty minutes and a short text ends before the ear has settled
 * into the voice.
 *
 * They are written rather than collected. Public-domain books are the wrong
 * register — nineteenth-century prose is nobody's spoken English — and anything
 * under a share-alike licence would tie a commercial product to that licence.
 * Writing them also buys the two things dictation specifically needs: control
 * of the level, and sentences that can be held in the head long enough to be
 * typed.
 *
 * Each item in `sentences` is one fragment: at most a sentence, and a long
 * sentence split where it naturally breathes.
 */
export const listeningTexts = batch1 as ReadingText[];

export const listeningCount = listeningTexts.length;
