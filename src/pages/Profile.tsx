import { hasSlangAward } from "@/lib/learningRecords";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/context/AccessContext";
import { RedeemCode } from "@/components/access/RedeemCode";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { StatTile } from "@/components/charts/figures";
import { IconFlame, IconBookmark } from "@/components/brand/icons";
import { getStreak, getBestStreak } from "@/lib/activityStore";
import { getReadingHistory } from "@/lib/readingHistory";
import { getVocabulary } from "@/lib/vocabularyStore";
import { getLearnerProfile, type LearnerProfile } from "@/lib/learnerProfile";
import { whenSynced } from "@/lib/sync";
import { deleteAccount } from "@/lib/account";
import "@/components/charts/charts.css";
import "./profile.css";


export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { plan, isPro, expiresAt, loading: accessLoading } = useAccess();
  const dateLabel = (date: string) => new Date(date).toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" });
  const navigate = useNavigate();

  const [slangAward,setSlangAward]=useState(hasSlangAward);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [words, setWords] = useState(0);
  const [textsRead, setTextsRead] = useState(0);
  const [learner, setLearner] = useState<LearnerProfile | null>(null);

  const refresh = () => {
    setSlangAward(hasSlangAward());
    setStreak(getStreak());
    setBest(getBestStreak());
    setWords(getVocabulary().length);
    setTextsRead(getReadingHistory().length);
    setLearner(getLearnerProfile());
  };

  useEffect(() => {
    let active = true;
    refresh();
    window.addEventListener("learning-records",refresh);
    void whenSynced().then(() => { if (active) refresh(); });
    return () => { active = false;window.removeEventListener("learning-records",refresh); };
  }, [user?.id]);


  return (
    <div className="profile-page mx-auto max-w-5xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("profile.title")}</h1>

      {slangAward && <section className="card mt-6 p-6"><strong>🏅 Slang Explorer</strong><p>Ты прошёл полный курс Slang. Отличная работа!</p></section>}
      {/* Identity + level */}
      <section className="profile-identity card viz mt-6 p-6">
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
            {user?.created_at && Number.isFinite(Date.parse(user.created_at)) && <p className="profile-member">{t("profile.memberSince")} {dateLabel(user.created_at)}</p>}
          </div>

          {user ? (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
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

      {/* The plan.
          Immediately under the identity card, because "what am I paying for"
          belongs with "who am I signed in as" — and because this is where
          somebody who was sent a code comes looking for the box to type it
          into, having found nothing on the dashboard. */}
      {user && (
        <section className="profile-plan card mt-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">{t("profile.plan")}</p>
              <p className="mt-1 text-lg font-extrabold">
                {accessLoading ? t("profile.planLoading") : t(`pricing.plans.${plan}.name`)}
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {accessLoading ? t("profile.planLoading") : isPro
                  ? expiresAt
                    ? t("pricing.have.until", {
                        date: dateLabel(expiresAt),
                      })
                    : t("pricing.have.forever")
                  : t("profile.planFreeHint")}
              </p>
            </div>

            {!accessLoading && (
              <Link to="/pricing" className="btn btn--primary">
                {t("profile.seePlans")}
              </Link>
            )}
          </div>

          {!accessLoading && <div className="profile-entitlements">
            <span className="profile-status"><i aria-hidden="true" />{t(isPro ? "profile.proActive" : "profile.freeActive")}</span>
            <ul>{(isPro ? ["reading", "vocabulary", "dictation", "writing", "slang"] : ["slang", "dictation", "reading", "vocabulary", "progress"]).map(section => <li key={section}>{t(`nav.${section}`)}</li>)}</ul>
          </div>}
          {!accessLoading && !isPro && (
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
              <p className="eyebrow">{t("pricing.code.haveOne")}</p>
              <RedeemCode compact />
            </div>
          )}
        </section>
      )}

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

      <AccountControls />
    </div>
  );
}

/** The first button only opens the dialog. Deletion needs a separate acknowledgement. */
function AccountControls() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (!acknowledged || submitting.current || !dialog.current?.open) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const outcome = await deleteAccount();
      if (outcome === "ok") { dialog.current?.close(); navigate("/", { replace: true }); return; }
      setError(outcome === "not-signed-in" ? t("account.deleteNotSignedIn") : t("account.deleteFailed"));
    } catch { setError(t("account.deleteFailed")); }
    finally { submitting.current = false; setBusy(false); }
  };

  return (
    <section className="profile-account">
      <div><h2>{t("account.deleteTitle")}</h2><p>{t("account.deleteBody")}</p></div>
      <button ref={trigger} type="button" className="btn btn--ghost btn--sm" onClick={() => {
        setAcknowledged(false); setError(null); dialog.current?.showModal();
      }}>{t("account.deleteButton")}</button>
      <dialog ref={dialog} className="profile-delete" aria-labelledby="delete-title" aria-describedby="delete-description"
        onCancel={event => { if (submitting.current) event.preventDefault(); }}
        onClose={() => { setAcknowledged(false); trigger.current?.focus(); }}>
        <h2 id="delete-title">{t("account.deleteTitle")}</h2>
        <p id="delete-description">{t("account.deleteConfirmBody")}</p>
        <label className="profile-delete__ack"><input type="checkbox" checked={acknowledged} disabled={busy}
          onChange={event => setAcknowledged(event.target.checked)} />{t("account.deleteAcknowledge")}</label>
        {error && <p role="alert" className="profile-delete__error">{error}</p>}
        <div className="profile-delete__actions">
          <button autoFocus type="button" className="btn btn--ghost" disabled={busy} onClick={() => dialog.current?.close()}>{t("common.cancel")}</button>
          <button type="button" className="btn profile-delete__confirm" disabled={busy || !acknowledged} onClick={remove}>
            {busy ? t("account.deleting") : t("account.deleteConfirm")}
          </button>
        </div>
      </dialog>
    </section>
  );
}
