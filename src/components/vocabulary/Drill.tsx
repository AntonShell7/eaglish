import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSegmented } from "@/lib/useSegmented";
import { ReviewCard } from "@/components/vocabulary/ReviewCard";
import { FlashCard } from "@/components/vocabulary/FlashCard";
import { WriteCard } from "@/components/vocabulary/WriteCard";
import type { VocabularyWord } from "@/lib/vocabularyStore";

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

function remembered(): Style {
  try {
    const saved = localStorage.getItem("reviewStyle");
    return STYLES.includes(saved as Style) ? (saved as Style) : "typed";
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
  /** What is being practised — the due queue, or a day's folder. */
  title: string;
  onReview: (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [style, setStyle] = useState<Style>(remembered);
  const { ref: styleRef, style: styleStyle } = useSegmented(style);

  // A different set starts from the top.
  useEffect(() => {
    setIndex(0);
    setDone(0);
  }, [title]);

  const chooseStyle = (next: Style) => {
    setStyle(next);
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
        <button type="button" onClick={onExit} className="btn btn--primary mt-6">
          {t("vocabulary.backToList")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" className="btn btn--quiet btn--sm" onClick={onExit}>
          ← {t("vocabulary.backToList")}
        </button>
        <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
          {title} · {t("vocabulary.cardOf", { done: index + 1, total: queue.length })}
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
