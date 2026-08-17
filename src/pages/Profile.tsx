import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Meter, StatTile } from "@/components/charts/figures";
import { IconFlame, IconBolt, IconBookmark } from "@/components/brand/icons";
import { getStreak, getBestStreak, getDailyGoal, setDailyGoal, getTodayCount } from "@/lib/activityStore";
import { getVocabulary } from "@/lib/vocabularyStore";
import { getTotalXp, getLevelState, getAchievements, isUnlocked, type Achievement } from "@/lib/gamification";
import "@/components/charts/charts.css";

const GOAL_CHOICES = [1, 3, 5, 10];

function AchievementCard({ item }: { item: Achievement }) {
  const { t } = useTranslation();
  const unlocked = isUnlocked(item);
  const pct = Math.min(100, Math.round((item.progress / item.target) * 100));

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4"
      style={{
        borderColor: unlocked ? "var(--color-primary)" : "var(--color-border)",
        background: unlocked ? "var(--color-primary-soft)" : "var(--color-surface)",
        opacity: unlocked ? 1 : 0.72,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold" style={unlocked ? { color: "var(--color-primary)" } : undefined}>
          {t(`achievements.${item.key}.name`)}
        </p>
        <span aria-hidden style={{ color: unlocked ? "var(--color-primary)" : "var(--color-text-muted)" }}>
          {unlocked ? "✓" : item.icon}
        </span>
      </div>

      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {t(`achievements.${item.key}.desc`)}
      </p>

      {!unlocked && (
        <>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-surface-2)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {item.progress} / {item.target}
          </p>
        </>
      )}
    </div>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(getLevelState(0));
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [words, setWords] = useState(0);
  const [goal, setGoal] = useState(3);
  const [today, setToday] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const refresh = () => {
    const total = getTotalXp();
    setXp(total);
    setLevel(getLevelState(total));
    setStreak(getStreak());
    setBest(getBestStreak());
    setWords(getVocabulary().length);
    setGoal(getDailyGoal());
    setToday(getTodayCount());
    setAchievements(getAchievements());
  };

  useEffect(refresh, []);

  const unlockedCount = achievements.filter(isUnlocked).length;

  const chooseGoal = (n: number) => {
    setDailyGoal(n);
    refresh();
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("profile.title")}</h1>

      {/* Identity + level */}
      <section
        className="viz mt-6 rounded-[var(--radius-lg)] border p-6"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="flex h-16 w-16 flex-none items-center justify-center rounded-full"
            style={{ background: "var(--color-primary-soft)" }}
          >
            <BrandLogo variant="chip" className="h-9 w-9" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold">{t("profile.level", { level: level.level })}</p>
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
              className="rounded-full px-4 py-2 text-sm font-semibold on-primary"
              style={{ background: "var(--color-primary)" }}
            >
              {t("profile.signIn")}
            </Link>
          )}
        </div>

        <div className="mt-6">
          <Meter
            value={level.xpIntoLevel}
            max={level.xpForThisLevel}
            label={t("progress.levelMeter", { level: level.level })}
            valueLabel={t("profile.xpToNext", {
              current: level.xpIntoLevel,
              target: level.xpForThisLevel,
              next: level.level + 1,
            })}
          />
        </div>
      </section>

      {/* KPI row — headline numbers, not charts */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t("profile.totalXp")} value={xp} icon={<IconBolt />} />
        <StatTile
          label={t("progress.streak")}
          value={streak}
          hint={t("progress.bestStreak", { count: best })}
          icon={<IconFlame />}
        />
        <StatTile label={t("progress.wordsSaved")} value={words} icon={<IconBookmark />} />
        <StatTile label={t("progress.todayGoal")} value={`${today}/${goal}`} />
      </div>

      {/* Achievements */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="page-title text-xl">{t("profile.achievements")}</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("profile.unlockedCount", { unlocked: unlockedCount, total: achievements.length })}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <AchievementCard key={a.id} item={a} />
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="mt-10">
        <h2 className="page-title text-xl">{t("profile.settings")}</h2>
        <div
          className="mt-4 rounded-[var(--radius-lg)] border p-6"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p className="text-sm font-semibold">{t("profile.dailyGoalLabel")}</p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {t("profile.dailyGoalHint")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GOAL_CHOICES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => chooseGoal(n)}
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{
                  borderColor: goal === n ? "var(--color-primary)" : "var(--color-border)",
                  color: goal === n ? "var(--color-primary)" : "var(--color-text-muted)",
                  background: goal === n ? "var(--color-primary-soft)" : "transparent",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
