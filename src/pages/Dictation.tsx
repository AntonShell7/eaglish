import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSegmented } from "@/lib/useSegmented";
import { SectionHero } from "@/components/SectionHero";
import { DictationRunner } from "@/components/dictation/DictationRunner";
import { VideoDictation } from "@/components/dictation/VideoDictation";
import { AddVideo } from "@/components/dictation/AddVideo";
import { getVideoExercises, removeVideoExercise } from "@/lib/videoStore";
import type { VideoExercise } from "@/lib/videoDictation";
import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { LevelFilter } from "@/components/LevelFilter";
import { measureLevel, type Cefr, type Band } from "@/lib/textLevel";
import { ensureLexicon } from "@/lib/lexicon";

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
  const [picked, setPicked] = useState<Cefr | null>(null);
  const [mode, setMode] = useState<"voice" | "video">("voice");
  const [videos, setVideos] = useState<VideoExercise[]>(() => getVideoExercises());
  const [adding, setAdding] = useState(false);
  const [openVideo, setOpenVideo] = useState<VideoExercise | null>(null);
  const { ref, style } = useSegmented(mode);

  const [levels, setLevels] = useState<Record<string, Cefr>>({});

  const bandOfLearner = getLearnerProfile()?.level ?? null;

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    let cancelled = false;
    void (async () => {
      // The frequency list has to be in memory before a text can be measured.
      const [list] = await Promise.all([loadTopicTexts(topic), ensureLexicon()]);
      if (cancelled) return;
      const measured: Record<string, Cefr> = {};
      for (const text of list) {
        measured[text.id] = measureLevel(text.level as Band, text.sentences).level;
      }
      setTexts(list);
      setLevels(measured);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [topic]);

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const text of texts) {
      const level = levels[text.id];
      if (level) out[level] = (out[level] ?? 0) + 1;
    }
    return out;
  }, [texts, levels]);

  /** The learner's own band first: dictation at the wrong level is noise. */
  const ordered = useMemo(() => {
    const filtered = picked ? texts.filter((text) => levels[text.id] === picked) : texts;
    if (!bandOfLearner) return filtered;
    return [...filtered].sort((a, b) => Number(b.level === bandOfLearner) - Number(a.level === bandOfLearner));
  }, [texts, levels, picked, bandOfLearner]);

  if (openVideo) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <VideoDictation key={openVideo.id} exercise={openVideo} onExit={() => setOpenVideo(null)} />
      </div>
    );
  }

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
      <div className="segmented mt-8" ref={ref} style={style}>
        {(["voice", "video"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={`segmented__item${mode === key ? " is-active" : ""}`}
            onClick={() => setMode(key)}
          >
            {t(`dictation.mode.${key}`)}
          </button>
        ))}
      </div>

      {mode === "video" ? (
        adding ? (
          <div className="mt-6">
            <AddVideo
              onAdded={() => {
                setVideos(getVideoExercises());
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <div className="mt-6">
            <button type="button" className="btn btn--primary" onClick={() => setAdding(true)}>
              + {t("video.addTitle")}
            </button>

            {videos.length === 0 ? (
              <p className="mt-6 max-w-xl text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {t("video.empty")}
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <div key={video.id} className="card flex h-full flex-col p-5">
                    <span className="chip chip--brand self-start">{video.level}</span>
                    <h3 className="page-title mt-3 text-base leading-snug">{video.title}</h3>
                    <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {video.channel}
                    </p>
                    <p className="mt-2 flex-1 text-xs" style={{ color: "var(--color-text-faint)" }}>
                      {t("dictation.sentenceCount", { count: video.segments.length })}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" className="btn btn--primary btn--sm" onClick={() => setOpenVideo(video)}>
                        {t("video.start")}
                      </button>
                      <button
                        type="button"
                        className="btn btn--quiet btn--sm"
                        onClick={() => {
                          removeVideoExercise(video.id);
                          setVideos(getVideoExercises());
                        }}
                      >
                        {t("vocabulary.remove")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : !topic ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readingTopics
            .filter((entry) => entry.total > 0)
            .map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="card card--interactive p-5 text-left"
                onClick={() => setTopic(entry.id)}
              >
                <h3 className="page-title text-lg">{t(`reading.topics.${entry.id}`)}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("reading.textCount", { count: entry.total })}
                </p>
              </button>
            ))}
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn--quiet btn--sm" onClick={() => setTopic(null)}>
              ← {t("dictation.allTopics")}
            </button>
            {!loading && <LevelFilter value={picked} counts={counts} onChange={setPicked} />}
          </div>

          {loading ? (
            <div className="mt-6 grid gap-3">
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ordered.length === 0 && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("levels.empty")}
                </p>
              )}
              {ordered.map((text) => (
                <button
                  key={text.id}
                  type="button"
                  className="card card--interactive flex h-full flex-col p-5 text-left"
                  onClick={() => setOpen(text)}
                >
                  <span className="chip chip--brand self-start">{levels[text.id] ?? text.level}</span>
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
