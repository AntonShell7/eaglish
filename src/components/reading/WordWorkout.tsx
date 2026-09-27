import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { ReviewCard } from "@/components/vocabulary/ReviewCard";
import { WriteCard } from "@/components/vocabulary/WriteCard";
import { useSegmented } from "@/lib/useSegmented";
import { getVocabulary, reviewWord, type VocabularyWord } from "@/lib/vocabularyStore";
import { normalise, tokenise } from "@/lib/lexicon";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";

type Style = "typed" | "write";

/** Shuffled, but never leaving the just-missed word at the front. */
function reshuffle(cards: VocabularyWord[], justMissed: string): VocabularyWord[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out[0].id === justMissed) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out;
}

/**
 * The exercise that follows a text, on the words that text actually contained.
 *
 * The coursebook shape — read, then work with what you met — with one change:
 * the words are not a list chosen by an author, they are the learner's own
 * saved words that happen to appear here.
 *
 * It now runs until every word has been produced correctly. A single pass lets
 * you fail a word and move on, which is precisely the word you needed another
 * attempt at; a missed card goes back into the pile instead, shuffled so it
 * does not reappear while the answer is still on screen. The sentence stays
 * the same on the second attempt — changing it would turn a second chance at
 * one word into a first attempt at a different puzzle.
 */
export function WordWorkout({ text }: { text: ReadingText }) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [solved, setSolved] = useState(0);
  const [done, setDone] = useState(false);
  const [style, setStyle] = useState<Style>("typed");
  const { ref: styleRef, style: styleStyle } = useSegmented(style);

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

      const sentence = text.sentences.find((s) => tokenise(s.text).includes(key))?.text;
      out.push({ ...word, sentence: sentence ?? word.sentence });
      if (out.length >= 8) break;
    }
    return out;
  }, [text]);

  useEffect(() => {
    setQueue(cards);
    setSolved(0);
    setDone(false);
  }, [cards]);

  if (cards.length < 2) return null;

  const card = queue[0];

  const grade = (quality: 0 | 1 | 2 | 3) => {
    if (!card) return;
    reviewWord(card.id, quality);

    const correct = quality >= 2;
    const rest = queue.slice(1);
    const next = correct ? rest : reshuffle([...rest, card], card.id);

    setQueue(next);
    if (correct) setSolved((n) => n + 1);

    if (next.length === 0) {
      setDone(true);
      finish("vocabulary", `workout:${text.id}`, t("tasks.workoutDone"));
    }
  };

  return (
    <section className="card mt-6 p-6 sm:p-8">
      <h3 className="page-title text-xl">{t("reading.workoutTitle")}</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {done
          ? t("reading.workoutDone", { count: cards.length })
          : t("reading.workoutLede", { count: cards.length })}
      </p>

      {!done && card && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
              {t("reading.workoutLeft", { done: solved, total: cards.length })}
            </p>
            {/* The same choice the vocabulary offers: a keyboard, or a stylus
                on squared paper. */}
            <div className="segmented" ref={styleRef} style={styleStyle}>
              {(["typed", "write"] as Style[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`segmented__item${style === option ? " is-active" : ""}`}
                  onClick={() => setStyle(option)}
                >
                  {t(`vocabulary.style.${option}`)}
                </button>
              ))}
            </div>
          </div>

          {style === "typed" ? (
            <ReviewCard key={card.id} word={card} onGraded={grade} />
          ) : (
            <WriteCard key={card.id} word={card} onGraded={grade} />
          )}
        </div>
      )}
    </section>
  );
}
