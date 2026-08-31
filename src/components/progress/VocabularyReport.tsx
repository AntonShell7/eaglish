import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendLine } from "@/components/charts/TrendLine";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useCountUp } from "@/lib/useCountUp";
import { getVocabulary } from "@/lib/vocabularyStore";
import {
  estimateComprehension,
  estimateVocabularySize,
  forecastTo,
  getPace,
  getRetention,
  getWeeklyRecap,
  masteredCount,
  vocabularyGrowth,
} from "@/lib/insights";
import { buildKnownModel, coverageOf } from "@/lib/knownWords";
import { ensureLexicon } from "@/lib/lexicon";
import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import "@/components/charts/charts.css";

/**
 * The next milestone worth aiming at, in words collected here.
 *
 * Small and close at the start — fifty words is a real week of work and a
 * reachable promise, while "3000 words" on day two is noise.
 */
function nextTarget(collected: number): number {
  for (const target of [25, 50, 100, 250, 500, 1000, 2000, 3000]) {
    if (collected < target) return target;
  }
  return 5000;
}

/**
 * The report that answers "is this working?".
 *
 * Streaks and XP measure attendance. These four numbers measure result: how
 * many words are held, how much of a real text that unlocks, how much survives
 * to the next review, and where the current pace leads. Each is derived from
 * data the app already has, and the two that are estimates say so — a
 * motivating number stops motivating the moment someone catches it lying.
 */
export function VocabularyReport() {
  const { t, i18n } = useTranslation();
  const [comprehension, setComprehension] = useState<number | null>(null);

  const size = estimateVocabularySize();
  const retention = getRetention();
  const pace = getPace();
  const mastered = masteredCount();
  const recap = getWeeklyRecap();
  const growth = vocabularyGrowth();
  const collected = getVocabulary().length;
  const target = nextTarget(collected);
  const forecast = forecastTo(target, collected);
  const shownCollected = useCountUp(collected, 900);
  const shownSize = useCountUp(size.total, 900);
  const shownComprehension = useCountUp(Math.round((comprehension ?? 0) * 100), 900);

  /**
   * Comprehension is measured against real material rather than asserted: a
   * sample of library texts at every level, scored with the same coverage model
   * the reading list uses.
   */
  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      await ensureLexicon();
      const topics = readingTopics.filter((topic) => topic.total > 0).slice(0, 4);
      const batches = await Promise.all(topics.map((topic) => loadTopicTexts(topic.id)));
      if (cancelled) return;

      const model = buildKnownModel();
      const sample = batches.flat().slice(0, 24);
      if (sample.length === 0) return;

      const coverages = sample.map(
        (text) => coverageOf(text.sentences.map((s) => s.text), model).known,
      );
      setComprehension(estimateComprehension(coverages));
    };

    void measure();
    return () => {
      cancelled = true;
    };
  }, []);

  const dateFormat = new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* ── The headline number ─────────────────────────────────────── */}
      <section className="card mt-6 p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          {/* The headline is the number this app is responsible for — words the
              learner collected here. A total that is 99% baseline assumption
              barely moves when you study, and a number that does not respond to
              effort cannot motivate it. The estimate of the whole vocabulary
              stays, one line down, where it belongs. */}
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t("insights.collectedLabel")}</p>
            <p
              className="tabular mt-2 font-bold leading-none"
              style={{ fontSize: "clamp(3rem, 9vw, 4.5rem)" }}
            >
              {shownCollected.toLocaleString(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB")}
            </p>
            <p className="mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("insights.collectedExplain")}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip chip--brand">{t("insights.learningNow", { count: size.learning })}</span>
              <span className="chip chip--success">{t("insights.mastered", { count: mastered })}</span>
            </div>

            <p className="mt-5 text-sm" style={{ color: "var(--color-text-faint)" }}>
              {t("insights.wholeVocabulary", {
                total: shownSize.toLocaleString(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB"),
                evidenced: size.evidenced,
              })}
            </p>
          </div>

          <div className="w-full lg:w-[320px]">
            <TrendLine
              points={growth}
              title={t("insights.growthTitle")}
              subtitle={t("insights.growthSub")}
              emptyLabel={t("progress.noActivityYet")}
              max={Math.max(10, ...growth.map((point) => point.value))}
            />
          </div>
        </div>
      </section>

      {/* ── Comprehension, retention, pace ──────────────────────────── */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <section className="card flex items-center gap-5 p-5">
          <ProgressRing value={comprehension ?? 0} max={1} size={92} stroke={8}>
            <span className="tabular text-lg font-bold">
              {comprehension === null ? "…" : `${shownComprehension}%`}
            </span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="eyebrow">{t("insights.comprehensionLabel")}</p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {t("insights.comprehensionExplain")}
            </p>
          </div>
        </section>

        <section className="card flex items-center gap-5 p-5">
          <ProgressRing value={retention.rate} max={1} size={92} stroke={8}>
            <span className="tabular text-lg font-bold">
              {retention.matured === 0 ? "—" : `${Math.round(retention.rate * 100)}%`}
            </span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="eyebrow">{t("insights.retentionLabel")}</p>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {retention.matured === 0
                ? t("insights.retentionEmpty")
                : t("insights.retentionExplain", { count: retention.matured })}
            </p>
          </div>
        </section>

        <section className="card p-5">
          <p className="eyebrow">{t("insights.paceLabel")}</p>
          <p className="tabular mt-2 text-2xl font-bold">
            {Math.round(pace.wordsPerWeek)} <span className="text-sm font-medium" style={{ color: "var(--color-text-faint)" }}>{t("insights.perWeek")}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {forecast.date
              ? t("insights.forecast", { target: forecast.target, date: dateFormat.format(forecast.date) })
              : t("insights.forecastUnknown")}
          </p>
        </section>
      </div>

      {/* ── The week ────────────────────────────────────────────────── */}
      <section className="card mt-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="eyebrow">{t("insights.weekTitle")}</p>
          {recap.deltaTasks !== null && recap.deltaTasks !== 0 && (
            <span
              className="chip"
              style={{
                color: recap.deltaTasks > 0 ? "var(--color-success)" : "var(--color-text-muted)",
              }}
            >
              {recap.deltaTasks > 0 ? "▲" : "▼"} {Math.abs(Math.round(recap.deltaTasks * 100))}%{" "}
              {t("insights.vsLastWeek")}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: t("insights.weekTasks"), value: recap.tasks },
            { label: t("insights.weekWords"), value: recap.newWords },
            { label: t("insights.weekReviews"), value: recap.reviews },
            { label: t("insights.weekMinutes"), value: `≈${recap.minutes}` },
            { label: t("insights.weekDays"), value: `${recap.activeDays}/7` },
          ].map((item) => (
            <div key={item.label}>
              <p className="tabular text-2xl font-bold">{item.value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
