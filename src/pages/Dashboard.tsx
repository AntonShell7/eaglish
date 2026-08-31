import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/FeatureCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { IconBook, IconPen, IconHeadphones, IconChat, IconBookmark } from "@/components/brand/icons";
import { getDueWords } from "@/lib/vocabularyStore";
import { getStreak, getDailyGoal, getTodayCount } from "@/lib/activityStore";
import { getLevelState, getTotalXp } from "@/lib/gamification";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import { useCountUp } from "@/lib/useCountUp";
import "@/components/charts/charts.css";

const FEATURES = [
  { to: "/reading", key: "reading", icon: <IconBook /> },
  { to: "/writing", key: "writing", icon: <IconPen /> },
  { to: "/everyday-english", key: "everydayEnglish", icon: <IconChat /> },
  { to: "/vocabulary", key: "vocabulary", icon: <IconBookmark /> },
  { to: "/listening", key: "listening", icon: <IconHeadphones /> },
] as const;

/**
 * Home, once there is an account behind it.
 *
 * It answers one question — what should I do right now — and it answers it in
 * one glance, because that glance is the whole reason someone opens the app on
 * a tired evening. So the screen has exactly one loud thing: a ring closing on
 * today's goal, with the single most useful action beside it. Everything else
 * is quiet by design; a dashboard of equally weighted tiles is a dashboard that
 * makes you decide, and deciding is the friction that ends streaks.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const [due, setDue] = useState(0);
  const [streak, setStreak] = useState(0);
  const [today, setToday] = useState(0);
  const [goal, setGoal] = useState(3);
  const [level, setLevel] = useState(getLevelState(0));
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  useEffect(() => {
    setDue(getDueWords().length);
    setStreak(getStreak());
    setToday(getTodayCount());
    setGoal(getDailyGoal());
    setLevel(getLevelState(getTotalXp()));
    setProfile(getLearnerProfile());
  }, []);

  const xp = useCountUp(level.xpIntoLevel);
  const streakShown = useCountUp(streak, 500);
  const goalDone = today >= goal;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">{profile ? profile.level : t("dashboard.greeting")}</p>
      <h1 className="page-title mt-2 text-4xl">{t("dashboard.greeting")}</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {streak > 0 ? t("dashboard.streakLine", { count: streakShown }) : t("dashboard.noStreakLine")}
      </p>

      {/* Anyone who skipped onboarding, or signed in on a fresh device, still
          needs a level — without one the app guesses, and guesses badly. */}
      {!profile && (
        <Link
          to="/onboarding"
          className="card card--interactive mt-7 flex flex-wrap items-center justify-between gap-3 p-5"
          style={{ borderColor: "var(--color-primary)", background: "var(--color-primary-soft)" }}
        >
          <span>
            <span className="block text-sm font-bold" style={{ color: "var(--color-primary)" }}>
              {t("onboarding.promptTitle")}
            </span>
            <span className="mt-0.5 block text-xs" style={{ color: "var(--color-primary)" }}>
              {t("onboarding.promptBody")}
            </span>
          </span>
          <span className="btn btn--primary btn--sm">{t("onboarding.promptCta")}</span>
        </Link>
      )}

      {/* The one loud thing on the page. */}
      <section className="card mt-7 overflow-hidden p-6 sm:p-8" style={{ boxShadow: "var(--shadow-2)" }}>
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
          <ProgressRing value={today} max={goal}>
            <span>
              <span className="tabular block text-3xl font-bold" style={{ color: goalDone ? "var(--color-success)" : "var(--color-text)" }}>
                {today}
                <span style={{ color: "var(--color-text-faint)" }}>/{goal}</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-bold tracking-wide uppercase" style={{ color: "var(--color-text-faint)" }}>
                {t("dashboard.todayShort")}
              </span>
            </span>
          </ProgressRing>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="page-title text-2xl">
              {goalDone
                ? t("dashboard.goalMet")
                : due > 0
                  ? t("dashboard.dueLine", { count: due })
                  : t("dashboard.nothingDue")}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {goalDone ? t("dashboard.goalMetSub") : t("dashboard.nextStepSub")}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {due > 0 ? (
                <>
                  <Link to="/vocabulary" className="btn btn--primary">
                    {t("dashboard.reviewNow")}
                  </Link>
                  <Link to="/reading" className="btn btn--ghost">
                    {t("dashboard.readSomething")}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/reading" className="btn btn--primary">
                    {t("dashboard.readSomething")}
                  </Link>
                  <Link to="/writing" className="btn btn--ghost">
                    {t("nav.writing")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Level sits to the side: worth seeing, never worth deciding on. */}
          <div
            className="w-full shrink-0 border-t pt-5 sm:w-40 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-7"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="eyebrow">{t("progress.levelMeter", { level: level.level })}</p>
            <p className="tabular mt-2 text-2xl font-bold">
              {xp}
              <span className="text-sm font-medium" style={{ color: "var(--color-text-faint)" }}>
                {" "}
                / {level.xpForThisLevel} XP
              </span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-surface-3)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(level.progress * 100)}%`,
                  background: "var(--gradient-brand)",
                  transition: "width 900ms var(--ease)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
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
