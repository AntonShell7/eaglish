import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeroFigure, StatTile, Meter } from "@/components/charts/figures";
import { Columns, type ColumnDatum } from "@/components/charts/Columns";
import { Heatmap, type HeatmapCell } from "@/components/charts/Heatmap";
import { TrendLine, type TrendPoint } from "@/components/charts/TrendLine";
import { MixBar, type MixSegment } from "@/components/charts/MixBar";
import { IconFlame, IconTarget } from "@/components/brand/icons";
import { getWritingHistory } from "@/lib/writingHistory";
import { getVocabulary, getDueWords } from "@/lib/vocabularyStore";
import { getUniqueTextsRead, getQuizTotals } from "@/lib/readingHistory";
import {
  getStreak,
  getBestStreak,
  getRecentDays,
  getDailyGoal,
  getTodayCount,
  type ActivityKind,
} from "@/lib/activityStore";
import { getTotalXp, getLevelState, getActivityMix } from "@/lib/gamification";
import "@/components/charts/charts.css";

const MIX_COLORS: Record<ActivityKind, string> = {
  reading: "var(--viz-cat-1)",
  writing: "var(--viz-cat-2)",
  vocabulary: "var(--viz-cat-3)",
  quiz: "var(--viz-cat-4)",
};

function weekdayLabels(locale: string, dates: string[]): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return dates.map((d) => fmt.format(new Date(d)).replace(".", ""));
}

export default function Progress() {
  const { t, i18n } = useTranslation();

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(getLevelState(0));
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [goal, setGoal] = useState(3);
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState<ColumnDatum[]>([]);
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [scores, setScores] = useState<TrendPoint[]>([]);
  const [mix, setMix] = useState<MixSegment[]>([]);
  const [textsRead, setTextsRead] = useState(0);
  const [quiz, setQuiz] = useState({ correct: 0, total: 0 });
  const [words, setWords] = useState(0);
  const [due, setDue] = useState(0);

  useEffect(() => {
    const total = getTotalXp();
    setXp(total);
    setLevel(getLevelState(total));
    setStreak(getStreak());
    setBest(getBestStreak());
    setGoal(getDailyGoal());
    setToday(getTodayCount());

    const last7 = getRecentDays(7);
    const labels = weekdayLabels(i18n.language, last7.map((d) => d.date));
    setWeek(last7.map((d, i) => ({ label: labels[i], value: d.count, title: d.date })));

    setCells(getRecentDays(70));

    const history = getWritingHistory();
    setScores(
      [...history]
        .reverse()
        .slice(-12)
        .map((s, i) => ({ label: String(i + 1), value: s.scores.overall })),
    );

    const m = getActivityMix();
    const mixLabel: Record<ActivityKind, string> = {
      reading: t("nav.reading"),
      writing: t("nav.writing"),
      vocabulary: t("nav.vocabulary"),
      quiz: t("reading.comprehension"),
    };
    setMix(
      (Object.keys(m) as ActivityKind[]).map((k) => ({
        key: k,
        label: mixLabel[k],
        value: m[k],
        color: MIX_COLORS[k],
      })),
    );

    setTextsRead(getUniqueTextsRead());
    setQuiz(getQuizTotals());
    setWords(getVocabulary().length);
    setDue(getDueWords().length);
  }, [i18n.language, t]);

  const history = getWritingHistory();
  const avgScore = history.length
    ? Math.round(history.reduce((s, x) => s + x.scores.overall, 0) / history.length)
    : "—";

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("progress.title")}</h1>

      {/* Hero + level meter: exactly one hero figure on the page */}
      <section
        className="viz mt-6 grid gap-6 rounded-[var(--radius-lg)] border p-6 lg:grid-cols-[auto_1fr] lg:items-center"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <HeroFigure value={xp} label={t("progress.dashboardLead")} caption={t("progress.dashboardCaption")} />
        <div className="space-y-4 lg:pl-8">
          <Meter
            value={level.xpIntoLevel}
            max={level.xpForThisLevel}
            label={t("progress.levelMeter", { level: level.level })}
            valueLabel={`${level.xpIntoLevel} / ${level.xpForThisLevel} XP`}
          />
          <Meter
            value={today}
            max={goal}
            label={t("progress.todayGoal")}
            valueLabel={t("progress.goalProgress", { done: today, target: goal })}
            done={today >= goal}
          />
        </div>
      </section>

      {/* KPI row */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label={t("progress.streak")}
          value={streak}
          hint={streak === 0 ? t("progress.streakNone") : t("progress.bestStreak", { count: best })}
          icon={<IconFlame />}
        />
        <StatTile label={t("progress.textsOpened")} value={textsRead} />
        <StatTile
          label={t("progress.questionsCorrect")}
          value={quiz.total ? `${quiz.correct}/${quiz.total}` : "—"}
          icon={<IconTarget />}
        />
        <StatTile label={t("progress.wordsSaved")} value={words} hint={t("progress.wordsDue") + `: ${due}`} />
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Columns
          data={week}
          title={t("progress.weeklyTitle")}
          subtitle={t("progress.weeklySub")}
          unitLabel={t("progress.count").toLowerCase()}
        />
        <TrendLine
          points={scores}
          title={t("progress.scoresTitle")}
          subtitle={t("progress.scoresSub")}
          emptyLabel={t("progress.noSubmissions")}
        />
        <Heatmap cells={cells} title={t("progress.heatmapTitle")} subtitle={t("progress.heatmapSub")} scaleMax={goal} />
        <MixBar
          segments={mix}
          title={t("progress.mixTitle")}
          subtitle={t("progress.mixSub")}
          emptyLabel={t("progress.noActivityYet")}
        />
      </div>

      {history.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatTile label={t("progress.piecesSubmitted")} value={history.length} />
          <StatTile label={t("progress.latestScore")} value={history[0].scores.overall} />
          <StatTile label={t("progress.averageScore")} value={avgScore} />
        </div>
      )}
    </div>
  );
}
