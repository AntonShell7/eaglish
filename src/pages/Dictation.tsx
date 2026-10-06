import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSegmented } from "@/lib/useSegmented";
import { SectionHero } from "@/components/SectionHero";
import { DictationRunner } from "@/components/dictation/DictationRunner";
import { VideoDictation } from "@/components/dictation/VideoDictation";
import { AddVideo } from "@/components/dictation/AddVideo";
import { getVideoExercises, removeVideoExercise } from "@/lib/videoStore";
import type { VideoExercise } from "@/lib/videoDictation";
import { listeningTexts, listeningShelf } from "@/data/listeningLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { LevelFilter } from "@/components/LevelFilter";
import { progressOf } from "@/lib/dictationProgress";
import { levelOf, type Cefr } from "@/lib/textLevel";
import { ensureLexicon } from "@/lib/lexicon";

/**
 * Dictation, built on the library the app already has.
 *
 * The free dictation sites are limited by their audio: someone had to clip it,
 * so you practise whatever they clipped, and the library stops growing when
 * they stop working. Voicing our own sentences removes that limit entirely.
 *
 * It used to pour the 120 reading texts into this shelf as well, which made it
 * look full — 127 cards — while hiding the fact that only seven texts had been
 * written for it. They are not interchangeable: a fifth of reading sentences
 * run past 120 characters, which is beyond what anyone can hold in their head
 * while typing it. They have been taken out, and the shelf now shows the 48
 * texts written to that constraint and nothing else.
 *
 * Browsed by subject first, exactly as reading is. Eight topics, six texts in
 * each, levels inside.
 */
export default function Dictation() {
  const { t, i18n } = useTranslation();
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [open, setOpen] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Cefr | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [mode, setMode] = useState<"voice" | "video">("voice");
  const [videos, setVideos] = useState<VideoExercise[]>(() => getVideoExercises());
  const [adding, setAdding] = useState(false);
  const [openVideo, setOpenVideo] = useState<VideoExercise | null>(null);
  const { ref, style } = useSegmented(mode);

  const [levels, setLevels] = useState<Record<string, Cefr>>({});

  const bandOfLearner = getLearnerProfile()?.level ?? null;

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    void (async () => {
      // The frequency list has to be in memory before a text can be measured.
      await ensureLexicon();
      if (cancelled) return;
      const measured: Record<string, Cefr> = {};
      for (const text of listeningTexts) {
        measured[text.id] = levelOf(text.level, text.sentences);
      }
      setTexts(listeningTexts);
      setLevels(measured);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** The eight subjects and what each one holds. Fixed data, computed once. */
  const shelf = useMemo(() => listeningShelf(), []);

  /** Texts in the open subject. The shelf is never shown undivided. */
  const inTopic = useMemo(
    () => (topic ? texts.filter((text) => text.topic === topic) : []),
    [texts, topic],
  );

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const text of inTopic) {
      const level = levels[text.id];
      if (level) out[level] = (out[level] ?? 0) + 1;
    }
    return out;
  }, [inTopic, levels]);

  /** The learner's own band first: dictation at the wrong level is noise. */
  const ordered = useMemo(() => {
    const filtered = picked ? inTopic.filter((text) => levels[text.id] === picked) : inTopic;
    if (!bandOfLearner) return filtered;
    return [...filtered].sort((a, b) => Number(b.level === bandOfLearner) - Number(a.level === bandOfLearner));
  }, [inTopic, levels, picked, bandOfLearner]);

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
          id={open.id}
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
              <div data-stagger className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : (
        <>
          {/* Stage one: the subject. Same shape as reading, because the two
              shelves are browsed by the same person and a section that
              rearranges itself between visits is a section people stop
              trusting. */}
          {!topic && !loading && (
            <div data-stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shelf.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTopic(entry.id)}
                  className="card card--interactive card--accent flex h-full flex-col p-5 text-left"
                >
                  <h2 className="page-title text-lg leading-snug">
                    {t(`dictation.topics.${entry.id}`)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {t("reading.textCount", { count: entry.total })}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(["A1", "A2", "B1", "B2", "C1", "C2"] as const)
                      .filter((level) => entry.counts[level])
                      .map((level) => (
                        <span
                          key={level}
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
                        >
                          {level} · {entry.counts[level]}
                        </span>
                      ))}
                  </div>
                </button>
              ))}
            </div>
          )}

          {topic && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setTopic(null);
                  setPicked(null);
                }}
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                ← {t("dictation.allTopics")}
              </button>
              {!loading && <LevelFilter value={picked} counts={counts} onChange={setPicked} />}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid gap-3">
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
            </div>
          ) : !topic ? null : (
            /* A list, not a grid of tiles. Same as reading, and for the same
               reason: titles are the thing being scanned, and a three-column
               grid sets each one in a narrow column where a six-word title
               wraps to three lines. Down the page, one row each, level first. */
            <div data-stagger className="mt-5 space-y-2">
              {ordered.length === 0 && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("levels.empty")}
                </p>
              )}
              {ordered.map((text) => {
                const done = progressOf(text.id, text.sentences.length);
                return (
                  <button
                    key={text.id}
                    type="button"
                    className="card card--interactive card--accent flex w-full items-center gap-4 px-4 py-3.5 text-left"
                    onClick={() => setOpen(text)}
                  >
                    {/* The same badge reading uses. Two sections showing the
                        level in two different colours is how an app starts
                        looking assembled rather than designed. */}
                    <span className="level flex-none">{levels[text.id] ?? text.level}</span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{text.title}</span>
                      <span className="mt-0.5 block truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {t("dictation.sentenceCount", { count: text.sentences.length })} ·{" "}
                        {i18n.language.startsWith("ru")
                          ? text.sentences[0]?.translationRu
                          : text.sentences[0]?.text}
                      </span>

                      {/* Started but unfinished is the common state for a long
                          dictation, and the shelf should say so rather than
                          making every text look untouched. */}
                      {done > 0 && (
                        <span
                          className="mt-2 block h-1 w-full max-w-xs overflow-hidden rounded-full"
                          style={{ background: "var(--color-surface-3)" }}
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${done * 100}%`,
                              background: "var(--color-accent)",
                              transition: "width var(--dur-4) var(--ease)",
                            }}
                          />
                        </span>
                      )}
                    </span>

                    {done > 0 && (
                      <span
                        className="flex-none text-xs font-bold"
                        style={{ color: "var(--color-accent-ink)" }}
                      >
                        {Math.round(done * 100)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

    </SectionHero>
  );
}
