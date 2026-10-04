import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { DailyState } from "@/lib/dailyGoal";
import "./daily-start.css";

/**
 * The day's minimum, asked once.
 *
 * Two screens rather than one, because the two halves are different kinds of
 * thing and showing them together would turn a decision into a form. The first
 * states what is waiting — no options, because there are none worth offering.
 * The second offers three doors and nothing else.
 *
 * It is a panel on the dashboard, not a modal. A modal is a thing to dismiss,
 * and the muscle for dismissing them is the fastest-learned reflex in software;
 * a panel occupying the place the learner was already looking is simply the
 * page, and the way past it is to do the work or to say not today.
 */

interface Choice {
  to: string;
  key: "reading" | "listening" | "slang";
  minutes: number;
}

const CHOICES: Choice[] = [
  { to: "/reading", key: "reading", minutes: 4 },
  { to: "/dictation", key: "listening", minutes: 4 },
  { to: "/slang", key: "slang", minutes: 5 },
];

export function DailyStart({
  state,
  onReview,
  onSkip,
}: {
  state: DailyState;
  /** Starts the review queue. */
  onReview: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const left = Math.max(0, state.reviewTarget - state.reviewDone);

  return (
    <section className="ds">
      <p className="ds__eyebrow">{t("daily.eyebrow")}</p>

      {state.stage === "review" ? (
        <>
          <h2 className="ds__title page-title">{t("daily.reviewTitle", { count: left })}</h2>
          <p className="ds__lede">{t("daily.reviewLede")}</p>

          <div className="ds__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={onReview}>
              {t("daily.reviewCta")}
            </button>
            <button type="button" className="ds__skip" onClick={onSkip}>
              {t("daily.skip")}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="ds__title page-title">{t("daily.chooseTitle")}</h2>
          <p className="ds__lede">{t("daily.chooseLede")}</p>

          {/* Three doors, equal weight. Nothing is recommended and nothing is
              marked as the main one: which of these somebody is in the mood
              for is not a thing an algorithm knows, and pretending otherwise
              turns a choice into a suggestion they have to refuse. */}
          <div className="ds__choices">
            {CHOICES.map((choice) => (
              <Link key={choice.key} to={choice.to} className="ds__choice">
                <span className="ds__choiceName">{t(`daily.choice.${choice.key}`)}</span>
                <span className="ds__choiceNote">{t(`daily.choiceNote.${choice.key}`)}</span>
                <span className="ds__choiceTime">{t("daily.minutes", { count: choice.minutes })}</span>
              </Link>
            ))}
          </div>

          <div className="ds__actions ds__actions--quiet">
            <button type="button" className="ds__skip" onClick={onSkip}>
              {t("daily.skip")}
            </button>
          </div>
        </>
      )}

      {/* The review half, once it is behind them. Shown rather than removed,
          because a thing you finished is worth seeing finished. */}
      {state.stage === "choose" && state.reviewTarget > 0 && (
        <p className="ds__done">{t("daily.reviewDone", { count: state.reviewTarget })}</p>
      )}
    </section>
  );
}
