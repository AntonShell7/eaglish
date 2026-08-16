import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getWritingHistory, type WritingSubmission } from "@/lib/writingHistory";
import { getVocabulary, getDueWords } from "@/lib/vocabularyStore";
import { getUniqueTextsRead, getQuizTotals } from "@/lib/readingHistory";
import { getStreak, getBestStreak, getRecentDays, getDailyGoal, getTodayCount } from "@/lib/activityStore";

type Tab = "reading" | "writing" | "listening";

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-6"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <p className="text-3xl font-extrabold" style={{ color: "var(--color-primary)" }}>
        {value}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

function StreakPanel() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [days, setDays] = useState<{ date: string; count: number }[]>([]);
  const [goal, setGoal] = useState(3);
  const [today, setToday] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    setBest(getBestStreak());
    setDays(getRecentDays(14));
    setGoal(getDailyGoal());
    setToday(getTodayCount());
  }, []);

  const pct = Math.min(100, Math.round((today / goal) * 100));

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-6"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold" style={{ color: "var(--color-accent)" }}>
              {streak}
            </span>
            <span className="text-sm font-semibold">{t("progress.streak")}</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {streak === 0 ? t("progress.streakNone") : t("progress.bestStreak", { count: best })}
          </p>
        </div>

        <div className="min-w-[190px] flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">{t("progress.todayGoal")}</span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {t("progress.goalProgress", { done: today, target: goal })}
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full"
            style={{ background: "var(--color-surface-2)" }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? "var(--color-success)" : "var(--color-primary)",
              }}
            />
          </div>
          {pct >= 100 && (
            <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--color-success)" }}>
              {t("progress.goalDone")}
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
        {t("progress.activity")}
      </p>
      <div className="mt-2 flex gap-1.5">
        {days.map((d) => {
          const intensity = d.count === 0 ? 0 : Math.min(1, d.count / goal);
          return (
            <div
              key={d.date}
              title={`${d.date} — ${d.count}`}
              className="h-8 flex-1 rounded"
              style={{
                background:
                  intensity === 0
                    ? "var(--color-surface-2)"
                    : `color-mix(in srgb, var(--color-primary) ${25 + intensity * 75}%, transparent)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function WritingChart({ history }: { history: WritingSubmission[] }) {
  const { t } = useTranslation();
  const recent = [...history].reverse().slice(-10);

  if (recent.length === 0) {
    return (
      <p className="py-10 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("progress.noSubmissions")}
      </p>
    );
  }

  return (
    <div className="flex h-40 items-end gap-2">
      {recent.map((s) => (
        <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-300"
            style={{ height: `${s.scores.overall * 10}%`, background: "var(--color-primary)" }}
            title={`${s.scores.overall}/10`}
          />
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {s.scores.overall}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Progress() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("reading");
  const [writingHistory, setWritingHistory] = useState<WritingSubmission[]>([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [textsRead, setTextsRead] = useState(0);
  const [quiz, setQuiz] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    setWritingHistory(getWritingHistory());
    setVocabCount(getVocabulary().length);
    setDueCount(getDueWords().length);
    setTextsRead(getUniqueTextsRead());
    setQuiz(getQuizTotals());
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "reading", label: t("progress.tabs.reading") },
    { key: "writing", label: t("progress.tabs.writing") },
    { key: "listening", label: t("progress.tabs.listening") },
  ];

  const avgScore = writingHistory.length
    ? Math.round(writingHistory.reduce((sum, s) => sum + s.scores.overall, 0) / writingHistory.length)
    : "—";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="page-title text-3xl">{t("progress.title")}</h1>

      <div className="mt-6">
        <StreakPanel />
      </div>

      <div
        className="mt-8 flex w-fit items-center gap-0.5 rounded-full border p-0.5"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
      >
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === tb.key ? "var(--color-surface)" : "transparent",
              color: tab === tb.key ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: tab === tb.key ? "var(--shadow-soft)" : "none",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "reading" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard value={textsRead} label={t("progress.textsOpened")} />
            <StatCard
              value={quiz.total ? `${quiz.correct}/${quiz.total}` : "—"}
              label={t("progress.questionsCorrect")}
            />
            <StatCard value={vocabCount} label={t("progress.wordsSaved")} />
            <StatCard value={dueCount} label={t("progress.wordsDue")} />
          </div>
        )}

        {tab === "writing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard value={writingHistory.length} label={t("progress.piecesSubmitted")} />
              <StatCard value={writingHistory[0]?.scores.overall ?? "—"} label={t("progress.latestScore")} />
              <StatCard value={avgScore} label={t("progress.averageScore")} />
            </div>
            <div
              className="rounded-[var(--radius-lg)] border p-6"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
            >
              <p className="mb-4 text-sm font-semibold">{t("progress.recentScores")}</p>
              <WritingChart history={writingHistory} />
            </div>
          </div>
        )}

        {tab === "listening" && (
          <div
            className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed p-16 text-center"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            <p className="text-sm font-medium">{t("common.comingSoon")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
