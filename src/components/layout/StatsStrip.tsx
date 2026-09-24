import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { IconFlame, IconBookmark } from "@/components/brand/icons";
import { ACTIVITY_EVENT, getStreak } from "@/lib/activityStore";
import { getDueWords, getVocabulary } from "@/lib/vocabularyStore";

/**
 * The always-visible strip.
 *
 * It used to carry XP and a daily goal of three tasks, and both were points
 * awarded for attendance: neither number said anything about English, and an
 * arbitrary target invites you to do the cheapest three things that clear it.
 *
 * What is left is what a learner would actually want glanced at — how many
 * words they hold, how many are due back today, and the streak, which is the
 * one game mechanic that measures something real: whether you showed up.
 * The due count is a link, because unlike a score it is something to act on.
 */
export function StatsStrip({ routeKey }: { routeKey: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ streak: 0, words: 0, due: 0 });

  useEffect(() => {
    const read = () =>
      setState({ streak: getStreak(), words: getVocabulary().length, due: getDueWords().length });

    read();
    window.addEventListener(ACTIVITY_EVENT, read);
    return () => window.removeEventListener(ACTIVITY_EVENT, read);
  }, [routeKey]);

  return (
    <div className="stats-strip">
      {state.streak > 0 && (
        <span className="stat-chip" title={t("progress.streak")}>
          <IconFlame alive />
          {state.streak}
          <span className="stat-chip__unit">{t("shell.dayStreakShort")}</span>
        </span>
      )}

      <span className="stat-chip" title={t("shell.wordsTitle")}>
        <IconBookmark />
        {state.words}
        <span className="stat-chip__unit">{t("shell.wordsCount", { count: state.words })}</span>
      </span>

      {state.due > 0 && (
        <Link
          to="/vocabulary"
          className="stat-chip stat-chip--due"
          title={t("shell.dueTitle")}
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-ink)" }}
        >
          {state.due}
          <span className="stat-chip__unit">{t("shell.dueShort")}</span>
        </Link>
      )}
    </div>
  );
}
