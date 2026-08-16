import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { readingTexts, type ReadingText } from "@/data/readingTexts";
import { ReadingTextView } from "@/components/reading/ReadingTextView";
import { ComprehensionQuiz } from "@/components/reading/ComprehensionQuiz";
import { logReadingOpen } from "@/lib/readingHistory";
import { logActivity } from "@/lib/activityStore";

const LEVELS: ReadingText["level"][] = ["A1-A2", "B1-B2", "C1-C2"];
const WORDS_PER_MINUTE = 130;

function wordCount(text: ReadingText) {
  return text.sentences.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
}

export default function Reading() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<ReadingText["level"]>("A1-A2");
  const textsAtLevel = useMemo(() => readingTexts.filter((tx) => tx.level === level), [level]);
  const [selectedId, setSelectedId] = useState(textsAtLevel[0]?.id);

  const selected = readingTexts.find((tx) => tx.id === selectedId) ?? textsAtLevel[0];

  useEffect(() => {
    if (!selected) return;
    logReadingOpen(selected.id);
    logActivity("reading");
  }, [selected]);

  const handleLevel = (next: ReadingText["level"]) => {
    setLevel(next);
    const first = readingTexts.find((tx) => tx.level === next);
    if (first) setSelectedId(first.id);
  };

  const words = selected ? wordCount(selected) : 0;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title text-3xl">{t("nav.reading")}</h1>
        <div
          className="flex items-center gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        >
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleLevel(lvl)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: level === lvl ? "var(--color-surface)" : "transparent",
                color: level === lvl ? "var(--color-text)" : "var(--color-text-muted)",
                boxShadow: level === lvl ? "var(--shadow-soft)" : "none",
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {textsAtLevel.map((tx) => (
          <button
            key={tx.id}
            type="button"
            onClick={() => setSelectedId(tx.id)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
            style={{
              borderColor: selected?.id === tx.id ? "var(--color-primary)" : "var(--color-border)",
              color: selected?.id === tx.id ? "var(--color-primary)" : "var(--color-text-muted)",
            }}
          >
            {tx.title} · {tx.topic}
          </button>
        ))}
      </div>

      {selected ? (
        <>
          <article
            className="mt-6 rounded-[var(--radius-lg)] border p-6 sm:p-10"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
          >
            <h2 className="page-title text-xl">{selected.title}</h2>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>{t("reading.minRead", { count: minutes })}</span>
              <span aria-hidden>·</span>
              <span>{t("reading.words", { count: words })}</span>
              <span aria-hidden>·</span>
              <span>{selected.level}</span>
            </div>

            <p
              className="mt-4 rounded-lg px-3 py-2 text-xs"
              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
            >
              {t("reading.hint")}
            </p>

            <div className="mt-6">
              <ReadingTextView text={selected} />
            </div>
          </article>

          <ComprehensionQuiz textId={selected.id} questions={selected.questions} />
        </>
      ) : (
        <p className="mt-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("common.comingSoon")}
        </p>
      )}
    </div>
  );
}
