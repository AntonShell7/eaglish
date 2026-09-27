import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DayLine, type DayCount } from "@/components/charts/DayLine";
import { Donut, type Slice } from "@/components/charts/Donut";
import { YearGrid } from "@/components/charts/YearGrid";
import { LockedStat } from "@/components/charts/LockedStat";
import { TrendLine, type TrendPoint } from "@/components/charts/TrendLine";
import { getWritingHistory } from "@/lib/writingHistory";
import { getVocabulary } from "@/lib/vocabularyStore";
import { getQuizTotals } from "@/lib/readingHistory";
import { getActivity, getStreak, getBestStreak, totalForDay } from "@/lib/activityStore";
import { minutesByDay, timeBySection, totalMinutes, type TimeSection } from "@/lib/timeStore";
import "@/components/charts/charts.css";
import "@/components/charts/progress.css";

/** Days of real use before a figure is allowed to speak. */
const UNLOCK_DAYS = 7;

const SECTION_COLOR: Record<TimeSection, string> = {
  reading: "var(--color-primary)",
  listening: "var(--color-accent)",
  slang: "color-mix(in srgb, var(--color-primary) 55%, var(--color-accent))",
  vocabulary: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
  writing: "color-mix(in srgb, var(--color-accent) 55%, transparent)",
  other: "var(--color-surface-3)",
};

/** The last `n` days as dates, oldest first. */
function lastDays(n: number): string[] {
  const out: string[] = [];
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(day);
    d.setDate(day.getDate() - i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }
  return out;
}

/**
 * Progress.
 *
 * It used to open with an estimate of the learner's whole English vocabulary —
 * "about 6,500 words" — extrapolated from a handful of saved ones. A number
 * that confident, built on that little, is a guess wearing a lab coat, and it
 * sat above everything that was actually measured.
 *
 * What is here now is only what the app genuinely knows: words collected on
 * each day, where the time went, and which days were worked. Everything that
 * needs a run of days before it means anything says so, and shows how far off
 * it is — a blank with a reason is a return visit, a blank without one is a
 * bug.
 */
export default function Progress() {
  const { t } = useTranslation();
  const [words, setWords] = useState<DayCount[]>([]);
  const [delta, setDelta] = useState<number | null>(null);
  const [calendar, setCalendar] = useState<{ date: string; minutes: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [daysStudied, setDaysStudied] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [split, setSplit] = useState<Slice[]>([]);
  const [scores, setScores] = useState<TrendPoint[]>([]);

  useEffect(() => {
    const collected = new Map<string, number>();
    for (const word of getVocabulary()) {
      const d = new Date(word.addedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      collected.set(key, (collected.get(key) ?? 0) + 1);
    }
    /*
     * The window starts where the data starts.
     *
     * A fixed thirty days meant a new account opened on a chart that was flat
     * and empty for three weeks before the line began — it read as a broken
     * chart rather than as a short history. So leading empty days are dropped
     * and the line begins at the left edge, with a floor of a week so a single
     * day of use still has a shape to draw.
     */
    const full = lastDays(30).map((date) => ({ date, count: collected.get(date) ?? 0 }));
    const firstReal = full.findIndex((d) => d.count > 0);
    const from = firstReal === -1 ? full.length - 7 : Math.min(firstReal, full.length - 7);
    const window = full.slice(Math.max(0, from));
    setWords(window);

    /* The same number of days immediately before the window — the only
       comparison that is not apples to oranges. The window is the last `span`
       days, so twice that length, cut in half, is exactly the period before
       it. */
    const span = window.length;
    const before = lastDays(span * 2)
      .slice(0, span)
      .reduce((sum, date) => sum + (collected.get(date) ?? 0), 0);
    const now = window.reduce((sum, d) => sum + d.count, 0);
    setDelta(before > 0 ? Math.round(((now - before) / before) * 100) : null);

    setCalendar(minutesByDay(140));
    setStreak(getStreak());
    setBest(getBestStreak());
    setDaysStudied(getActivity().filter((d) => totalForDay(d) > 0).length);

    setMinutes(totalMinutes(30));
    const by = timeBySection(30);
    setSplit(
      (Object.keys(by) as TimeSection[]).map((key) => ({
        key,
        label: t(`progress.section.${key}`),
        value: by[key],
        color: SECTION_COLOR[key],
      })),
    );

    setScores(
      [...getWritingHistory()]
        .reverse()
        .slice(-12)
        .map((s, i) => ({ label: String(i + 1), value: s.scores.overall })),
    );
  }, [t]);

  const unlocked = daysStudied >= UNLOCK_DAYS;
  const quiz = useMemo(() => getQuizTotals(), []);

  /* Words per week, from the days that actually exist rather than from a
     nominal seven — three days of use should not be divided by seven. */
  const perWeek = useMemo(() => {
    const total = words.reduce((sum, d) => sum + d.count, 0);
    return daysStudied > 0 ? ((total / Math.max(1, Math.min(30, daysStudied))) * 7).toFixed(1) : "0";
  }, [words, daysStudied]);

  return (
    <div className="pg mx-auto max-w-5xl px-5 py-8">
      <h1 className="page-title text-3xl">{t("progress.title")}</h1>

      <section className="pg-card" style={{ marginTop: 24 }}>
        <DayLine days={words} unit={t("progress.wordsUnit")} delta={delta} />
      </section>

      <section className="pg-section">
        <div className="pg-head">
          <p className="pg-eyebrow">{t("progress.timeTitle")}</p>
          <p className="pg-note">{t("progress.lastThirty")}</p>
        </div>

        <div className="pg-grid pg-grid--aside">
          <div className="pg-card">
            <Donut
              slices={split}
              centre={String(minutes)}
              centreLabel={t("progress.minutes")}
              emptyLabel={t("progress.timeEmpty")}
            />
          </div>

          <div className="pg-grid">
            {unlocked ? (
              <>
                <Figure
                  label={t("progress.questionsCorrect")}
                  value={quiz.total ? `${Math.round((quiz.correct / quiz.total) * 100)}%` : "—"}
                  hint={quiz.total ? `${quiz.correct} / ${quiz.total}` : undefined}
                />
                <Figure label={t("progress.newPerWeek")} value={perWeek} />
                <Figure label={t("progress.daysStudied")} value={String(daysStudied)} />
              </>
            ) : (
              <>
                <LockedStat label={t("progress.questionsCorrect")} daysDone={daysStudied} daysNeeded={UNLOCK_DAYS} />
                <LockedStat label={t("progress.newPerWeek")} daysDone={daysStudied} daysNeeded={UNLOCK_DAYS} />
                <LockedStat label={t("progress.daysStudied")} daysDone={daysStudied} daysNeeded={UNLOCK_DAYS} />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head">
          <p className="pg-eyebrow">{t("progress.calendarTitle")}</p>
          <p className="pg-note">
            {t("progress.streakNow", { count: streak })} · {t("progress.bestStreak", { count: best })}
          </p>
        </div>
        <div className="pg-card">
          <YearGrid days={calendar} />
        </div>
      </section>

      {scores.length > 1 && (
        <section className="pg-section">
          <div className="pg-head">
            <p className="pg-eyebrow">{t("progress.scoresTitle")}</p>
          </div>
          <div className="pg-card">
            <TrendLine points={scores} title="" subtitle="" emptyLabel={t("progress.noSubmissions")} />
          </div>
        </section>
      )}
    </div>
  );
}

/** An unlocked figure, in the same frame as the locked one it replaces. */
function Figure({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="fig">
      <p className="fig__label">{label}</p>
      <p className="fig__value tabular">{value}</p>
      {hint && <p className="fig__hint tabular">{hint}</p>}
    </div>
  );
}
