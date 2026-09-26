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
import { deleteAccount, downloadJson, exportMyData } from "@/lib/account";
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
          icon={<IconFlame alive={streak > 0} />}
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

      <DataControls />
    </div>
  );
}

/**
 * Your data, and the door out.
 *
 * Kept at the bottom and kept plain. These are not features to be sold — they
 * are the two things the privacy policy already promises, and a policy whose
 * promises have no buttons behind them is a sentence rather than a commitment.
 *
 * Deleting asks twice, and the second ask spells out exactly what goes,
 * because this is the one action in the app that cannot be undone.
 */
function DataControls() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(exportMyData(user?.email ?? null), `eaglish-${stamp}.json`);
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    const outcome = await deleteAccount();
    setBusy(false);

    if (outcome === "ok") {
      navigate("/", { replace: true });
      return;
    }
    setError(outcome === "not-signed-in" ? t("account.deleteNotSignedIn") : t("account.deleteFailed"));
  };

  return (
    <section className="mt-12">
      <p className="eyebrow">{t("account.title")}</p>

      <div className="card mt-4 p-5">
        <p className="text-sm font-semibold">{t("account.exportTitle")}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("account.exportBody")}
        </p>
        <button type="button" className="btn btn--ghost btn--sm mt-4" onClick={save}>
          {t("account.exportButton")}
        </button>
      </div>

      <div className="card mt-4 p-5" style={{ borderColor: confirming ? "var(--color-danger)" : undefined }}>
        <p className="text-sm font-semibold">{t("account.deleteTitle")}</p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {confirming ? t("account.deleteConfirmBody") : t("account.deleteBody")}
        </p>

        {error && (
          <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {confirming ? (
            <>
              <button
                type="button"
                className="btn btn--sm"
                style={{ background: "var(--color-danger)", color: "#fff" }}
                onClick={remove}
                disabled={busy}
              >
                {busy ? t("account.deleting") : t("account.deleteConfirm")}
              </button>
              <button
                type="button"
                className="btn btn--quiet btn--sm"
                onClick={() => setConfirming(false)}
                disabled={busy}
              >
                {t("common.cancel")}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(true)}>
              {t("account.deleteButton")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
