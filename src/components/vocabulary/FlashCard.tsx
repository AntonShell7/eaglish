import { useCallback, useEffect, useRef, useState } from "react";
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
 *
 * Two things were wrong with the first version and both were about control.
 * The card flipped once and then refused to turn back, so a learner who had
 * looked at the translation and wanted the word again had nowhere to go — the
 * only way back was to grade themselves and lose the card. And grading was two
 * buttons under the card, which is fine with a mouse and miserable on a phone,
 * where the deck this is competing with has trained everybody's thumbs to
 * throw a card left or right. Both are fixed here: the card turns as many
 * times as you like, in either direction, and it can be thrown.
 */

/** How far a card must travel before the throw counts. */
const COMMIT_PX = 110;
/** Where the verdict tint reaches full strength. */
const TINT_PX = 150;

export function FlashCard({
  word,
  onGraded,
}: {
  word: VocabularyWord;
  onGraded: (quality: 0 | 1 | 2 | 3) => void;
}) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  /** Whether the learner has ever turned this card — the prompt stops after. */
  const [turned, setTurned] = useState(false);
  const [drag, setDrag] = useState(0);
  /** Set while the card flies off, so the animation finishes before the next one. */
  const [leaving, setLeaving] = useState<"knew" | "again" | null>(null);

  const card = useRef<HTMLDivElement | null>(null);
  const from = useRef<number | null>(null);
  /** Distinguishes a tap from a throw: a drag must not also flip the card. */
  const moved = useRef(false);

  useEffect(() => {
    setFlipped(false);
    setTurned(false);
    setDrag(0);
    setLeaving(null);
  }, [word.id]);

  /* The card leaves before the grade lands. Answering instantly and swapping
     the text under a stationary card makes a deck feel like a form; letting
     the object go is what makes it feel like cards. */
  const send = useCallback(
    (verdict: "knew" | "again") => {
      if (leaving) return;
      setLeaving(verdict);
      window.setTimeout(() => onGraded(verdict === "knew" ? 2 : 0), 260);
    },
    [leaving, onGraded],
  );

  const flip = useCallback(() => {
    setFlipped((f) => !f);
    setTurned(true);
  }, []);

  /* The whole deck without a mouse. Space and Enter turn the card — both
     directions, same key — and the arrows throw it, which is the gesture the
     hands already know from the trackpad version. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flip();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        send("knew");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        send("again");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, send]);

  const down = (event: React.PointerEvent<HTMLDivElement>) => {
    if (leaving) return;
    from.current = event.clientX;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (from.current === null) return;
    const dx = event.clientX - from.current;
    // A few pixels of slack, so a slightly imprecise tap still flips the card
    // rather than starting a throw that goes nowhere.
    if (Math.abs(dx) > 6) moved.current = true;
    setDrag(dx);
  };

  const up = () => {
    if (from.current === null) return;
    const dx = drag;
    from.current = null;
    if (Math.abs(dx) >= COMMIT_PX) send(dx > 0 ? "knew" : "again");
    else setDrag(0);
  };

  const strength = Math.min(1, Math.abs(drag) / TINT_PX);
  const verdict = drag > 0 ? "knew" : "again";

  return (
    <div className="fc">
      <div
        ref={card}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        className={[
          "fc__card",
          flipped ? "is-flipped" : "",
          leaving ? `is-leaving is-leaving--${leaving}` : "",
          from.current !== null ? "is-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          leaving
            ? undefined
            : {
                transform: `translateX(${drag}px) rotate(${drag * 0.035}deg)`,
              }
        }
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClick={() => {
          if (!moved.current) flip();
        }}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") event.preventDefault();
        }}
      >
        <div className="fc__inner">
          <div className="fc__face fc__face--front">
            <span className="fc__word">{word.word}</span>
            {!turned && <span className="fc__prompt">{t("vocabulary.tapToFlip")}</span>}
          </div>

          <div className="fc__face fc__face--back">
            <span className="fc__translation">{word.translation}</span>
            {/* The sentence it was met in is the part a plain deck throws away,
                and it is what turns a pair of words into a memory. */}
            {word.sentence && <span className="fc__sentence">{word.sentence}</span>}
          </div>
        </div>

        {/* The verdict, stamped on the card itself.
            The first version put the two labels *under* the card, which reads
            exactly backwards: throwing the card right uncovers the left label,
            so a learner saying "I knew it" watched the words "didn't know"
            appear. The stamp rides on the card and sits at its trailing
            corner — opposite the direction of travel, so the hand does not
            cover it — which is the arrangement every swipe deck uses. */}
        <span
          className="fc__stamp fc__stamp--knew"
          style={{ opacity: drag > 0 ? strength : 0 }}
          aria-hidden
        >
          {t("vocabulary.knew")}
        </span>
        <span
          className="fc__stamp fc__stamp--again"
          style={{ opacity: drag < 0 ? strength : 0 }}
          aria-hidden
        >
          {t("vocabulary.didntKnow")}
        </span>

        {/* The wash follows the throw, so the verdict is legible before the
            card has committed to anything. */}
        <span
          className={`fc__tint fc__tint--${verdict}`}
          style={{ opacity: strength * 0.42 }}
          aria-hidden
        />
      </div>

      <div className="fc__grade">
        <button type="button" className="fc__btn fc__btn--again" onClick={() => send("again")}>
          {t("vocabulary.didntKnow")}
          <kbd>←</kbd>
        </button>
        <button type="button" className="fc__btn fc__btn--knew" onClick={() => send("knew")}>
          {t("vocabulary.knew")}
          <kbd>→</kbd>
        </button>
      </div>

      <p className="fc__hint">
        <kbd>Space</kbd> {t("vocabulary.flipHint")}
      </p>
    </div>
  );
}
