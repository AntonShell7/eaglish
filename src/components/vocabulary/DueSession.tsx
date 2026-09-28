import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Drill } from "@/components/vocabulary/Drill";
import { getDueWords, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import { planSession } from "@/lib/session";

/**
 * The review queue, served in runs rather than as one list.
 *
 * A scheduler that works produces a queue that never empties. After a year of
 * collecting, a hundred words can fall due on an ordinary Tuesday, and handing
 * someone a hundred cards is handing them a reason to stop opening the app —
 * the session has no end they can see, so the only way out is to give up
 * halfway, which feels like failing.
 *
 * So the run is finite and the order has a point to it. The planner decides
 * what goes in it and in what order — worst recall first, stubborn words
 * rationed rather than front-loaded, a cap that can be finished — and this
 * component only runs what it is handed. When the shaky ones are done the
 * session says so plainly, and continuing becomes an offer rather than an
 * obligation.
 *
 * Nothing here is a question. That is the point: the work of deciding what to
 * study is the work people are worst at and least willing to do, and an app
 * that asks it at the door is an app that gets closed at the door.
 */

/** Cards in one run. Long enough to be worth starting, short enough to finish. */
const RUN = 25;

/** Above this the scheduler considers a word genuinely held. */
const HELD = 75;

function atRisk(words: VocabularyWord[]): VocabularyWord[] {
  return words.filter((word) => wordStrength(word) < HELD);
}

/** Whatever the planner says is next, capped to a run this screen can finish. */
function nextRun(): VocabularyWord[] {
  return planSession().review.slice(0, RUN);
}

export function DueSession({
  onReview,
  onLeave,
}: {
  onReview: (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => void;
  /** Where "that's enough for today" goes. */
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  const [run, setRun] = useState<VocabularyWord[]>(nextRun);
  const [resting, setResting] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const review = (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => {
    onReview(id, quality, lastInQueue);
    setReviewed((n) => n + 1);
    if (lastInQueue) setResting(true);
  };

  const carryOn = () => {
    setRun(nextRun());
    setResting(false);
  };

  if (!resting && run.length > 0) {
    return <Drill queue={run} onReview={review} />;
  }

  const left = getDueWords();
  const shakyLeft = atRisk(left).length;
  /* The moment worth naming: everything that was actually slipping is done,
     and what remains is maintenance. */
  const clearedTheRisk = shakyLeft === 0 && left.length > 0;

  return (
    <div className="vocab-empty">
      <p className="page-title text-2xl">
        {left.length === 0
          ? t("vocabulary.queueEmpty")
          : clearedTheRisk
            ? t("vocabulary.riskCleared")
            : t("vocabulary.runDone")}
      </p>

      <p className="vocab-empty__p">
        {reviewed > 0 && `${t("vocabulary.sessionSummary", { count: reviewed })} `}
        {left.length === 0
          ? t("vocabulary.queueEmptyBody")
          : clearedTheRisk
            ? t("vocabulary.riskClearedBody", { count: left.length })
            : t("vocabulary.runDoneBody", { count: left.length })}
      </p>

      {left.length > 0 && (
        <div className="vocab-empty__actions">
          <button type="button" className="btn btn--primary" onClick={carryOn}>
            {t("vocabulary.carryOn", { count: Math.min(RUN, left.length) })}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onLeave}>
            {t("vocabulary.enoughForToday")}
          </button>
        </div>
      )}
    </div>
  );
}
