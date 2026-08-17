import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconFlame, IconBolt, IconTarget } from "@/components/brand/icons";
import { ACTIVITY_EVENT, getStreak, getDailyGoal, getTodayCount } from "@/lib/activityStore";
import { getTotalXp, getLevelState } from "@/lib/gamification";

/**
 * The always-visible status strip: streak, XP and today's goal.
 *
 * Keeping these on screen is what makes a daily habit feel accountable — the
 * numbers are the reason to come back, so they shouldn't be buried on a
 * separate page. Re-reads on every navigation so it never shows stale counts.
 */
export function StatsStrip({ routeKey }: { routeKey: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ streak: 0, xp: 0, level: 1, today: 0, goal: 3 });

  useEffect(() => {
    const read = () =>
      setState({
        streak: getStreak(),
        xp: getTotalXp(),
        level: getLevelState().level,
        today: getTodayCount(),
        goal: getDailyGoal(),
      });

    read();
    // Finishing a task has to move these numbers immediately — waiting for the
    // next navigation would make the reward feel unrelated to the work.
    window.addEventListener(ACTIVITY_EVENT, read);
    return () => window.removeEventListener(ACTIVITY_EVENT, read);
  }, [routeKey]);

  const goalDone = state.today >= state.goal;

  return (
    <div className="stats-strip">
      <span className="stat-chip" title={t("progress.streak")}>
        <IconFlame />
        {state.streak}
        <span className="stat-chip__unit">{t("shell.dayStreakShort")}</span>
      </span>

      <span className="stat-chip" title={t("shell.xpTitle", { level: state.level })}>
        <IconBolt />
        {state.xp}
        <span className="stat-chip__unit">XP</span>
      </span>

      <span
        className="stat-chip"
        title={t("progress.todayGoal")}
        style={goalDone ? { borderColor: "var(--color-success)", color: "var(--color-success)" } : undefined}
      >
        <IconTarget />
        {state.today}/{state.goal}
      </span>
    </div>
  );
}
