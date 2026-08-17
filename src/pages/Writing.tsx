import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { writingTopics } from "@/data/writingTopics";
import { rankByGoal } from "@/lib/learnerProfile";
import { getWritingFeedback, type WritingFeedbackResult } from "@/lib/writingFeedback";
import { addWritingSubmission } from "@/lib/writingHistory";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { WriterTranslator } from "@/components/writing/WriterTranslator";

const SCORE_KEYS = ["grammar", "vocabulary", "coherence", "overall"] as const;
const MIN_SUBMIT_WORDS = 30;

export default function Writing() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  // An exam candidate should meet the essay first, an office worker the email.
  const topics = useMemo(() => rankByGoal(writingTopics), []);
  const [topicId, setTopicId] = useState(topics[0].id);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingFeedbackResult | null>(null);
  const [showSample, setShowSample] = useState(false);

  const topic = topics.find((tp) => tp.id === topicId)!;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const tooShort = words < MIN_SUBMIT_WORDS;

  const handleSubmit = async () => {
    if (tooShort) return;
    setLoading(true);
    const feedback = await getWritingFeedback(text);
    setResult(feedback);
    addWritingSubmission({ topicId, wordCount: words, scores: feedback.scores });
    // One per topic per day — a second topic is new work, a resubmission of the
    // same one is a revision.
    finish("writing", `writing:${topicId}`, t("tasks.writingDone"));
    setLoading(false);
  };

  const handleRestart = () => {
    setResult(null);
    setText("");
    setShowSample(false);
  };

  const switchTopic = (id: string) => {
    setTopicId(id);
    handleRestart();
  };

  return (
    <SectionHero kicker={t("nav.writing")} title={t("nav.writing")} description={t("home.descriptions.writing")}>
      <div className="mt-8 flex flex-wrap gap-2">
        {topics.map((tp) => (
          <button
            key={tp.id}
            type="button"
            onClick={() => switchTopic(tp.id)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
            style={{
              borderColor: topicId === tp.id ? "var(--color-primary)" : "var(--color-border)",
              color: topicId === tp.id ? "var(--color-primary)" : "var(--color-text-muted)",
            }}
          >
            {tp.title}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* ── Task and editor ─────────────────────────────────────────── */}
        <div
          className="rounded-[var(--radius-lg)] border p-6 sm:p-8"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
            >
              {topic.format}
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
              {topic.level}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {topic.prompt}
          </p>

          {!result ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder={t("writing.placeholder")}
                className="mt-5 w-full resize-none rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("writing.wordCount", { count: words })} ·{" "}
                  {t("writing.targetLength", { min: topic.minWords, max: topic.maxWords })}
                </span>
                {tooShort && words > 0 && (
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {t("writing.tooShort")}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || tooShort}
                className="mt-4 rounded-full px-5 py-3 text-sm font-semibold on-primary disabled:opacity-40"
                style={{ background: "var(--color-primary)" }}
              >
                {loading ? t("common.loading") : t("common.continue")}
              </button>
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

        {/* ── Translator + guide ──────────────────────────────────────── */}
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
        </div>
      </div>
    </SectionHero>
  );
}
