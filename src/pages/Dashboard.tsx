import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/FeatureCard";
import { IconBook, IconPen, IconQuotes, IconBookmark, IconHeadphones } from "@/components/brand/icons";
import { getVocabulary } from "@/lib/vocabularyStore";
import { closeDailyGoal, dailyState, skipDailyGoal, type DailyState } from "@/lib/dailyGoal";
import { DailyStart } from "@/components/daily/DailyStart";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { planSession, type SessionPlan } from "@/lib/session";
import { getDailyGoal, getRecentDays, getStreak } from "@/lib/activityStore";
import { masteredCount } from "@/lib/insights";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import { useCountUp } from "@/lib/useCountUp";
import { pickFirstStep, type FirstStep } from "@/lib/firstStep";
import "@/components/charts/charts.css";
import "./dashboard.css";

const FEATURES = [
  { to: "/dictation", key: "dictation", icon: <IconHeadphones /> },
  { to: "/reading", key: "reading", icon: <IconBook /> },
  { to: "/writing", key: "writing", icon: <IconPen /> },
  { to: "/slang", key: "slang", icon: <IconQuotes /> },
  { to: "/vocabulary", key: "vocabulary", icon: <IconBookmark /> },
] as const;

/**
 * Home, once there is an account behind it.
 *
 * It answers one question — what should I do right now — and it answers it in
 * one glance, because that glance is the whole reason someone opens the app on
 * a tired evening. So the screen has exactly one loud thing, with the single
 * most useful action beside it. Everything else is quiet by design; a dashboard
 * of equally weighted tiles is a dashboard that makes you decide, and deciding
 * is the friction that ends streaks.
 *
 * The loud thing used to be a ring closing on "three tasks today". That number
 * was invented by the app, so clearing it meant doing the three cheapest things
 * available, and the ring said nothing about English. It is now the review
 * queue: a real, finite amount of work that the learner's own past decides, and
 * which genuinely runs out.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  /*
   * What today is, decided rather than counted.
   *
   * This used to show the raw due total, and a raw due total is a wall: after
   * a few months of collecting, an ordinary Tuesday says "ninety-one words",
   * and ninety-one is a number people close the app over. The planner already
   * knows which twenty of those ninety-one are the ones actually slipping, so
   * this shows the session, and says how long it takes.
   */
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const due = plan?.review.length ?? 0;

  /* The day's minimum. Worked out from what was actually finished today, so
     somebody who went and read a text on their own is not asked to do it. */
  const { user } = useAuth();
  const navigate = useNavigate();
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState<{ date: string; count: number }[]>([]);
  const [dayGoal, setDayGoal] = useState(3);
  const [words, setWords] = useState(0);
  const [held, setHeld] = useState(0);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  useEffect(() => {
    setPlan(planSession());
    setDaily(dailyState(user?.id));
    setStreak(getStreak());
    setWeek(getRecentDays(7));
    setDayGoal(getDailyGoal());
    setWords(getVocabulary().length);
    setHeld(masteredCount());
    setProfile(getLearnerProfile());
  }, []);

  /*
   * Nobody has been here before.
   *
   * Nothing has been collected, nothing is held and no day has been counted —
   * which is a different screen from an empty Tuesday, and was being shown as
   * the same one. A first-time visitor was greeted with "welcome back" and
   * then handed three large zeros: the only facts on the screen were three
   * reminders of having nothing. The work to do is right underneath, so the
   * numbers can simply wait until there is a number worth reading.
   *
   * It waits for the first load to finish. `plan` is null until the effect
   * runs, and treating that moment as "new" would flash the beginner's
   * greeting at everybody for a frame.
   */
  /* One concrete thing to do, for somebody who has done nothing yet. */
  const [firstStep, setFirstStep] = useState<FirstStep | null>(null);

  const ready = plan !== null;
  /* Nothing in today's queue has been reviewed before, so "ready for review"
     describes work the learner has not done yet rather than work they are
     repeating. */
  const dueAllNew = Boolean(plan && plan.review.length > 0 && plan.review.every((w) => w.reviewCount === 0));
  const fresh = ready && words === 0 && held === 0 && streak === 0;

  /* Only fetched when there is nothing else to show. Loading the library on
     every dashboard visit would be a cost paid by everybody for a card most
     people will never see again after their first day. */
  useEffect(() => {
    if (!fresh) return;
    let alive = true;
    void pickFirstStep().then((step) => {
      if (alive) setFirstStep(step);
    });
    return () => {
      alive = false;
    };
  }, [fresh]);

  const streakShown = useCountUp(streak, 500);
  const dueShown = useCountUp(due, 700);
  /* `words` is still read — it decides whether the account is new — but it is
     no longer printed, so it needs no count-up. */
  const heldShown = useCountUp(held, 1100);

  /* The headline is the job, not a greeting.
     "С возвращением" in 3.1rem was the largest thing on the screen and said
     nothing; what the person came to find out — how much is waiting and how
     long it takes — was underneath it in grey, and then again inside a card
     below that. One block now: what today is, how long, and the way in. */
  const headline = fresh
    ? t("dashboard.greetingFirst")
    : due > 0
      ? dueAllNew
        ? t("dashboard.dueLineNew", { count: dueShown })
        : t("dashboard.dueLine", { count: dueShown })
      : t("dashboard.nothingDue");

  const subline = fresh
    ? t("dashboard.firstLine")
    : due > 0
      ? plan && plan.dueTotal > plan.review.length
        ? t("dashboard.dueSubCapped", { minutes: plan.minutes, total: plan.dueTotal })
        : t("dashboard.dueSubTimed", { minutes: plan?.minutes ?? 1 })
      : t("dashboard.nextStepSub");

  const daysKept = week.filter((d) => d.count > 0).length;

  return (
    <div className="dash">
      <header className="dash-head">
        {/* Level and goal, as one quiet line that goes back to the questions
            that set them. The level used to sit here as a grey label nothing
            could be done about, and the goal — the thing the learner actually
            told us — was not on this page at all. */}
        {profile && (
          <Link to="/onboarding" className="dash-marks">
            <span className="dash-mark">{profile.level}</span>
            <span className="dash-mark">{t(`onboarding.goals.${profile.goal}.h`)}</span>
          </Link>
        )}

        <h1 className="dash-title">{headline}</h1>
        <p className="dash-sub">{subline}</p>

        {!fresh && !daily?.show && (
          <div className="dash-go">
            {due > 0 ? (
              <>
                <Link to="/vocabulary" className="btn btn--primary">
                  {t("dashboard.reviewNow")}
                </Link>
                <Link to="/dictation" className="btn btn--ghost">
                  {t("nav.dictation")}
                </Link>
              </>
            ) : (
              <>
                <Link to="/dictation" className="btn btn--primary">
                  {t("nav.dictation")}
                </Link>
                <Link to="/reading" className="btn btn--ghost">
                  {t("dashboard.readSomething")}
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Anyone who skipped onboarding, or signed in on a fresh device, still
          needs a level — without one the app guesses, and guesses badly. */}
      {!profile && (
        <Link to="/onboarding" className="card card--interactive dash-ask">
          <span>
            <span className="dash-ask__h">{t("onboarding.promptTitle")}</span>
            <span className="dash-ask__p">{t("onboarding.promptBody")}</span>
          </span>
          <span className="btn btn--primary btn--sm">{t("onboarding.promptCta")}</span>
        </Link>
      )}

      {/* One text, named, with one button.
          A dashboard of equally weighted doors is a decision, and deciding
          what to study is the work people are worst at — asking it of
          somebody in their first thirty seconds is how a first session
          becomes the only one. This replaces that menu for exactly as long
          as the account has nothing in it. */}
      {fresh && firstStep && (
        <Link to={`/reading/${firstStep.bandId}/${firstStep.text.id}`} className="firststep">
          <span className="firststep__eyebrow">{t("dashboard.firstStepEyebrow")}</span>
          <span className="firststep__title">
            {t("dashboard.firstStepTitle", { count: firstStep.minutes })}
          </span>
          <span className="firststep__text">
            <span className="level">{firstStep.text.level}</span>
            {firstStep.text.title}
          </span>
          <span className="firststep__body">{t("dashboard.firstStepBody")}</span>
          <span className="btn btn--primary firststep__go">{t("dashboard.firstStepGo")}</span>
        </Link>
      )}

      {/* The day's minimum takes the hero's place while it has something to
          ask. One question a day, in the spot the learner is already looking,
          and then it is gone until tomorrow. */}
      {daily?.show && (
        <div className="dash-daily">
          <DailyStart
            state={daily}
            onReview={() => navigate("/vocabulary")}
            onSkip={() => {
              skipDailyGoal(user?.id);
              setDaily(dailyState(user?.id));
            }}
            onClose={() => {
              closeDailyGoal(user?.id);
              setDaily(dailyState(user?.id));
            }}
          />
        </div>
      )}

      {/* The week, and the two numbers worth keeping.

          A streak is one number and a cruel one: miss a day and it is zero,
          so the moment it matters most is the moment there is nothing to come
          back to. Seven cells say the same thing without the cliff — a gap is
          a gap, the row is still a row, and a row four-fifths finished is the
          reason to open the app this evening.

          Two figures, not three. "Words collected" went: it grows when you
          press add, which makes it a measure of pressing add. What is held is
          the result, and the streak is the habit. */}
      {!fresh && (
        <section className="dash-pulse" data-reveal>
          <div className="dash-week">
            <ol className="dash-week__row">
              {week.map((d, i) => {
                const state = d.count === 0 ? "" : d.count >= dayGoal ? " is-full" : " is-part";
                const today = i === week.length - 1;
                return (
                  <li
                    key={d.date}
                    className={`dash-week__cell${state}${today ? " is-today" : ""}`}
                    title={`${d.date} · ${d.count}`}
                  />
                );
              })}
            </ol>
            <p className="dash-week__note">{t("dashboard.weekKept", { count: daysKept })}</p>
          </div>

          <dl className="dash-stats">
            <div className="dash-stat">
              <dt className="dash-stat__n dash-stat__n--mint tabular">{heldShown}</dt>
              <dd className="dash-stat__l">{t("dashboard.wordsHeld")}</dd>
            </div>
            <div className="dash-stat">
              <dt className="dash-stat__n tabular">{streakShown}</dt>
              <dd className="dash-stat__l">{t("dashboard.streakDays", { count: streak })}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* The same five destinations as the rail on the left, which on a wide
          screen means the page opens with its own navigation printed twice,
          four inches apart. Below 1024px there is no rail, and then this is
          the only way through the app — so it stays, and hides itself where
          it is a duplicate. */}
      <section className="dash-doors" data-reveal>
        <p className="dash-doors__h">{t("home.chooseMode")}</p>
        <div data-stagger className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.to}
              to={feature.to}
              icon={feature.icon}
              title={t(`nav.${feature.key}`)}
              description={t(`home.descriptions.${feature.key}`, { defaultValue: "" })}
              delay={i * 60}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
