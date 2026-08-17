import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { everydayLessons, type Lesson } from "@/data/everydayLessons";
import { everydayEnglish, type SlangEntry } from "@/data/everydayEnglish";
import { LessonRunner } from "@/components/everyday/LessonRunner";
import { getLessonResults, type LessonResult } from "@/lib/lessonProgress";
import { addVocabularyWord } from "@/lib/vocabularyStore";

type Tab = "lessons" | "phrases";
type Filter = "all" | SlangEntry["category"];

const FILTERS: { key: Filter; labelKey: string }[] = [
  { key: "all", labelKey: "slang.categoryAll" },
  { key: "Idiom", labelKey: "slang.idiom" },
  { key: "Slang", labelKey: "slang.slangWord" },
  { key: "Abbreviation", labelKey: "slang.abbreviation" },
];

/** Rough reading + answering time, so the card can promise a realistic length. */
function lessonMinutes(lesson: Lesson) {
  return Math.max(3, Math.round((lesson.phrases.length * 0.5 + lesson.exercises.length * 0.6) * 1.2));
}

function LessonCard({
  lesson,
  result,
  onOpen,
}: {
  lesson: Lesson;
  result?: LessonResult;
  onOpen: () => void;
}) {
  const { t, i18n } = useTranslation();
  const done = Boolean(result);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full flex-col rounded-[var(--radius-lg)] border p-5 text-left transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: done ? "var(--color-success)" : "var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {lesson.level}
        </span>
        {done && (
          <span className="text-[11px] font-bold" style={{ color: "var(--color-success)" }}>
            ✓ {t("everyday.passed")}
          </span>
        )}
      </div>

      <h3 className="page-title mt-3 text-lg leading-snug">{lesson.title}</h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {i18n.language.startsWith("ru") ? lesson.goalRu : lesson.goal}
      </p>

      <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
        {t("everyday.phraseCount", { count: lesson.phrases.length })} · {t("everyday.minutes", { count: lessonMinutes(lesson) })}
        {result && ` · ${t("everyday.best", { correct: result.bestCorrect, total: result.total })}`}
      </p>
    </button>
  );
}

function PhraseCard({ entry }: { entry: SlangEntry }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div
      className="flex min-h-[190px] flex-col justify-between rounded-[var(--radius-lg)] border p-5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <button type="button" onClick={() => setFlipped((v) => !v)} className="flex-1 text-left">
        <span
          className="mb-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {entry.category}
        </span>

        {flipped ? (
          <div>
            <p className="text-sm leading-relaxed">{entry.meaning}</p>
            <p className="mt-2 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
              &ldquo;{entry.example}&rdquo;
            </p>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold">{entry.phrase}</p>
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {t("slang.tapToFlip")}
            </p>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          addVocabularyWord(entry.phrase, entry.meaning, t("nav.everydayEnglish"));
          setSaved(true);
        }}
        disabled={saved}
        className="mt-4 self-start rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
        style={{
          borderColor: saved ? "var(--color-success)" : "var(--color-border)",
          color: saved ? "var(--color-success)" : "var(--color-text-muted)",
        }}
      >
        {saved ? `✓ ${t("common.saved")}` : t("slang.saveToVocab")}
      </button>
    </div>
  );
}

/**
 * Everyday English: lessons first, phrasebook second.
 *
 * The section used to be a wall of flip cards — pleasant to browse, impossible
 * to finish. Browsing is still here, but it's the reference shelf now; the way
 * in is a short lesson with an end, a score and a place in the daily goal.
 */
export default function EverydayEnglish() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("lessons");
  const [openId, setOpenId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, LessonResult>>({});
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => setResults(getLessonResults()), [openId]);

  const lesson = openId ? everydayLessons.find((l) => l.id === openId) : undefined;
  const nextLesson = lesson
    ? everydayLessons[(everydayLessons.findIndex((l) => l.id === lesson.id) + 1) % everydayLessons.length]
    : undefined;

  const visiblePhrases = useMemo(
    () => (filter === "all" ? everydayEnglish : everydayEnglish.filter((e) => e.category === filter)),
    [filter],
  );

  if (lesson) {
    return (
      <LessonRunner
        key={lesson.id}
        lesson={lesson}
        onExit={() => setOpenId(null)}
        onNextLesson={nextLesson && nextLesson.id !== lesson.id ? () => setOpenId(nextLesson.id) : undefined}
      />
    );
  }

  const passed = everydayLessons.filter((l) => results[l.id]).length;

  return (
    <SectionHero
      kicker={t("nav.everydayEnglish")}
      title={t("nav.everydayEnglish")}
      description={t("everyday.intro")}
    >
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {(["lessons", "phrases"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              background: tab === key ? "var(--color-primary)" : "var(--color-surface-2)",
              color: tab === key ? "var(--color-on-primary)" : "var(--color-text-muted)",
            }}
          >
            {key === "lessons"
              ? `${t("everyday.lessonsTab")} · ${passed}/${everydayLessons.length}`
              : t("everyday.phrasesTab")}
          </button>
        ))}
      </div>

      {tab === "lessons" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {everydayLessons.map((l) => (
            <LessonCard key={l.id} lesson={l} result={results[l.id]} onOpen={() => setOpenId(l.id)} />
          ))}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("everyday.phrasesIntro")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
                style={{
                  borderColor: filter === f.key ? "var(--color-primary)" : "var(--color-border)",
                  color: filter === f.key ? "var(--color-primary)" : "var(--color-text-muted)",
                }}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePhrases.map((entry) => (
              <PhraseCard key={entry.phrase} entry={entry} />
            ))}
          </div>
        </>
      )}
    </SectionHero>
  );
}
