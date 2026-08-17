import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { writingTopics, type WritingCategory, type WritingTopic } from "@/data/writingTopics";
import { getWritingFeedback, type WritingFeedbackResult } from "@/lib/writingFeedback";
import { addWritingSubmission, getWritingHistory, type WritingSubmission } from "@/lib/writingHistory";
import { clearDraft, getDraft, getDrafts, saveDraft } from "@/lib/writingDrafts";
import { rankByGoal } from "@/lib/learnerProfile";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { WriterTranslator } from "@/components/writing/WriterTranslator";

const SCORE_KEYS = ["grammar", "vocabulary", "coherence", "overall"] as const;
const MIN_SUBMIT_WORDS = 30;
const DRAFT_DEBOUNCE_MS = 800;

const CATEGORIES: (WritingCategory | "all")[] = ["all", "exam", "work", "study", "life"];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/* ── Hub: pick a brief ──────────────────────────────────────────────────── */

function TopicCard({
  topic,
  attempts,
  hasDraft,
  recommended,
  onOpen,
}: {
  topic: WritingTopic;
  attempts: WritingSubmission[];
  hasDraft: boolean;
  recommended: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const best = attempts.reduce((max, a) => Math.max(max, a.scores.overall), 0);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full flex-col rounded-[var(--radius-lg)] border p-5 text-left transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: hasDraft ? "var(--color-accent)" : "var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {t(`writing.formats.${topic.format}`)}
        </span>
        <span className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          {topic.level}
        </span>
        {recommended && (
          <span className="ml-auto text-[10px] font-bold" style={{ color: "var(--color-primary)" }}>
            {t("writing.recommended")}
          </span>
        )}
      </div>

      <h3 className="page-title mt-3 text-lg leading-snug">{topic.title}</h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {topic.prompt}
      </p>

      <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
        {t("writing.targetLength", { min: topic.minWords, max: topic.maxWords })}
        {best > 0 && ` · ${t("writing.bestScore", { score: best })}`}
      </p>

      {hasDraft && (
        <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-accent-ink)" }}>
          {t("writing.draftWaiting")}
        </p>
      )}
    </button>
  );
}

/* ── Workspace: write one ───────────────────────────────────────────────── */

function Workspace({ topic, onExit }: { topic: WritingTopic; onExit: () => void }) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [text, setText] = useState(() => getDraft(topic.id)?.text ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attempts, setAttempts] = useState<WritingSubmission[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setAttempts(getWritingHistory().filter((a) => a.topicId === topic.id));
  }, [topic.id, result]);

  // Autosave: the draft has to survive a closed tab, but writing to storage on
  // every keystroke is wasteful, so it settles for a moment first.
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      saveDraft(topic.id, text);
      setSaved(text.trim().length > 0);
    }, DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer.current);
  }, [text, topic.id]);

  const words = countWords(text);
  const tooShort = words < MIN_SUBMIT_WORDS;

  const handleSubmit = async () => {
    if (tooShort) return;
    setLoading(true);
    const feedback = await getWritingFeedback(text);
    setResult(feedback);
    addWritingSubmission({ topicId: topic.id, wordCount: words, scores: feedback.scores });
    // Assessed, so it isn't an unfinished draft any more.
    clearDraft(topic.id);
    setSaved(false);
    // One per topic per day — a second brief is new work, a resubmission is a revision.
    finish("writing", `writing:${topic.id}`, t("tasks.writingDone"));
    setLoading(false);
  };

  const handleRestart = () => {
    setResult(null);
    setText("");
    setShowSample(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <button type="button" onClick={onExit} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("writing.allBriefs")}
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {t(`writing.formats.${topic.format}`)}
        </span>
        <span className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          {topic.level}
        </span>
      </div>

      <h1 className="page-title mt-2 text-2xl sm:text-3xl">{topic.title}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* ── Task and editor ─────────────────────────────────────────── */}
        <div
          className="rounded-[var(--radius-lg)] border p-6 sm:p-8"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {topic.prompt}
          </p>

          {!result ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder={t("writing.placeholder")}
                className="mt-5 w-full resize-none rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
              />

              {/* Progress towards the target length, because "write 220 words"
                  is meaningless without knowing where you are. */}
              <div className="mt-3">
                <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (words / topic.minWords) * 100)}%`,
                      background: words >= topic.minWords ? "var(--color-success)" : "var(--color-primary)",
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {t("writing.wordCount", { count: words })} ·{" "}
                    {t("writing.targetLength", { min: topic.minWords, max: topic.maxWords })}
                  </span>
                  {saved && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {t("writing.draftSaved")}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || tooShort}
                className="mt-4 rounded-full px-5 py-3 text-sm font-semibold on-primary disabled:opacity-40"
                style={{ background: "var(--color-primary)" }}
              >
                {loading ? t("writing.assessing") : t("writing.submitForFeedback")}
              </button>

              {tooShort && words > 0 && (
                <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("writing.tooShort")}
                </p>
              )}
            </>
          ) : (
            <div className="mt-6">
              {!result.isLive && (
                <p
                  className="mb-4 rounded-lg px-3 py-2 text-xs"
                  style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                >
                  {result.summary}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SCORE_KEYS.map((key) => (
                  <div
                    key={key}
                    className="rounded-[var(--radius-md)] border p-4 text-center"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                  >
                    <p className="text-2xl font-extrabold" style={{ color: "var(--color-primary)" }}>
                      {result.scores[key]}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {t(`writing.${key}`)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm font-semibold">{t("writing.tips")}</p>
              <ul className="mt-2 space-y-2">
                {result.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    <span style={{ color: "var(--color-accent)" }}>◆</span>
                    {tip}
                  </li>
                ))}
              </ul>

              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  {t("writing.yourText")}
                </summary>
                <p
                  className="mt-3 rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
                >
                  {text}
                </p>
              </details>

              <button
                type="button"
                onClick={handleRestart}
                className="mt-6 rounded-full border px-5 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)" }}
              >
                {t("writing.writeAgain")}
              </button>
            </div>
          )}
        </div>

        {/* ── Guide, translator, past attempts ────────────────────────── */}
        <div className="space-y-6">
          <WriterTranslator source={topic.title} />

          <aside
            className="rounded-[var(--radius-lg)] border p-6"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
          >
            <h3 className="page-title text-lg">{t("writing.guideTitle")}</h3>

            <p className="mt-5 text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-accent)" }}>
              {t("writing.structure")}
            </p>
            <ol className="mt-3 space-y-3">
              {topic.structure.map((step, i) => (
                <li key={step.heading} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">
                    <strong className="font-semibold">{step.heading}.</strong>{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-7 text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-accent)" }}>
              {t("writing.usefulPhrases")}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topic.phrases.map((phrase) => (
                <li
                  key={phrase}
                  className="rounded-full border px-3 py-1.5 text-xs"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  {phrase}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setShowSample((v) => !v)}
              className="mt-7 w-full rounded-full border px-4 py-2.5 text-sm font-semibold"
              style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-ink)" }}
            >
              {showSample ? t("writing.hideExample") : t("writing.showExample")}
            </button>

            {showSample && (
              <div className="mt-4">
                <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
                  {t("writing.sampleNote")}
                </p>
                <p
                  className="mt-3 rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  {topic.sample}
                </p>
              </div>
            )}
          </aside>

          {attempts.length > 0 && (
            <aside
              className="rounded-[var(--radius-lg)] border p-6"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <h3 className="page-title text-lg">{t("writing.pastAttempts")}</h3>
              <ul className="mt-4 space-y-2">
                {attempts.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {new Date(a.submittedAt).toLocaleDateString()} ·{" "}
                      {t("writing.wordCount", { count: a.wordCount })}
                    </span>
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      {a.scores.overall}/10
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── The section ────────────────────────────────────────────────────────── */

/**
 * Writing: a shelf of briefs, then one desk.
 *
 * A flat list of four prompts was fine as a demo and wrong as a product — an
 * exam candidate and someone writing work emails want different things, and
 * neither wants to scroll past the other's tasks. Briefs are grouped by what
 * they're for, ordered by the learner's stated goal, and each one keeps its own
 * draft and its own score history.
 */
export default function Writing() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<WritingCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [history, setHistory] = useState<WritingSubmission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { text: string; savedAt: number }>>({});

  // Re-read on leaving the desk, so scores and drafts on the cards are current.
  useEffect(() => {
    setHistory(getWritingHistory());
    setDrafts(getDrafts());
  }, [openId]);

  const ordered = useMemo(() => rankByGoal(writingTopics), []);
  const visible = useMemo(
    () => (category === "all" ? ordered : ordered.filter((tp) => tp.category === category)),
    [ordered, category],
  );

  const open = openId ? writingTopics.find((tp) => tp.id === openId) : undefined;
  if (open) return <Workspace key={open.id} topic={open} onExit={() => setOpenId(null)} />;

  return (
    <SectionHero kicker={t("nav.writing")} title={t("nav.writing")} description={t("writing.intro")}>
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              background: category === key ? "var(--color-primary)" : "var(--color-surface-2)",
              color: category === key ? "var(--color-on-primary)" : "var(--color-text-muted)",
            }}
          >
            {t(`writing.categories.${key}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((topic, i) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            attempts={history.filter((a) => a.topicId === topic.id)}
            hasDraft={Boolean(drafts[topic.id])}
            recommended={i === 0 && category === "all"}
            onOpen={() => setOpenId(topic.id)}
          />
        ))}
      </div>
    </SectionHero>
  );
}
