import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSegmented } from "@/lib/useSegmented";
import { ReviewCard } from "@/components/vocabulary/ReviewCard";
import { FlashCard } from "@/components/vocabulary/FlashCard";
import { WriteCard } from "@/components/vocabulary/WriteCard";
import type { VocabularyWord } from "@/lib/vocabularyStore";
import { getInputMode, setInputMode, useInputMode } from "@/lib/inputMode";

/**
 * A run through a set of words.
 *
 * It used to exist only inside the vocabulary page, wired directly to the due
 * queue, which meant the shelf could be browsed but never practised — you
 * could look at the forty words you collected in September and do nothing with
 * them. Pulling it out makes any set drillable: today's queue, one day's
 * folder, eventually a search.
 *
 * Whatever the set, an answer here is a real review and goes to the scheduler.
 * Practising a word early is not cheating the system; the model already knows
 * that recalling something you barely had time to forget teaches you less, and
 * it adjusts the next interval accordingly.
 */

export type Style = "typed" | "cards" | "write";

const STYLES: Style[] = ["typed", "cards", "write"];

/**
 * The remembered style, with the pen having the last word.
 *
 * This drill had three styles before there was a global pen switch, and one of
 * them *is* the pen. Leaving the two settings independent would let the app
 * say "handwriting is on" while showing a text field, so they are the same
 * setting seen from two sides: turning the switch on selects the written card,
 * and picking the written card turns the switch on.
 */
function remembered(): Style {
  if (getInputMode() === "pen") return "write";
  try {
    const saved = localStorage.getItem("reviewStyle");
    const style = STYLES.includes(saved as Style) ? (saved as Style) : "typed";
    // A style saved as "write" from before the switch existed still means the
    // learner wants to write.
    return style === "write" ? "typed" : style;
  } catch {
    return "typed";
  }
}

export function Drill({
  queue,
  title,
  onReview,
  onExit,
}: {
  queue: VocabularyWord[];
  /**
   * What is being practised — a day's folder, or a strength group. Left empty
   * when the tab above already names it: a heading repeated two lines apart is
   * noise, not orientation.
   */
  title?: string;
  onReview: (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => void;
  /**
   * How to leave. Omitted when the drill is what a tab shows, because the tabs
   * are the way out and a second exit button next to them would offer a choice
   * that does not exist.
   */
  onExit?: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [style, setStyle] = useState<Style>(remembered);
  const { ref: styleRef, style: styleStyle } = useSegmented(style);
  const [mode] = useInputMode();

  // Flip the switch anywhere else in the app and this segment follows.
  useEffect(() => {
    setStyle((current) => {
      if (mode === "pen") return "write";
      return current === "write" ? remembered() : current;
    });
  }, [mode]);

  // A different set starts from the top.
  useEffect(() => {
    setIndex(0);
    setDone(0);
  }, [queue]);

  const chooseStyle = (next: Style) => {
    setStyle(next);
    setInputMode(next === "write" ? "pen" : "keyboard");
    try {
      localStorage.setItem("reviewStyle", next);
    } catch {
      /* a remembered preference is a convenience, not a requirement */
    }
  };

  const grade = (id: string, quality: 0 | 1 | 2 | 3) => {
    onReview(id, quality, index >= queue.length - 1);
    setIndex((i) => i + 1);
    setDone((n) => n + 1);
  };

  const card = queue[index];

  if (!card) {
    return (
      <div className="py-12 text-center">
        <p className="page-title text-2xl">
          {done > 0 ? t("vocabulary.sessionDone") : t("vocabulary.allCaughtUp")}
        </p>
        {done > 0 && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("vocabulary.sessionSummary", { count: done })}
          </p>
        )}
        {onExit && (
          <button type="button" onClick={onExit} className="btn btn--primary mt-6">
            {t("vocabulary.backToList")}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        {onExit && (
          <button type="button" className="btn btn--quiet btn--sm" onClick={onExit}>
            ← {t("vocabulary.backToList")}
          </button>
        )}
        <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
          {title ? `${title} · ` : ""}
          {t("vocabulary.cardOf", { done: index + 1, total: queue.length })}
        </p>
        <div className="segmented" ref={styleRef} style={styleStyle}>
          {STYLES.map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__item${style === option ? " is-active" : ""}`}
              onClick={() => chooseStyle(option)}
            >
              {t(`vocabulary.style.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {style === "cards" && <FlashCard key={card.id} word={card} onGraded={(q) => grade(card.id, q)} />}
      {style === "typed" && <ReviewCard key={card.id} word={card} onGraded={(q) => grade(card.id, q)} />}
      {style === "write" && <WriteCard key={card.id} word={card} onGraded={(q) => grade(card.id, q)} />}
    </>
  );
}
