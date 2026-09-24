import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { VocabularyWord } from "@/lib/vocabularyStore";
import "./flashcard.css";

/**
 * The flip card.
 *
 * The typed card is the better test and stays the default: recognising a
 * translation is far easier than producing a word, and people reliably believe
 * they would have recalled what they merely recognised — which is why a
 * self-rated deck quietly inflates every interval in the schedule.
 *
 * But that is an argument about accuracy, not about whether the card should
 * exist. Typing thirty words costs real effort, and a learner who has five
 * minutes on a bus will review nothing rather than review by typing. A deck
 * that gets opened is worth more than a stricter one that does not.
 *
 * So the compromise is in the grading rather than in the offer: "I knew it"
 * here counts as a good recall and never as an easy one, because the learner
 * graded themselves after seeing the answer. Guided recognition earns a
 * shorter interval than unguided production, and the schedule stays honest.
 */
export function FlashCard({
  word,
  onGraded,
}: {
  word: VocabularyWord;
  onGraded: (quality: 0 | 1 | 2 | 3) => void;
}) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);

  useEffect(() => setFlipped(false), [word.id]);

  // Space flips, then one key grades — the whole deck without a mouse.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (!flipped) setFlipped(true);
        return;
      }
      if (!flipped) return;
      if (event.key === "1") onGraded(0);
      if (event.key === "2") onGraded(2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, onGraded]);

  return (
    <div className="fc">
      <button
        type="button"
        className={flipped ? "fc__card is-flipped" : "fc__card"}
        onClick={() => setFlipped(true)}
        aria-live="polite"
      >
        <span className="fc__inner">
          <span className="fc__face fc__face--front">
            <span className="fc__word">{word.word}</span>
            {!flipped && <span className="fc__prompt">{t("vocabulary.tapToFlip")}</span>}
          </span>

          <span className="fc__face fc__face--back">
            <span className="fc__translation">{word.translation}</span>
            {/* The sentence it was met in is the part a plain deck throws away,
                and it is what turns a pair of words into a memory. */}
            {word.sentence && <span className="fc__sentence">{word.sentence}</span>}
          </span>
        </span>
      </button>

      {flipped ? (
        <div className="fc__grade">
          <button type="button" className="fc__btn fc__btn--again" onClick={() => onGraded(0)}>
            {t("vocabulary.didntKnow")}
            <kbd>1</kbd>
          </button>
          <button type="button" className="fc__btn fc__btn--knew" onClick={() => onGraded(2)}>
            {t("vocabulary.knew")}
            <kbd>2</kbd>
          </button>
        </div>
      ) : (
        <p className="fc__hint">
          <kbd>Space</kbd> {t("vocabulary.flipHint")}
        </p>
      )}
    </div>
  );
}
