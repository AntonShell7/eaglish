import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { findTopic, loadTopicTexts, readingLibrarySize, readingTopics, wordCount } from "@/data/readingLibrary";
import { ReadingTextView } from "@/components/reading/ReadingTextView";
import { ComprehensionQuiz } from "@/components/reading/ComprehensionQuiz";
import { logReadingOpen, getQuizResults, type QuizResult } from "@/lib/readingHistory";
import { getLearnerProfile } from "@/lib/learnerProfile";

const LEVELS: ReadingText["level"][] = ["A1-A2", "B1-B2", "C1-C2"];
const WORDS_PER_MINUTE = 130;

function minutesFor(text: ReadingText) {
  return Math.max(1, Math.round(wordCount(text) / WORDS_PER_MINUTE));
}

/* ── Stage 1: pick a topic ──────────────────────────────────────────────── */

function TopicGrid({ onPick }: { onPick: (id: string) => void }) {
  const { t } = useTranslation();
  const interests = getLearnerProfile()?.interests ?? [];

  // Interests first — the profile exists to make this page shorter, not longer.
  const ordered = useMemo(() => {
    const liked = (id: string) =>
      interests.includes(id) || interests.includes(findTopic(id)?.label ?? "") ? 0 : 1;
    return [...readingTopics].sort((a, b) => liked(a.id) - liked(b.id) || b.total - a.total);
  }, [interests]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="page-title text-3xl">{t("nav.reading")}</h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("reading.libraryIntro", { count: readingLibrarySize })}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((topic) => {
          const mine = interests.includes(topic.id) || interests.includes(topic.label);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onPick(topic.id)}
              disabled={topic.total === 0}
              className="flex h-full flex-col rounded-[var(--radius-lg)] border p-5 text-left transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                borderColor: mine ? "var(--color-primary)" : "var(--color-border)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="page-title text-lg leading-snug">{t(`reading.topics.${topic.id}`)}</h2>
                {mine && (
                  <span className="flex-none text-[10px] font-bold" style={{ color: "var(--color-primary)" }}>
                    {t("reading.yourTopic")}
                  </span>
                )}
              </div>

              <p className="mt-2 flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("reading.textCount", { count: topic.total })}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {LEVELS.filter((level) => (topic.counts[level] ?? 0) > 0).map((level) => (
                  <span
                    key={level}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
                  >
                    {level} · {topic.counts[level]}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stage 2: pick a text ───────────────────────────────────────────────── */

function TextList({
  topicId,
  texts,
  quiz,
  onPick,
  onBack,
}: {
  topicId: string;
  texts: ReadingText[];
  quiz: QuizResult[];
  onPick: (text: ReadingText) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const profileLevel = getLearnerProfile()?.level;

  const available = LEVELS.filter((level) => texts.some((text) => text.level === level));
  const [level, setLevel] = useState<ReadingText["level"]>(
    () => (profileLevel && available.includes(profileLevel) ? profileLevel : available[0]) ?? "A1-A2",
  );

  const visible = texts.filter((text) => text.level === level);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.allTopics")}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title text-3xl">{t(`reading.topics.${topicId}`)}</h1>

        <div
          className="flex items-center gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        >
          {available.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevel(option)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: level === option ? "var(--color-surface)" : "transparent",
                color: level === option ? "var(--color-text)" : "var(--color-text-muted)",
                boxShadow: level === option ? "var(--shadow-soft)" : "none",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {visible.map((text) => {
          const best = quiz.filter((r) => r.textId === text.id).reduce((max, r) => Math.max(max, r.correct), -1);
          return (
            <button
              key={text.id}
              type="button"
              onClick={() => onPick(text)}
              className="flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3 text-left"
              style={{
                borderColor: best >= 0 ? "var(--color-success)" : "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{text.title}</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("reading.minRead", { count: minutesFor(text) })} ·{" "}
                  {t("reading.words", { count: wordCount(text) })}
                </span>
              </span>

              {best >= 0 && (
                <span className="flex-none text-xs font-bold" style={{ color: "var(--color-success)" }}>
                  ✓ {best}/{text.questions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stage 3: read it ───────────────────────────────────────────────────── */

function Reader({ text, onBack }: { text: ReadingText; onBack: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    // History only. Opening a text earns nothing; answering the questions below
    // is what counts as the reading task.
    logReadingOpen(text.id);
  }, [text.id]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.backToList")}
      </button>

      <article
        className="mt-4 rounded-[var(--radius-lg)] border p-6 sm:p-10"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <h1 className="page-title text-2xl">{text.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>{t("reading.minRead", { count: minutesFor(text) })}</span>
          <span aria-hidden>·</span>
          <span>{t("reading.words", { count: wordCount(text) })}</span>
          <span aria-hidden>·</span>
          <span>{text.level}</span>
        </div>

        <p
          className="mt-4 rounded-lg px-3 py-2 text-xs"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {t("reading.hint")}
        </p>

        <div className="mt-6">
          <ReadingTextView text={text} />
        </div>
      </article>

      <ComprehensionQuiz textId={text.id} questions={text.questions} />
    </div>
  );
}

/* ── The section ────────────────────────────────────────────────────────── */

/**
 * Reading: topic, then text, then the text itself.
 *
 * With a library this size a single flat list would be unusable — and choosing a
 * subject is the moment a reader decides whether to bother at all, so it gets a
 * screen of its own rather than a dropdown. Each topic's texts load on demand.
 */
export default function Reading() {
  const { t } = useTranslation();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<ReadingText | null>(null);
  const [quiz, setQuiz] = useState<QuizResult[]>([]);

  // Re-read on leaving the reader, so a fresh score shows up in the list.
  useEffect(() => {
    setQuiz(getQuizResults());
  }, [open]);

  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;
    setLoading(true);
    loadTopicTexts(topicId).then((loaded) => {
      if (cancelled) return;
      setTexts(loaded);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  if (open) return <Reader key={open.id} text={open} onBack={() => setOpen(null)} />;

  if (topicId) {
    if (loading) {
      return (
        <p className="mx-auto max-w-5xl px-5 py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("common.loading")}
        </p>
      );
    }
    return (
      <TextList
        key={topicId}
        topicId={topicId}
        texts={texts}
        quiz={quiz}
        onPick={setOpen}
        onBack={() => setTopicId(null)}
      />
    );
  }

  return <TopicGrid onPick={setTopicId} />;
}
