import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Drill } from "@/components/vocabulary/Drill";
import { getDueWords, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import { planSession } from "@/lib/session";
import { getStreak } from "@/lib/activityStore";

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

  /* What the session was actually like, kept as it happens.
     The screen at the end used to be able to say only how many cards went
     past — which is attendance, not a result. Whether they came back is the
     thing the learner wants to know, and the thing that tells them what to
     do next. */
  const [recalled, setRecalled] = useState(0);
  const [stumbled, setStumbled] = useState<string[]>([]);

  const review = (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => {
    onReview(id, quality, lastInQueue);
    setReviewed((n) => n + 1);
    /* Grades 2 and 3 are "knew it"; 0 and 1 mean it had to be looked at
       again. The word itself is kept rather than a tally, because "which
       ones" is a more useful answer than "how many". */
    if (quality >= 2) setRecalled((n) => n + 1);
    else {
      const word = run.find((w) => w.id === id);
      if (word) setStumbled((list) => (list.includes(word.word) ? list : [...list, word.word]));
    }
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

  const streak = getStreak();

  return (
    <div className="vocab-empty">
      <p className="page-title text-2xl">
        {reviewed > 0
          ? t("vocabulary.summaryTitle")
          : left.length === 0
            ? t("vocabulary.queueEmpty")
            : clearedTheRisk
              ? t("vocabulary.riskCleared")
              : t("vocabulary.runDone")}
      </p>

      {/* What happened, rather than that something happened.
          This screen used to say "the queue is empty" and stop, while a toast
          said much the same thing in the corner — the same news twice, and
          neither half told the learner anything about how it went. */}
      {reviewed > 0 && (
        <div className="vs-summary">
          <div className="vs-summary__figures">
            <div className="vs-figure">
              <p className="vs-figure__n tabular">{recalled}</p>
              <p className="vs-figure__l">{t("vocabulary.summaryRecalled")}</p>
            </div>
            <div className="vs-figure">
              <p className="vs-figure__n vs-figure__n--off tabular">{reviewed - recalled}</p>
              <p className="vs-figure__l">{t("vocabulary.summaryStumbled")}</p>
            </div>
            {streak > 0 && (
              <div className="vs-figure">
                <p className="vs-figure__n tabular">{streak}</p>
                <p className="vs-figure__l">{t("vocabulary.summaryStreak", { count: streak })}</p>
              </div>
            )}
          </div>

          {/* The words themselves, because "four were hard" is not actionable
              and "crochet, bewilder" is. */}
          {stumbled.length > 0 && (
            <p className="vs-summary__hard">
              <span className="vs-summary__hardH">{t("vocabulary.summaryHard")}</span>
              {stumbled.slice(0, 6).join(" · ")}
            </p>
          )}
        </div>
      )}

      <p className="vocab-empty__p">
        {left.length === 0
          ? t("vocabulary.queueEmptyBody")
          : clearedTheRisk
            ? t("vocabulary.riskClearedBody", { count: left.length })
            : t("vocabulary.runDoneBody", { count: left.length })}
      </p>

      {/* Somewhere to go. A finished session that offers nothing next is where
          the visit ends, and reading is what puts the next words in the
          queue. */}
      {left.length === 0 && (
        <div className="vocab-empty__actions">
          <Link to="/reading" className="btn btn--primary">
            {t("vocabulary.summaryRead")}
          </Link>
          <Link to="/" className="btn btn--ghost">
            {t("vocabulary.summaryHome")}
          </Link>
        </div>
      )}

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
