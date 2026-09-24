import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkDictation, worthLearning, type DictationResult } from "@/lib/dictation";
import { useSpeech } from "./useSpeech";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { lookupWord } from "@/lib/translate";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { LookupPopup, type LookupRequest } from "@/components/lookup/LookupPopup";
import { accentKey } from "./voices";
import "./dictation.css";

export interface DictationSentence {
  text: string;
  translationRu?: string;
}

interface Props {
  title: string;
  sentences: DictationSentence[];
  onExit: () => void;
}

/**
 * The exercise, and the thing that makes it worth building.
 *
 * Listening back to a sentence and writing it down is the most honest test of
 * listening there is: you cannot guess your way through it, and you find out
 * immediately which words you do not actually know. Every dictation site stops
 * exactly there, at the result screen — and the learner reaches for a notebook.
 *
 * Here the result screen is the beginning. The words you missed are already
 * identified, already carry the sentence you met them in, and are one tap from
 * the same review queue that the reading and writing sections feed. Nothing is
 * copied anywhere by hand, and nothing has to be remembered on the way.
 */
export function DictationRunner({ title, sentences, onExit }: Props) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported, voices, voice, chooseVoice } = useSpeech();
  const { finish } = useTaskDone();

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [plays, setPlays] = useState(0);
  const [slow, setSlow] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [saved, setSaved] = useState<Record<string, "saving" | "done" | "failed">>({});
  const input = useRef<HTMLTextAreaElement>(null);
  const [lookup, setLookup] = useState<LookupRequest | null>(null);

  const sentence = sentences[index];
  const done = index >= sentences.length;

  // A new sentence is played once without being asked: the exercise is
  // listening, and the first thing that should happen is sound.
  useEffect(() => {
    if (!sentence || !supported) return;
    setTyped("");
    setResult(null);
    setPlays(1);
    speak(sentence.text, slow ? 0.7 : 1);
    input.current?.focus();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, supported]);

  const play = () => {
    if (!sentence) return;
    setPlays((n) => n + 1);
    speak(sentence.text, slow ? 0.7 : 1);
  };

  /**
   * The whole exercise happens on the keyboard, so leaving it to reach for a
   * replay button breaks the one rhythm that matters: hear, type, hear again.
   * Enter checks and then moves on; the modifier plays the sentence back from
   * anywhere on the screen, including mid-word.
   */
  useEffect(() => {
    // Ctrl on its own replays, which is the shortcut every dictation tool uses
    // because it is the one key you can hit blind, mid-word, without leaving
    // the text. Firing on keydown would break every Ctrl+C, so it fires on
    // release and only when nothing was pressed while it was held.
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

  const check = () => {
    if (!sentence || !typed.trim()) return;
    stop();
    const outcome = checkDictation(sentence.text, typed);
    setResult(outcome);
    setScores((all) => [...all, outcome.accuracy]);
  };

  const next = () => {
    if (index + 1 >= sentences.length) {
      finish("listening", `dictation:${title}:${new Date().toDateString()}`, t("dictation.taskDone"));
    }
    setIndex((i) => i + 1);
  };

  /** Only words worth a place in a review queue — articles are not gaps. */
  const offered = useMemo(
    () => (result ? worthLearning(result.missed).filter((w) => !isWordSaved(w)) : []),
    [result],
  );

  const save = async (word: string) => {
    setSaved((s) => ({ ...s, [word]: "saving" }));
    const found = await lookupWord(word, { sentence: sentence?.text });
    if (!found.translation) {
      setSaved((s) => ({ ...s, [word]: "failed" }));
      return;
    }
    addVocabularyWord(word, found.translation, t("dictation.source", { title }), sentence?.text);
    setSaved((s) => ({ ...s, [word]: "done" }));
  };

  if (!supported) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="page-title text-xl">{t("dictation.noVoiceTitle")}</p>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("dictation.noVoiceBody")}
        </p>
        <button type="button" className="btn btn--ghost mt-6" onClick={onExit}>
          {t("common.back")}
        </button>
      </div>
    );
  }

  if (done) {
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="eyebrow">{t("dictation.finished")}</p>
        <p className="page-title mt-2 text-3xl">{Math.round(average * 100)}%</p>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("dictation.finishedBody", { count: sentences.length })}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn--primary" onClick={onExit}>
            {t("dictation.chooseAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dict">
      <div className="dict__top">
        <button type="button" className="btn btn--quiet btn--sm" onClick={onExit}>
          ← {t("dictation.back")}
        </button>
        <span className="dict__count tabular">
          {index + 1} / {sentences.length}
        </span>
      </div>

      <div className="dict__bar" aria-hidden>
        <span style={{ width: `${(index / sentences.length) * 100}%` }} />
      </div>

      <section className="card dict__card">
        <p className="eyebrow">{t("dictation.listenLabel")}</p>

        <div className="dict__controls">
          <button type="button" className="dict__play" onClick={play} aria-label={t("dictation.play")}>
            <span className={speaking ? "dict__wave is-on" : "dict__wave"} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {t("dictation.play")}
          </button>

          <button
            type="button"
            className={slow ? "chip chip--brand" : "chip"}
            onClick={() => {
              setSlow((v) => !v);
              if (sentence) speak(sentence.text, slow ? 1 : 0.7);
            }}
          >
            {slow ? t("dictation.slowOn") : t("dictation.slow")}
          </button>

          <span className="dict__plays tabular">{t("dictation.playCount", { count: plays })}</span>
        </div>

        {!result ? (
          <>
            <textarea
              ref={input}
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
                  setTyped(sentence.text);
                  setResult(checkDictation(sentence.text, sentence.text));
                }}
              >
                {t("dictation.reveal")}
              </button>
            </div>
          </>
        ) : (
          <div className="dict__result">
            {/* Every word is tappable, not only the ones marked wrong. A
                learner often types a word correctly from the sound and still
                has no idea what it means — which is exactly the word worth
                collecting, and exactly the one a mistake-driven list misses. */}
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
                        sentence: sentence.text,
                        knownSentenceTranslation: sentence.translationRu,
                        source: t("dictation.source", { title }),
                        anchor: { x: e.clientX, y: e.clientY },
                      })
                    }
                  >
                    {word}
                  </button>
                );
              })}
            </p>

            <p className="dict__score tabular">
              {t("dictation.accuracy", { percent: Math.round(result.accuracy * 100) })}
            </p>

            {sentence.translationRu && <p className="dict__ru">{sentence.translationRu}</p>}

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
                        onClick={() => state ? undefined : save(word)}
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
                {index + 1 >= sentences.length ? t("dictation.finishBtn") : t("dictation.next")}
              </button>
              <button type="button" className="btn btn--quiet" onClick={play}>
                {t("dictation.again")}
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="dict__hints">
        <kbd>Enter</kbd> {t("dictation.hintCheck")} · <kbd>Ctrl</kbd> {t("dictation.hintReplay")}
      </p>

      {lookup && <LookupPopup request={lookup} onClose={() => setLookup(null)} />}

      {voices.length > 0 && (
        <p className="dict__voice">
          <label htmlFor="dict-voice">{t("dictation.voiceLabel")}</label>{" "}
          <select
            id="dict-voice"
            className="dict__voiceSelect"
            value={voice?.name ?? ""}
            onChange={(e) => {
              chooseVoice(e.target.value);
              const picked = voices.find((v) => v.name === e.target.value);
              // Speak on pick: the only way to judge a voice is to hear it.
              if (picked && sentence) {
                window.speechSynthesis.cancel();
                const sample = new SpeechSynthesisUtterance(sentence.text);
                sample.voice = picked;
                sample.lang = picked.lang;
                sample.rate = slow ? 0.7 : 1;
                window.speechSynthesis.speak(sample);
              }
            }}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} · {t(`dictation.accents.${accentKey(v.lang)}`)}
              </option>
            ))}
          </select>
        </p>
      )}
    </div>
  );
}
