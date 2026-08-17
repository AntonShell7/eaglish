import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/FeatureCard";
import { Meter } from "@/components/charts/figures";
import { IconBook, IconPen, IconHeadphones, IconChat, IconBookmark } from "@/components/brand/icons";
import { getDueWords } from "@/lib/vocabularyStore";
import { getStreak, getDailyGoal, getTodayCount } from "@/lib/activityStore";
import { getLevelState, getTotalXp } from "@/lib/gamification";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import "@/components/charts/charts.css";

const FEATURES = [
  { to: "/reading", key: "reading", icon: <IconBook /> },
  { to: "/writing", key: "writing", icon: <IconPen /> },
  { to: "/listening", key: "listening", icon: <IconHeadphones /> },
  { to: "/everyday-english", key: "everydayEnglish", icon: <IconChat /> },
  { to: "/vocabulary", key: "vocabulary", icon: <IconBookmark /> },
] as const;

/**
 * Home once there's an account behind it.
 *
 * No pitch and no sign-up button — those belong to the landing page. This
 * answers one question instead: what should I do right now? Words that are due
 * lead, because a review that's overdue is the thing most likely to be lost.
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

  const goalDone = today >= goal;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("dashboard.greeting")}</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {streak > 0 ? t("dashboard.streakLine", { count: streak }) : t("dashboard.noStreakLine")}
        {profile && ` · ${profile.level}`}
      </p>

      {/* Anyone who skipped onboarding, or signed in on a fresh device, still
          needs a level — without one the app guesses, and guesses badly. */}
      {!profile && (
        <Link
          to="/onboarding"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border p-5"
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
          <span className="rounded-full px-4 py-2 text-xs font-bold on-primary" style={{ background: "var(--color-primary)" }}>
            {t("onboarding.promptCta")}
          </span>
        </Link>
      )}

      {/* Today: the goal, and whatever is waiting */}
      <section
        className="viz mt-6 grid gap-6 rounded-[var(--radius-lg)] border p-6 lg:grid-cols-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <div className="space-y-4">
          <Meter
            value={today}
            max={goal}
            label={t("progress.todayGoal")}
            valueLabel={t("progress.goalProgress", { done: today, target: goal })}
            done={goalDone}
          />
          <Meter
            value={level.xpIntoLevel}
            max={level.xpForThisLevel}
            label={t("progress.levelMeter", { level: level.level })}
            valueLabel={`${level.xpIntoLevel} / ${level.xpForThisLevel} XP`}
          />
        </div>

        <div className="flex flex-col justify-center gap-3">
          {due > 0 ? (
            <>
              <p className="text-sm">{t("dashboard.dueLine", { count: due })}</p>
              <Link
                to="/vocabulary"
                className="w-fit rounded-full px-5 py-3 text-sm font-semibold on-primary"
                style={{ background: "var(--color-primary)" }}
              >
                {t("dashboard.reviewNow")}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("dashboard.nothingDue")}
              </p>
              <Link
                to="/reading"
                className="w-fit rounded-full px-5 py-3 text-sm font-semibold on-primary"
                style={{ background: "var(--color-primary)" }}
              >
                {t("dashboard.readSomething")}
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-title">{t("home.chooseMode")}</h2>
        <div className="section-rule">
          <span className="section-rule__dot" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
