import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { findTopic, loadTopicTexts, readingLibrarySize, readingTopics, wordCount } from "@/data/readingLibrary";
import { LevelFilter } from "@/components/LevelFilter";
import { levelOf, type Cefr } from "@/lib/textLevel";
import { ReadingTextView } from "@/components/reading/ReadingTextView";
import { ComprehensionQuiz } from "@/components/reading/ComprehensionQuiz";
import { WordWorkout } from "@/components/reading/WordWorkout";
import { ReadingProgress } from "@/components/reading/ReadingProgress";
import {
  generatePersonalText,
  getPersonalTexts,
  pickTargets,
  targetsPresent,
  type PersonalText,
} from "@/lib/personalText";
import { logReadingOpen, getQuizResults, type QuizResult } from "@/lib/readingHistory";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { buildKnownModel, coverageOf, fitOf } from "@/lib/knownWords";
import { ensureLexicon } from "@/lib/lexicon";
import { getDueWords } from "@/lib/vocabularyStore";
import { normalise, tokenise } from "@/lib/lexicon";
import "./reading.css";

/*
 * The order badges appear in, not the list of what exists.
 *
 * Texts used to carry only the three bands, so a hard-coded triple was the
 * whole truth. New texts are written at one exact level, and a topic holding
 * both must show both — a card that silently omits its C1 texts is worse than
 * one with no badges at all.
 */
const LEVEL_ORDER = ["A1", "A1-A2", "A2", "B1", "B1-B2", "B2", "C1", "C1-C2", "C2"];

function badgeLevels(counts: Record<string, number>): string[] {
  return Object.keys(counts)
    .filter((level) => (counts[level] ?? 0) > 0)
    .sort((a, b) => {
      const ia = LEVEL_ORDER.indexOf(a);
      const ib = LEVEL_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
}
const WORDS_PER_MINUTE = 130;

function minutesFor(text: ReadingText) {
  return Math.max(1, Math.round(wordCount(text) / WORDS_PER_MINUTE));
}

/* ── Stage 1: pick a topic ──────────────────────────────────────────────── */

function TopicGrid({ onPick, onPersonal }: { onPick: (id: string) => void; onPersonal: () => void }) {
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

      {/* The loop the whole app is built on gets the first card, not a menu item. */}
      <button
        type="button"
        onClick={onPersonal}
        className="card card--interactive mt-8 flex w-full flex-col overflow-hidden p-6 text-left"
        style={{
          background: "var(--gradient-brand)",
          borderColor: "transparent",
          boxShadow: "var(--shadow-3)",
        }}
      >
        <span className="page-title text-xl" style={{ color: "#ffffff" }}>
          {t("reading.personalTitle")}
        </span>
        <span className="mt-1.5 max-w-xl text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.86)" }}>
          {t("reading.personalTeaser")}
        </span>
      </button>

      <div data-stagger className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((topic) => {
          const mine = interests.includes(topic.id) || interests.includes(topic.label);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onPick(topic.id)}
              disabled={topic.total === 0}
              className="card card--interactive card--accent flex h-full flex-col p-5 text-left disabled:opacity-50"
              style={mine ? { borderColor: "var(--color-primary)" } : undefined}
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
                {badgeLevels(topic.counts).map((level) => (
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

/** Coverage the reading research points at: understood, but still teaching. */
const IDEAL_COVERAGE = 0.97;

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
  const profileBand = getLearnerProfile()?.level;
  const [lexicon, setLexicon] = useState(false);

  useEffect(() => {
    ensureLexicon().then(() => setLexicon(true));
  }, []);

  /* The shelf is browsed by the six real levels rather than the three bands the
     generator wrote to. Measuring needs the frequency list, so until it loads
     every text keeps its published band and nothing is filtered out. */
  const measured = useMemo(() => {
    const out: Record<string, Cefr> = {};
    if (!lexicon) return out;
    for (const text of texts) out[text.id] = levelOf(text.level, text.sentences);
    return out;
  }, [texts, lexicon]);

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const text of texts) {
      const level = measured[text.id];
      if (level) out[level] = (out[level] ?? 0) + 1;
    }
    return out;
  }, [texts, measured]);

  const [level, setLevel] = useState<Cefr | null>(null);

  /**
   * Scores every text against what the reader already knows, then orders by how
   * close it sits to the comprehensible band — and marks texts that happen to
   * contain words due for review, since meeting a word again in reading is
   * worth more than meeting it on a card.
   */
  const scored = useMemo(() => {
    const model = buildKnownModel();
    const due = new Set(getDueWords().map((w) => normalise(w.word)));

    return texts
      .filter((text) => !level || measured[text.id] === level)
      .map((text) => {
        const sentences = text.sentences.map((s) => s.text);
        const coverage = lexicon ? coverageOf(sentences, model) : null;
        const recycled = due.size
          ? new Set(sentences.flatMap(tokenise).filter((token) => due.has(token))).size
          : 0;
        return { text, coverage, recycled };
      })
      .sort((a, b) => {
        // The learner's own band first when they are browsing everything:
        // a shelf that opens on C2 for an A2 reader is a shelf they close.
        if (!level && profileBand) {
          const mine = Number(b.text.level === profileBand) - Number(a.text.level === profileBand);
          if (mine !== 0) return mine;
        }
        if (b.recycled !== a.recycled) return b.recycled - a.recycled;
        if (!a.coverage || !b.coverage) return 0;
        return (
          Math.abs(a.coverage.known - IDEAL_COVERAGE) - Math.abs(b.coverage.known - IDEAL_COVERAGE)
        );
      });
  }, [texts, level, lexicon]);

  const visible = scored;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.allTopics")}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title text-3xl">{t(`reading.topics.${topicId}`)}</h1>

        <LevelFilter value={level} counts={counts} onChange={setLevel} />
      </div>

      <div data-stagger className="mt-6 space-y-2">
        {visible.map(({ text, coverage, recycled }) => {
          const best = quiz.filter((r) => r.textId === text.id).reduce((max, r) => Math.max(max, r.correct), -1);
          const fit = coverage ? fitOf(coverage.known) : null;
          return (
            <button
              key={text.id}
              type="button"
              onClick={() => onPick(text)}
              className="card card--interactive card--accent flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
              style={best >= 0 ? { borderColor: "var(--color-success)" } : undefined}
            >
              {/* The level leads, because difficulty is what a reader sorts on
                  before the subject. Measured where the frequency list has
                  loaded, published band until then — never absent. */}
              <span className="level flex-none">{measured[text.id] ?? text.level}</span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{text.title}</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("reading.minRead", { count: minutesFor(text) })} ·{" "}
                  {t("reading.words", { count: wordCount(text) })}
                  {coverage && ` · ${t("reading.knownShare", { percent: Math.round(coverage.known * 100) })}`}
                </span>

                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {/* Gold rather than mint. Mint was the colour of the chip,
                      the badge, the button and the panel on the same screen,
                      which left it signalling nothing; here it marks the one
                      row-level judgement worth acting on. */}
                  {fit && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background:
                          fit === "ideal"
                            ? "color-mix(in srgb, var(--color-accent) 16%, transparent)"
                            : "var(--color-surface-2)",
                        color: fit === "ideal" ? "var(--color-accent-ink)" : "var(--color-text-muted)",
                      }}
                    >
                      {t(`reading.fit.${fit}`)}
                    </span>
                  )}
                  {recycled > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                    >
                      {t("reading.recycled", { count: recycled })}
                    </span>
                  )}
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
  const article = useRef<HTMLElement>(null);

  useEffect(() => {
    // History only. Opening a text earns nothing; answering the questions below
    // is what counts as the reading task.
    logReadingOpen(text.id);
  }, [text.id]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <ReadingProgress target={article} />

      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.backToList")}
      </button>

      <article ref={article} className="card mt-4 p-6 sm:p-12" style={{ boxShadow: "var(--shadow-2)" }}>
        <h1 className="page-title text-2xl">{text.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span className="level level--lg">{text.level}</span>
          <span>{t("reading.minRead", { count: minutesFor(text) })}</span>
          <span aria-hidden>·</span>
          <span>{t("reading.words", { count: wordCount(text) })}</span>
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

      <ComprehensionQuiz
        textId={text.id}
        questions={text.questions}
        title={text.title}
        words={Object.entries(text.glossary ?? {})
          .slice(0, 6)
          .map(([word, entry]) => ({ word, translation: entry.translation }))}
      />

      {/* Work with the words this text contained, while it is still fresh. */}
      <WordWorkout text={text} />
    </div>
  );
}

/* ── Texts written around the learner's own words ───────────────────────── */

function PersonalTexts({
  onPick,
  onBack,
}: {
  onPick: (text: PersonalText) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [texts, setTexts] = useState<PersonalText[]>(() => getPersonalTexts());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = getLearnerProfile();
  const targets = pickTargets();

  const make = async () => {
    setBusy(true);
    setError(null);
    const topic = profile?.interests?.[0] ?? "everyday life";
    const result = await generatePersonalText({
      level: profile?.level ?? "A1-A2",
      topic,
      targets,
    });
    setBusy(false);

    if ("error" in result) {
      setError(t(result.error === "no-key" ? "lookup.noKey" : "reading.personalFailed"));
      return;
    }
    setTexts(getPersonalTexts());
    onPick(result.text);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.allTopics")}
      </button>

      <h1 className="page-title mt-4 text-3xl">{t("reading.personalTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("reading.personalLede")}
      </p>

      {/* The one thing on this page that does something, built to look like
          it: black ground, gilt rim, gold type. It was a mint panel with a
          mint button on a page where everything else was also mint, and it
          read as a notice rather than as the control. */}
      <div className="forge mt-6">
        {targets.length === 0 ? (
          <p className="forge__note">{t("reading.personalNoWords")}</p>
        ) : (
          <>
            <p className="forge__label">{t("reading.personalWillUse")}</p>
            <p className="forge__words">
              {targets.map((word) => (
                <span key={word} className="forge__word">
                  {word}
                </span>
              ))}
            </p>
            <button type="button" onClick={make} disabled={busy} className="forge__cta">
              {busy ? t("reading.personalWriting") : t("reading.personalCta")}
            </button>
          </>
        )}
        {error && <p className="forge__error">{error}</p>}
      </div>

      <div className="mt-6 space-y-2">
        {texts.map((text) => (
          <button
            key={text.id}
            type="button"
            onClick={() => onPick(text)}
            className="card card--interactive card--accent flex w-full items-center gap-4 px-4 py-3.5 text-left"
          >
            <span className="level flex-none">{text.level}</span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{text.title}</span>
              <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                {t("reading.words", { count: wordCount(text) })} · {targetsPresent(text).join(", ")}
              </span>
            </span>
          </button>
        ))}
      </div>
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
  const [personal, setPersonal] = useState(false);
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

  if (personal) return <PersonalTexts onPick={setOpen} onBack={() => setPersonal(false)} />;

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

  return <TopicGrid onPick={setTopicId} onPersonal={() => setPersonal(true)} />;
}
