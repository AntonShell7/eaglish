import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/FeatureCard";
import { IconBook, IconPen, IconChat, IconBookmark, IconHeadphones } from "@/components/brand/icons";
import { getDueWords, getVocabulary } from "@/lib/vocabularyStore";
import { getStreak } from "@/lib/activityStore";
import { masteredCount } from "@/lib/insights";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import { useCountUp } from "@/lib/useCountUp";
import "@/components/charts/charts.css";

const FEATURES = [
  { to: "/dictation", key: "dictation", icon: <IconHeadphones /> },
  { to: "/reading", key: "reading", icon: <IconBook /> },
  { to: "/writing", key: "writing", icon: <IconPen /> },
  { to: "/everyday-english", key: "everydayEnglish", icon: <IconChat /> },
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
  const [due, setDue] = useState(0);
  const [streak, setStreak] = useState(0);
  const [words, setWords] = useState(0);
  const [held, setHeld] = useState(0);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  useEffect(() => {
    setDue(getDueWords().length);
    setStreak(getStreak());
    setWords(getVocabulary().length);
    setHeld(masteredCount());
    setProfile(getLearnerProfile());
  }, []);

  const streakShown = useCountUp(streak, 500);
  const dueShown = useCountUp(due, 700);
  const wordsShown = useCountUp(words, 900);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {profile && <p className="eyebrow">{profile.level}</p>}
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
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-10">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{due > 0 ? t("dashboard.dueLabel") : t("dashboard.queueClearLabel")}</p>

            <h2 className="page-title mt-2 text-3xl">
              {due > 0 ? t("dashboard.dueLine", { count: dueShown }) : t("dashboard.nothingDue")}
            </h2>

            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
              {due > 0 ? t("dashboard.dueSub") : t("dashboard.nextStepSub")}
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

          {/* The two numbers worth seeing without being asked: how much you
              have collected, and how much of it is genuinely held. Neither is
              a score — both are counts of your own English. */}
          <div
            className="grid shrink-0 grid-cols-2 gap-6 border-t pt-6 lg:w-56 lg:grid-cols-1 lg:gap-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-9"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div>
              <p className="tabular text-3xl font-bold leading-none">{wordsShown}</p>
              <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {t("dashboard.wordsCollected", { count: words })}
              </p>
            </div>
            <div>
              <p className="tabular text-3xl font-bold leading-none" style={{ color: "var(--color-primary)" }}>
                {held}
              </p>
              <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {t("dashboard.wordsHeld")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
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
