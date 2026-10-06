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
import { getStreak } from "@/lib/activityStore";
import { masteredCount } from "@/lib/insights";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import { useCountUp } from "@/lib/useCountUp";
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
  const [words, setWords] = useState(0);
  const [held, setHeld] = useState(0);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  useEffect(() => {
    setPlan(planSession());
    setDaily(dailyState(user?.id));
    setStreak(getStreak());
    setWords(getVocabulary().length);
    setHeld(masteredCount());
    setProfile(getLearnerProfile());
  }, []);

  const streakShown = useCountUp(streak, 500);
  const dueShown = useCountUp(due, 700);
  const wordsShown = useCountUp(words, 900);
  const heldShown = useCountUp(held, 1100);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {profile && <p className="eyebrow">{profile.level}</p>}
      {/* Sized through the token rather than a utility class, so it still
          shrinks on a narrow phone — Russian headings are long and a fixed
          size runs off the side. */}
      <h1
        className="page-title mt-2"
        style={{ "--page-title-size": "3.1rem" } as React.CSSProperties}
      >
        {t("dashboard.greeting")}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {streak > 0 ? t("dashboard.streakLine", { count: streakShown }) : t("dashboard.noStreakLine")}
      </p>

      {/* Your own English, in three numbers.
          These were two small figures in the right-hand gutter of the queue
          card, where they read as metadata about the card rather than as facts
          about the learner. They are the only things on this screen that grow
          over months, which makes them the reason to open it on a day when
          there is nothing due, so they get the width and the size.

          They count up rather than appear. That is not decoration: a number
          that lands on 340 from below is read as having got there, which is
          exactly what it did. */}
      <dl className="dash-stats" data-stagger>
        <div className="dash-stat">
          <dt className="dash-stat__n tabular">{wordsShown}</dt>
          <dd className="dash-stat__l">{t("dashboard.wordsCollected", { count: words })}</dd>
        </div>
        <div className="dash-stat">
          <dt className="dash-stat__n dash-stat__n--mint tabular">{heldShown}</dt>
          <dd className="dash-stat__l">{t("dashboard.wordsHeld")}</dd>
        </div>
        <div className="dash-stat">
          <dt className="dash-stat__n tabular">{streakShown}</dt>
          <dd className="dash-stat__l">{t("dashboard.streakDays", { count: streak })}</dd>
        </div>
      </dl>

      {/* Anyone who skipped onboarding, or signed in on a fresh device, still
          needs a level — without one the app guesses, and guesses badly. */}
      {!profile && (
        <Link
          to="/onboarding"
          /* A hairline card with one mint word, not a mint panel. Filling it
             made the only optional thing on the page the loudest thing on it. */
          className="card card--interactive mt-7 flex flex-wrap items-center justify-between gap-3 p-5"
        >
          <span>
            <span className="block text-sm font-bold" style={{ color: "var(--color-primary)" }}>
              {t("onboarding.promptTitle")}
            </span>
            <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
              {t("onboarding.promptBody")}
            </span>
          </span>
          <span className="btn btn--primary btn--sm">{t("onboarding.promptCta")}</span>
        </Link>
      )}

      {/* The day's minimum takes the hero's place while it has something to
          ask. One question a day, in the spot the learner is already looking,
          and then it is gone until tomorrow. */}
      {daily?.show && (
        <div className="mt-7">
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

      {/* The ordinary dashboard, once the panel is answered or skipped. */}
      {!daily?.show && (
      <section className="card mt-7 overflow-hidden p-6 sm:p-8" data-reveal style={{ boxShadow: "var(--shadow-2)" }}>
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-10">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{due > 0 ? t("dashboard.dueLabel") : t("dashboard.queueClearLabel")}</p>

            <h2 className="page-title mt-2 text-3xl">
              {due > 0 ? t("dashboard.dueLine", { count: dueShown }) : t("dashboard.nothingDue")}
            </h2>

            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
              {due > 0
                ? plan && plan.dueTotal > plan.review.length
                  ? t("dashboard.dueSubCapped", { minutes: plan.minutes, total: plan.dueTotal })
                  : t("dashboard.dueSubTimed", { minutes: plan?.minutes ?? 1 })
                : t("dashboard.nextStepSub")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
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
          </div>

        </div>
      </section>
      )}

      {/* The same five destinations as the rail on the left, which on a wide
          screen means the page opens with its own navigation printed twice,
          four inches apart. Below 1024px there is no rail, and then this is
          the only way through the app — so it stays, and hides itself where
          it is a duplicate. */}
      <section className="dash-doors mt-12" data-reveal>
        <p className="eyebrow">{t("home.chooseMode")}</p>
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
