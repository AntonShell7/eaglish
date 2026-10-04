import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { DailyState } from "@/lib/dailyGoal";
import "./daily-start.css";

/**
 * The day's practice, as a list of two.
 *
 * Both items are on screen from the start. That is the whole design: a learner
 * can see the entire shape of what the day asks before doing any of it, which
 * is the difference between a short list and a corridor with doors in it. A
 * wizard that revealed the second step only after the first would be the same
 * work and would feel like more of it, because nobody can tell how far a
 * corridor goes.
 *
 * Finishing one crosses it off and leaves the other standing. The panel waits
 * until both are struck through and the learner closes it — the crossing-off
 * is the point, and a panel that vanished the instant the last item completed
 * would take the only satisfying moment away from the person who earned it.
 */

interface Choice {
  to: string;
  key: "reading" | "listening" | "slang";
}

const CHOICES: Choice[] = [
  { to: "/reading", key: "reading" },
  { to: "/dictation", key: "listening" },
  { to: "/slang", key: "slang" },
];

function Tick({ done }: { done: boolean }) {
  return (
    <span className={done ? "ds__tick is-done" : "ds__tick"} aria-hidden>
      {done && (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
          strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </span>
  );
}

export function DailyStart({
  state,
  onReview,
  onSkip,
  onClose,
}: {
  state: DailyState;
  onReview: () => void;
  onSkip: () => void;
  /** Both items crossed off and acknowledged. */
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const left = Math.max(0, state.reviewTarget - state.reviewDone);
  const allDone = state.reviewComplete && state.practiceComplete;

  return (
    <section className="ds">
      <p className="ds__eyebrow">{t("daily.eyebrow")}</p>
      <h2 className="ds__title page-title">{t("daily.title")}</h2>
      <p className="ds__lede">{t("daily.lede")}</p>

      <ol className="ds__list">
        <li className={state.reviewComplete ? "ds__item is-done" : "ds__item"}>
          <Tick done={state.reviewComplete} />
          <div className="ds__body">
            <p className="ds__name">{t("daily.reviewName")}</p>
            {state.reviewComplete ? (
              <p className="ds__note">{t("daily.reviewDone", { count: state.reviewDone })}</p>
            ) : (
              <>
                <p className="ds__note">{t("daily.reviewNote", { count: left })}</p>
                <button type="button" className="btn btn--primary btn--sm ds__go" onClick={onReview}>
                  {t("daily.reviewCta")}
                </button>
              </>
            )}
          </div>
        </li>

        <li className={state.practiceComplete ? "ds__item is-done" : "ds__item"}>
          <Tick done={state.practiceComplete} />
          <div className="ds__body">
            <p className="ds__name">{t("daily.practiceName")}</p>
            {state.practiceComplete ? (
              <p className="ds__note">{t("daily.practiceDone")}</p>
            ) : (
              <>
                <p className="ds__note">{t("daily.practiceNote")}</p>
                {/* Three doors, equal weight. Nothing is recommended: which of
                    these somebody is in the mood for is not a thing an
                    algorithm knows, and marking one as the main choice turns
                    the other two into options to refuse. */}
                <div className="ds__choices">
                  {CHOICES.map((choice) => (
                    <Link key={choice.key} to={choice.to} className="ds__choice">
                      {t(`daily.choice.${choice.key}`)}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </li>
      </ol>

      <div className="ds__foot">
        {allDone ? (
          <>
            <p className="ds__closing">{t("daily.allDone")}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              {t("daily.next")}
            </button>
          </>
        ) : (
          /* "Not today" is a link, not a button. It has to be findable and must
             never compete with the work it declines — an equally weighted pair
             would turn a minimum into a question. */
          <button type="button" className="ds__skip" onClick={onSkip}>
            {t("daily.skip")}
          </button>
        )}
      </div>
    </section>
  );
}
