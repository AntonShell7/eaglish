import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { ReviewCard } from "@/components/vocabulary/ReviewCard";
import { getVocabulary, reviewWord, type VocabularyWord } from "@/lib/vocabularyStore";
import { normalise, tokenise } from "@/lib/lexicon";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";

/**
 * The exercise that follows a text, on the words that text actually contained.
 *
 * This is the coursebook shape — read, then work with what you met — with one
 * change: the words are not a fixed list chosen by an author, they are *your*
 * saved words that happen to appear here. Meeting a word in a text and then
 * having to produce it a minute later, in a sentence from that same text, is
 * the cheapest strong repetition available.
 *
 * Grades go into the ordinary scheduler, so an encounter here is worth exactly
 * as much as one in the review queue — which is the point of the whole loop.
 */
export function WordWorkout({ text }: { text: ReadingText }) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  /**
   * Cards are built against this text's own sentences, so the gap sits in a
   * context the reader has just understood.
   */
  const cards = useMemo(() => {
    const inText = new Set(text.sentences.flatMap((s) => tokenise(s.text)));
    const out: VocabularyWord[] = [];

    for (const word of getVocabulary()) {
      const key = normalise(word.word);
      if (!key || !inText.has(key)) continue;

      const sentence = text.sentences.find((s) =>
        tokenise(s.text).includes(key),
      )?.text;
      out.push({ ...word, sentence: sentence ?? word.sentence });
      if (out.length >= 8) break;
    }
    return out;
  }, [text]);

  if (cards.length < 2) return null;

  const card = cards[Math.min(index, cards.length - 1)];

  const grade = (quality: 0 | 1 | 2 | 3) => {
    reviewWord(card.id, quality);
    if (index + 1 >= cards.length) {
      setDone(true);
      finish("vocabulary", `workout:${text.id}`, t("tasks.workoutDone"));
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <section className="card mt-6 p-6 sm:p-8">
      <h3 className="page-title text-xl">{t("reading.workoutTitle")}</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {done
          ? t("reading.workoutDone", { count: cards.length })
          : t("reading.workoutLede", { count: cards.length })}
      </p>

      {!done && (
        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
            {t("vocabulary.cardOf", { done: index + 1, total: cards.length })}
          </p>
          <ReviewCard key={card.id} word={card} onGraded={grade} />
        </div>
      )}
    </section>
  );
}
