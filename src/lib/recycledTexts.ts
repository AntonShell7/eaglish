import type { ReadingText } from "@/data/readingTexts";
import { readingTopics, loadTopicTexts } from "@/data/readingLibrary";
import { getVocabulary } from "./vocabularyStore";
import { tokenise, normalise } from "./lexicon";
import { usesWord } from "./wordMatch";

/**
 * The three texts at the top of Reading.
 *
 * Reading is not here for its own sake. Around seventy per cent of what it is
 * for is mining words the learner does not have yet — and the other side of
 * that same coin is meeting a word again after saving it, in a sentence
 * nobody wrote for the purpose. A card can tell you a word ten times; a text
 * that happens to contain it is the thing that makes it stick, because it
 * arrives without warning and has to be understood rather than recalled.
 *
 * The library is fixed, so this cannot be generated — it has to be searched.
 * These three are the texts that contain the most of what the learner saved
 * recently, ranked by how many distinct recent words turn up in them.
 */

/** How far back "recently" reaches. Long enough to have something to find. */
const WINDOW_DAYS = 21;
const DAY = 24 * 60 * 60 * 1000;
const SHOWN = 3;

export interface RecycledText {
  text: ReadingText;
  /** Which of the learner's recent words this text contains. */
  words: string[];
}

/**
 * Texts holding the learner's recent words, best first.
 *
 * Loads the whole library, which is the honest cost of the feature: the words
 * are the learner's and the index would have to be rebuilt per person, so
 * there is nothing to precompute. It runs once when Reading opens and the
 * result is cached by the caller.
 */
export async function recycledTexts(): Promise<RecycledText[]> {
  const cutoff = Date.now() - WINDOW_DAYS * DAY;
  const recent = getVocabulary().filter((word) => word.addedAt >= cutoff);
  if (recent.length === 0) return [];

  /* Single words only. A saved phrase like "make a decision" cannot be found
     by token matching, and pretending otherwise would put texts at the top
     that do not contain it. */
  const wanted = recent
    .map((word) => word.word)
    .filter((word) => !/\s/.test(word.trim()))
    .slice(0, 40);
  if (wanted.length === 0) return [];

  const batches = await Promise.all(
    readingTopics.filter((topic) => topic.total > 0).map((topic) => loadTopicTexts(topic.id)),
  );

  const scored: RecycledText[] = [];
  for (const text of batches.flat()) {
    /* Tokens are collected once per text and compared against the word list,
       rather than running the inflection-aware match over every token of every
       text — that is forty comparisons times a quarter of a million tokens,
       and it locks the page up for a second on an ordinary machine. */
    const present = new Set<string>();
    for (const sentence of text.sentences) {
      for (const token of tokenise(sentence.text)) present.add(token);
    }

    const found = wanted.filter((word) => {
      const key = normalise(word);
      if (present.has(key)) return true;
      // Inflected forms: only worth the slower check against a small candidate
      // set, so it runs on tokens that at least start the same way.
      const stem = key.slice(0, Math.max(4, key.length - 2));
      for (const token of present) {
        if (token.startsWith(stem) && usesWord(token, word)) return true;
      }
      return false;
    });

    if (found.length > 0) scored.push({ text, words: found });
  }

  return scored
    .sort((a, b) => b.words.length - a.words.length || a.text.title.localeCompare(b.text.title))
    .slice(0, SHOWN);
}
