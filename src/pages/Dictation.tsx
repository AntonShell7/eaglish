import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { DictationRunner } from "@/components/dictation/DictationRunner";
import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { getLearnerProfile } from "@/lib/learnerProfile";

/**
 * Dictation, built on the library the app already has.
 *
 * The free dictation sites are limited by their audio: someone had to clip it,
 * so you practise whatever they clipped, and the library stops growing when
 * they stop working. Reading the app's own sentences aloud removes that limit
 * entirely — every text is already an exercise, and a text generated around
 * the learner's own weak words is one the moment it exists.
 */
export default function Dictation() {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState<string | null>(null);
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [open, setOpen] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(false);

  const level = getLearnerProfile()?.level ?? null;

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    let cancelled = false;
    void loadTopicTexts(topic).then((list) => {
      if (cancelled) return;
      setTexts(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [topic]);

  /** The learner's own level first: dictation at the wrong level is noise. */
  const ordered = useMemo(() => {
    if (!level) return texts;
    return [...texts].sort((a, b) => Number(b.level === level) - Number(a.level === level));
  }, [texts, level]);

  if (open) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <DictationRunner
          key={open.id}
          title={open.title}
          sentences={open.sentences}
          onExit={() => setOpen(null)}
        />
      </div>
    );
  }

  return (
    <SectionHero kicker={t("nav.dictation")} title={t("nav.dictation")} description={t("dictation.intro")}>
      {!topic ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readingTopics
            .filter((entry) => entry.total > 0)
            .map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="card card--interactive p-5 text-left"
                onClick={() => setTopic(entry.id)}
              >
                <h3 className="page-title text-lg">{entry.label}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("reading.textCount", { count: entry.total })}
                </p>
              </button>
            ))}
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center gap-3">
            <button type="button" className="btn btn--quiet btn--sm" onClick={() => setTopic(null)}>
              ← {t("dictation.allTopics")}
            </button>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-3">
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.map((text) => (
                <button
                  key={text.id}
                  type="button"
                  className="card card--interactive flex h-full flex-col p-5 text-left"
                  onClick={() => setOpen(text)}
                >
                  <span className="chip chip--brand self-start">{text.level}</span>
                  <h3 className="page-title mt-3 text-base leading-snug">{text.title}</h3>
                  <p className="mt-2 flex-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {i18n.language.startsWith("ru")
                      ? text.sentences[0]?.translationRu
                      : text.sentences[0]?.text}
                  </p>
                  <p className="mt-3 text-xs" style={{ color: "var(--color-text-faint)" }}>
                    {t("dictation.sentenceCount", { count: text.sentences.length })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </SectionHero>
  );
}
