import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { VocabularyWord } from "@/lib/vocabularyStore";
import { HandwritingPad, type HandwritingPadHandle } from "@/components/ui/HandwritingPad";
import "./write-card.css";

/**
 * Write the word out, then check yourself.
 *
 * The point of writing rather than typing is that the hand has to produce the
 * whole shape from memory — no keyboard autocompleting it, no spelling
 * arriving one plausible key at a time. That is a harder and more honest
 * recall test than typing, and on a tablet with a stylus it is the most
 * pleasant way to review anything.
 *
 * Nothing reads it, and that is deliberate rather than a limitation.
 *
 * The first version sent the canvas to a model as soon as the pen had been
 * still for a moment. It could not work, and the reason is worth keeping: a
 * person writing a word by hand lifts the pen *between letters*, and that
 * pause is indistinguishable from the pause at the end. So the card would
 * start reading after the first letter, lock the canvas, and the rest of the
 * word had nowhere to go. No timeout fixes that — lengthen it and somebody
 * writing slowly still gets cut off, shorten it and everybody does.
 *
 * It is also solving a problem this exercise does not have. The learner is
 * looking at the answer the moment they turn the card; whether the writing
 * matches is something they can see perfectly well themselves, and asking a
 * model costs money and latency to tell them what is already in front of
 * them. Machine reading belongs in the sentence drill, where the learner
 * invented the text and nobody knows what it says.
 */

export function WriteCard({
  word,
  onGraded,
}: {
  word: VocabularyWord;
  onGraded: (quality: 0 | 1 | 2 | 3) => void;
}) {
  const { t } = useTranslation();
  const pad = useRef<HandwritingPadHandle | null>(null);
  const [written, setWritten] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setWritten(false);
    setShown(false);
    pad.current?.clear();
  }, [word.id]);

  /* Space reveals, then one key grades — the same shape as the flip card, so
     a keyboard user switching between the two learns one set of keys. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if ((event.key === " " || event.key === "Enter") && !shown) {
        event.preventDefault();
        setShown(true);
        return;
      }
      if (!shown) return;
      if (event.key === "ArrowRight") onGraded(2);
      if (event.key === "ArrowLeft") onGraded(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, onGraded]);

  return (
    <div className="wc">
      <p className="wc__prompt">{t("vocabulary.writeThis")}</p>
      <p className="wc__translation">{word.translation}</p>

      <div className="wc__pad">
        <HandwritingPad
          rows={3}
          padRef={(handle) => {
            pad.current = handle;
          }}
          onFirstStroke={() => setWritten(true)}
        />
      </div>

      {shown ? (
        <>
          {/* The answer, large enough to compare a letter at a time against
              what is still on the pad above it. */}
          <p className="wc__answer">{word.word}</p>
          {word.sentence && <p className="wc__sentence">{word.sentence}</p>}

          <div className="wc__grade">
            <button type="button" className="wc__btn wc__btn--again" onClick={() => onGraded(0)}>
              {t("vocabulary.didntKnow")}
              <kbd>←</kbd>
            </button>
            <button type="button" className="wc__btn wc__btn--knew" onClick={() => onGraded(2)}>
              {t("vocabulary.knew")}
              <kbd>→</kbd>
            </button>
          </div>
        </>
      ) : (
        <div className="wc__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setShown(true)}
            disabled={!written}
          >
            {t("input.reveal")}
          </button>
          <p className="wc__hint">
            <kbd>Space</kbd> {t("vocabulary.flipHint")}
          </p>
        </div>
      )}
    </div>
  );
}
