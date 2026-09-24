import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { StatTile } from "@/components/charts/figures";
import { IconFlame, IconBookmark } from "@/components/brand/icons";
import { getStreak, getBestStreak } from "@/lib/activityStore";
import { getReadingHistory } from "@/lib/readingHistory";
import { getVocabulary } from "@/lib/vocabularyStore";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import "@/components/charts/charts.css";


export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [words, setWords] = useState(0);
  const [textsRead, setTextsRead] = useState(0);
  const [learner, setLearner] = useState<LearnerProfile | null>(null);

  const refresh = () => {
    setStreak(getStreak());
    setBest(getBestStreak());
    setWords(getVocabulary().length);
    setTextsRead(getReadingHistory().length);
    setLearner(getLearnerProfile());
  };

  useEffect(refresh, []);


  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("profile.title")}</h1>

      {/* Identity + level */}
      <section className="card viz mt-6 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="flex h-16 w-16 flex-none items-center justify-center rounded-full"
            style={{ background: "var(--color-primary-soft)" }}
          >
            <BrandLogo variant="chip" className="h-9 w-9" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold">{learner?.level ?? t("profile.noLevelYet")}</p>
            <p className="truncate text-sm" style={{ color: "var(--color-text-muted)" }}>
              {user ? `${t("profile.signedInAs")} ${user.email}` : t("profile.notSignedIn")}
            </p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-danger)" }}
            >
              {t("nav.logOut")}
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn--primary"
            >
              {t("profile.signIn")}
            </Link>
          )}
        </div>

      </section>

      {/* KPI row — headline numbers, not charts */}
      {/* Three counts, all of them about English. XP and "0/3 today" lived
          here after being removed everywhere else, and achievements filled
          half the page with badges for things the numbers already say. */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile
          label={t("progress.streak")}
          value={streak}
          hint={t("progress.bestStreak", { count: best })}
          icon={<IconFlame />}
        />
        <StatTile label={t("progress.wordsSaved")} value={words} icon={<IconBookmark />} />
        <StatTile label={t("progress.textsOpened")} value={textsRead} />
      </div>

      {/* Settings */}
      {/* The onboarding answers, editable by retaking the flow. */}
      <section className="mt-10">
        <h2 className="page-title text-xl">{t("onboarding.planTitle")}</h2>
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-4 p-5">
          {learner ? (
            <dl className="grid flex-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t("onboarding.planLevel")}
                </dt>
                <dd className="text-sm font-semibold">
                  {learner.level}
                  {learner.placement && !learner.placement.selfReported
                    ? ` · ${t("onboarding.byTest", { correct: learner.placement.correct, total: learner.placement.total })}`
                    : ` · ${t("onboarding.selfReported")}`}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t("onboarding.planGoal")}
                </dt>
                <dd className="text-sm font-semibold">{t(`onboarding.goals.${learner.goal}.h`)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t("onboarding.planTopics")}
                </dt>
                <dd className="text-sm font-semibold">
                  {learner.interests.length > 0
                    ? learner.interests.map((x) => t(`onboarding.topics.${x}`)).join(", ")
                    : t("onboarding.planTopicsAny")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  {t("onboarding.planPace")}
                </dt>
                <dd className="text-sm font-semibold">{t("onboarding.tasksPerDay", { count: learner.dailyGoal })}</dd>
              </div>
            </dl>
          ) : (
            <p className="flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("onboarding.promptBody")}
            </p>
          )}

          <Link
            to="/onboarding"
            className="btn btn--primary"
          >
            {learner ? t("onboarding.retake") : t("onboarding.promptCta")}
          </Link>
        </div>
      </section>

      <section className="mt-10">
      </section>
    </div>
  );
}
