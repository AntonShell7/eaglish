import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkDictation, worthLearning, type DictationResult } from "@/lib/dictation";
import type { VideoExercise } from "@/lib/videoDictation";
import { useYouTube } from "./useYouTube";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { lookupWord } from "@/lib/translate";
import { LookupPopup, type LookupRequest } from "@/components/lookup/LookupPopup";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import "./dictation.css";

/**
 * Dictation against a real recording.
 *
 * Same loop as the synthesised exercise — hear it, write it, see exactly what
 * you missed, collect those words — over a human voice, which is where the
 * difficulty that matters lives: contractions, linking, words run together.
 *
 * The video stays visible rather than hidden behind an audio bar. Seeing a
 * speaker is part of listening, the channel gets its due, and covering the
 * player would be against the terms that let us use it at all.
 */
export function VideoDictation({ exercise, onExit }: { exercise: VideoExercise; onExit: () => void }) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const mountId = `yt-${exercise.id}`;
  const { ready, playSegment, stop } = useYouTube(exercise.videoId, mountId);

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [plays, setPlays] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [saved, setSaved] = useState<Record<string, "saving" | "done" | "failed">>({});
  const [lookup, setLookup] = useState<LookupRequest | null>(null);

  const segment = exercise.segments[index];
  const done = index >= exercise.segments.length;

  useEffect(() => {
    if (!segment || !ready) return;
    setTyped("");
    setResult(null);
    setPlays(1);
    playSegment(segment.start, segment.end);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ready]);

  const play = () => {
    if (!segment) return;
    setPlays((n) => n + 1);
    playSegment(segment.start, segment.end);
  };

  const check = () => {
    if (!segment || !typed.trim()) return;
    stop();
    const outcome = checkDictation(segment.text, typed);
    setResult(outcome);
    setScores((all) => [...all, outcome.accuracy]);
  };

  const next = () => {
    if (index + 1 >= exercise.segments.length) {
      finish("listening", `video:${exercise.id}:${new Date().toDateString()}`, t("dictation.taskDone"));
    }
    setIndex((i) => i + 1);
  };

  // Ctrl replays, Enter moves on — the same hands-stay-on-the-keys rule the
  // synthesised exercise follows.
  useEffect(() => {
    let ctrlAlone = false;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control" || event.key === "Meta") {
        ctrlAlone = true;
        return;
      }
      ctrlAlone = false;
      if (event.key === "Enter" && result && !event.shiftKey) {
        event.preventDefault();
        next();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if ((event.key === "Control" || event.key === "Meta") && ctrlAlone) {
        ctrlAlone = false;
        play();
      }
    };
    const onBlur = () => {
      ctrlAlone = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  });

  const offered = useMemo(
    () => (result ? worthLearning(result.missed).filter((w) => !isWordSaved(w)) : []),
    [result],
  );

  const save = async (word: string) => {
    setSaved((s) => ({ ...s, [word]: "saving" }));
    const found = await lookupWord(word, { sentence: segment?.text });
    if (!found.translation) {
      setSaved((s) => ({ ...s, [word]: "failed" }));
      return;
    }
    addVocabularyWord(word, found.translation, t("dictation.source", { title: exercise.title }), segment?.text);
    setSaved((s) => ({ ...s, [word]: "done" }));
  };

  return (
    <div className="dict">
      <div className="dict__top">
        <button type="button" className="btn btn--quiet btn--sm" onClick={onExit}>
          ← {t("dictation.back")}
        </button>
        <span className="dict__count tabular">
          {Math.min(index + 1, exercise.segments.length)} / {exercise.segments.length}
        </span>
      </div>

      <div className="dict__bar" aria-hidden>
        <span style={{ width: `${(index / exercise.segments.length) * 100}%` }} />
      </div>

      {/* The player is always mounted: unmounting it between segments would
          reload the video and lose a second to buffering every time. */}
      <div className="dict__video">
        <div id={mountId} />
      </div>

      <p className="dict__credit">
        {exercise.channel ? t("video.credit", { channel: exercise.channel }) : t("video.creditUnknown")} ·{" "}
        <a href={`https://www.youtube.com/watch?v=${exercise.videoId}`} target="_blank" rel="noreferrer">
          {t("dictation.openOnYouTube")}
        </a>
      </p>

      {done ? (
        <section className="card dict__card text-center">
          <p className="eyebrow">{t("dictation.finished")}</p>
          <p className="page-title mt-2 text-3xl">
            {Math.round((scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1)) * 100)}%
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("dictation.finishedBody", { count: exercise.segments.length })}
          </p>
          <button type="button" className="btn btn--primary mt-6" onClick={onExit}>
            {t("dictation.chooseAnother")}
          </button>
        </section>
      ) : (
        <section className="card dict__card">
          <div className="dict__controls">
            <button type="button" className="dict__play" onClick={play} disabled={!ready}>
              {t("dictation.play")}
            </button>
            <span className="dict__plays tabular">{t("dictation.playCount", { count: plays })}</span>
          </div>

          {!result ? (
            <>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    check();
                  }
                }}
                rows={3}
                placeholder={t("dictation.placeholder")}
                className="field dict__input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <div className="dict__actions">
                <button type="button" className="btn btn--primary" onClick={check} disabled={!typed.trim()}>
                  {t("dictation.check")}
                </button>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => {
                    setTyped(segment.text);
                    setResult(checkDictation(segment.text, segment.text));
                  }}
                >
                  {t("dictation.reveal")}
                </button>
              </div>
            </>
          ) : (
            <div className="dict__result">
              <p className="dict__marks">
                {result.marks.map((mark, i) => {
                  const word = mark.kind === "extra" ? mark.typed : mark.expected;
                  if (!word) return null;
                  return (
                    <button
                      type="button"
                      key={i}
                      className={`dict__m dict__m--${mark.kind}`}
                      onClick={(e) =>
                        setLookup({
                          word: word.replace(/^[^\p{L}]+|[^\p{L}']+$/gu, ""),
                          sentence: segment.text,
                          knownSentenceTranslation: segment.translationRu,
                          source: t("dictation.source", { title: exercise.title }),
                          anchor: { x: e.clientX, y: e.clientY },
                        })
                      }
                    >
                      {word}
                    </button>
                  );
                })}
              </p>

              {segment.translationRu && <p className="dict__ru">{segment.translationRu}</p>}
              <p className="dict__tap">{t("dictation.tapAnyWord")}</p>

              <p className={result.accuracy === 1 ? "dict__verdict is-perfect" : "dict__verdict"}>
                {result.accuracy === 1
                  ? t("dictation.perfect")
                  : t("dictation.accuracy", { percent: Math.round(result.accuracy * 100) })}
              </p>

              {offered.length > 0 && (
                <div className="dict__harvest">
                  <p className="eyebrow">{t("dictation.missedTitle")}</p>
                  <p className="dict__harvestBody">{t("dictation.missedBody")}</p>
                  <div className="dict__words">
                    {offered.map((word) => {
                      const state = saved[word];
                      return (
                        <button
                          key={word}
                          type="button"
                          className={state === "done" ? "dict__word is-saved" : "dict__word"}
                          onClick={() => (state ? undefined : save(word))}
                          disabled={state === "saving" || state === "done"}
                        >
                          {state === "done" ? "✓ " : state === "saving" ? "… " : "+ "}
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="dict__actions">
                <button type="button" className="btn btn--primary" onClick={next}>
                  {index + 1 >= exercise.segments.length ? t("dictation.finishBtn") : t("dictation.next")}
                </button>
                <button type="button" className="btn btn--quiet" onClick={play}>
                  {t("dictation.again")}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <p className="dict__hints">
        <kbd>Enter</kbd> {t("dictation.hintCheck")} · <kbd>Ctrl</kbd> {t("dictation.hintReplay")}
      </p>

      {lookup && <LookupPopup request={lookup} onClose={() => setLookup(null)} />}
    </div>
  );
}
