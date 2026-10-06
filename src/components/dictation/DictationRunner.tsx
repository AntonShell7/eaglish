import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkDictation, maskAgainst, worthLearning, type DictationResult } from "@/lib/dictation";
import { WordPractice } from "@/components/practice/WordPractice";
import { useSpeech } from "./useSpeech";
import { clearProgress, getProgress, saveProgress } from "@/lib/dictationProgress";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { lookupWord } from "@/lib/translate";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { LookupPopup, type LookupRequest } from "@/components/lookup/LookupPopup";
import { PenToggle } from "@/components/ui/PenToggle";
import { HandwritingPad, type HandwritingPadHandle } from "@/components/ui/HandwritingPad";
import { useInputMode } from "@/lib/inputMode";
import "./dictation.css";

export interface DictationSentence {
  text: string;
  translationRu?: string;
}

interface Props {
  /** Stable id, so the place can be kept between visits. */
  id: string;
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
export function DictationRunner({ id, title, sentences, onExit }: Props) {
  const { t } = useTranslation();
  const { speak, stop, speaking, supported, prefetch } = useSpeech();
  const { finish } = useTaskDone();

  // Resumes where the last session stopped: fifty fragments is twenty minutes,
  // and an exercise that always restarts from the first sentence is one that
  // never gets finished.
  const [index, setIndex] = useState(() => {
    const saved = getProgress(id);
    return saved && saved.index < sentences.length ? saved.index : 0;
  });
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  /* A wrong answer is shown as a skeleton first and only revealed on request:
     the gap between trying and surrendering is where the listening happens. */
  const [revealed, setRevealed] = useState(false);
  const [plays, setPlays] = useState(0);
  const [slow, setSlow] = useState(false);
  const [scores, setScores] = useState<number[]>(() => getProgress(id)?.scores ?? []);
  /* Every word missed across the whole dictation, not just the last sentence.
     The retelling at the end is about the session, and a learner who stumbled
     on "brittle" in sentence four should be asked to use it. */
  const [missedAll, setMissedAll] = useState<string[]>([]);
  const [saved, setSaved] = useState<Record<string, "saving" | "done" | "failed">>({});
  const input = useRef<HTMLTextAreaElement>(null);
  const [lookup, setLookup] = useState<LookupRequest | null>(null);

  /*
   * Pen or keyboard.
   *
   * Dictation is the exercise handwriting was asked for: you hear a sentence
   * and write it down, which on paper is what the exercise has always been.
   * Nothing on the server can read handwriting yet, so the pen path cannot be
   * graded — it reveals the sentence and the learner marks themselves, which
   * is both honest and the way dictation was checked long before software.
   */
  const [mode] = useInputMode();
  const pad = useRef<HandwritingPadHandle | null>(null);
  const [inked, setInked] = useState(false);
  const pen = mode === "pen";

  const sentence = sentences[index];
  const done = index >= sentences.length;
  /* Exact, not nearly: a dictation is a transcription, and "almost" is the
     thing the learner is here to stop doing. */
  const perfect = result ? result.accuracy === 1 : false;
  /**
   * Whether this fragment is finished with.
   *
   * A dictation is not a quiz you can click past. The point is to get the
   * sentence down, so moving on means either getting it or asking to be shown
   * it — and Enter used to skip straight over a wrong answer, which turned the
   * exercise into a slideshow. Skipping is still allowed, by a button that
   * says so.
   */
  const passed = perfect || revealed;
  const typos = result ? result.marks.filter((m) => m.kind === "typo").length : 0;
  const slips = result ? result.marks.filter((m) => m.kind !== "correct" && m.kind !== "typo").length : 0;

  /*
   * The first fragment arrives silent; every one after it plays itself.
   *
   * The whole lesson used to start talking the moment it opened, which is
   * audio beginning before anybody has settled, in a room where it may not be
   * welcome, with no chance to reach for headphones — and the first play of a
   * dictation is the one worth getting right. So the learner opens the sound.
   *
   * After that the opposite is true. Having decided to do a dictation and
   * finished a fragment, pressing play again is a chore with no decision in
   * it, so arriving at the next one starts it.
   */
  useEffect(() => {
    if (!sentence || !supported) return;
    setTyped("");
    setResult(null);
    setRevealed(false);
    setPlays(0);
    pad.current?.clear();
    setInked(false);
    input.current?.focus();

    if (!autoPlay.current) return;
    // A beat before it speaks: arriving and being spoken at in the same frame
    // reads as a glitch, and half a second is long enough to look up.
    const timer = window.setTimeout(() => {
      setPlays(1);
      speak(sentence.text, slow ? 0.7 : 1);
    }, 500);
    return () => window.clearTimeout(timer);

    // The next line is fetched while this one is being typed, which is the
    // whole of the latency budget: by the time anyone presses Enter the audio
    // for what follows has been sitting decoded for half a minute.
    const upcoming = sentences[index + 1];
    if (upcoming) prefetch(upcoming.text);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, supported]);

  /**
   * Set once the learner has moved on from a fragment, so every fragment after
   * the first plays on arrival. The first one waits: audio that starts before
   * anybody has settled, in a room where it may not be welcome, is the one
   * play of a dictation that is worth getting wrong.
   */
  const autoPlay = useRef(false);

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

      /*
       * One key, three meanings, and the state decides which.
       *
       * Enter checks. Enter again moves on — but only once the sentence has
       * been got or given up on. In between it puts the learner back in the
       * field with the sentence playing, because the useful thing to do after
       * a near miss is listen again, not read the answer.
       */
      if (event.key === "Enter" && !event.shiftKey && result) {
        event.preventDefault();
        if (passed) next();
        else retry();
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
    // A perfect answer has nothing to hide behind, so it opens straight away.
    setRevealed(outcome.accuracy === 1);
    setScores((all) => [...all, outcome.accuracy]);
    setMissedAll((all) => [...new Set([...all, ...outcome.missed])]);
  };

  /** Back to the field, with the sentence playing. */
  const retry = () => {
    setResult(null);
    setRevealed(false);
    play();
    input.current?.focus();
  };

  const next = () => {
    /* The next fragment plays itself; this one did not. Pressing play once at
       the start of a lesson is a decision — the learner chooses when sound
       begins — and pressing it again at every fragment after that is a chore
       with no decision in it. */
    autoPlay.current = true;
    const nextIndex = index + 1;
    if (nextIndex >= sentences.length) {
      finish("listening", `dictation:${id}:${new Date().toDateString()}`, t("dictation.taskDone"));
      clearProgress(id);
    } else {
      saveProgress(id, nextIndex, scores);
    }
    setIndex(nextIndex);
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
      <div className="card mx-auto max-w-2xl p-8 text-center">
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

        {/* The dictation is already scored and saved; this is the offer to do
            something with the words that caught you out. */}
        <div className="text-left">
          <WordPractice context={title} words={worthLearning(missedAll).slice(0, 6).map((word) => ({ word }))} />
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
        {/* The sentence you are on, as a number worth glancing at. */}
        <span className="dict__count tabular">
          <b>{index + 1}</b> <span>/ {sentences.length}</span>
        </span>
      </div>

      <div className="dict__bar" aria-hidden>
        <span style={{ width: `${(index / sentences.length) * 100}%` }} />
      </div>

      {/* One surface, not a card inside a page inside a card.
          The old layout nested three greys and then floated the whole thing in
          the middle of a black screen, which read as a dialog box that had
          lost its window. This is the page. */}
      <section className="dict__stage">
        <div className="dict__listen">
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

          <PenToggle className="dict__pen" />
        </div>

          {/* The voice and accent picker is gone. It existed because the
              library had no recordings and the browser's own voices were all
              there was — which is also why it sounded the way it did. Every
              sentence is recorded now, so the chooser was offering a worse
              option for a problem that no longer exists. */}
          <div className="dict__listenFoot">
            {/* The hint says what Enter does *now*, not what it does in
                general — a key with two jobs needs the label to keep up. */}
            <p className="dict__hints">
              <kbd>Enter</kbd> {!result ? t("dictation.hintCheck") : passed ? t("dictation.hintNext") : t("dictation.tryAgain").toLowerCase()}
              {" · "}
              <kbd>Ctrl</kbd> {t("dictation.hintReplay")}
            </p>
          </div>
        </div>

        {/* The writing zone and the buttons keep their places whatever happens
            below them. The result used to replace this block, so every check
            moved the controls out from under the hand that was reaching for
            them. */}
        <div className="dict__write">
          <p className="eyebrow">{t("dictation.writeLabel")}</p>
          {/* The field never leaves. It used to be swapped out for the
              result, which moved the buttons out from under the hand that was
              reaching for them on every single check. After a check it simply
              stops accepting input. */}
          <>
            {pen ? (
              <HandwritingPad
                rows={4}
                onFirstStroke={() => setInked(true)}
                padRef={(handle) => {
                  pad.current = handle;
                }}
              />
            ) : (
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
              readOnly={Boolean(result)}
              className={result ? "field dict__input is-locked" : "field dict__input"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            )}

            <div className="dict__actions">
              {result ? (
                /* Same row, same place, different job. */
                revealed ? (
                  <>
                    <button type="button" className="btn btn--primary" onClick={next}>
                      {index + 1 >= sentences.length ? t("dictation.finishBtn") : t("dictation.next")}
                    </button>
                    <button type="button" className="btn btn--quiet" onClick={play}>
                      {t("dictation.again")}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn--primary" onClick={retry}>
                      {t("dictation.tryAgain")}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => setRevealed(true)}>
                      {t("dictation.showAnswer")}
                    </button>
                  </>
                )
              ) : pen ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!inked}
                  onClick={() => {
                    setTyped(sentence.text);
                    setResult(checkDictation(sentence.text, sentence.text));
                    setRevealed(true);
                  }}
                >
                  {t("input.reveal")}
                </button>
              ) : (
                <button type="button" className="btn btn--primary" onClick={check} disabled={!typed.trim()}>
                  {t("dictation.check")}
                </button>
              )}
              {/* Skip, not reveal.
                  The answer used to be one press away before anything had been
                  attempted, which is the exercise deleted rather than
                  shortened. It is still reachable — after a try, where it
                  means "I have had a go and I am stuck", which is a different
                  thing to ask for. */}
              {!result && (
                <button type="button" className="btn btn--quiet" onClick={next}>
                  {t("dictation.skip")}
                </button>
              )}
            </div>
          </>

          {result && (
          <div className="dict__result">
            {/*
              * The verdict, always, right or wrong.
              *
              * A check used to produce either a masked hint or the full answer,
              * and in neither case did it say plainly how you had done. Getting
              * a sentence exactly right is the whole point of the exercise and
              * it passed without comment; getting one wrong showed a line of
              * dots. Both are now a banner that names the outcome first and
              * shows the detail under it.
              */}
            <p className={perfect ? "dict__verdict is-perfect" : "dict__verdict is-off"}>
              <span className="dict__verdictMark" aria-hidden>
                {perfect ? (
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                    strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
                    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v5M12 16.5v.01" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
              </span>
              {perfect
                ? t("dictation.perfect")
                : slips === 0
                  ? t("dictation.onlyTypos", { count: typos })
                  : t("dictation.slipped", { count: slips })}
            </p>

            {/* What you wrote, with the words that went wrong marked — before
                the answer is given away. Seeing *where* you slipped is what
                makes a second listen worth taking; seeing the answer ends it. */}
            {!perfect && (
              <p className="dict__yours">
                {result.marks
                  .filter((m) => m.kind !== "missing")
                  .map((mark, i) => (
                    <span
                      key={i}
                      className={
                        mark.kind === "correct"
                          ? "dict__y"
                          : mark.kind === "typo"
                            ? "dict__y dict__y--typo"
                            : "dict__y dict__y--bad"
                      }
                    >
                      {mark.typed}{" "}
                    </span>
                  ))}
              </p>
            )}

            {!revealed ? (
              <>
                <p className="dict__skeleton">
                  {maskAgainst(sentence.text, typed).map((word, i) => (
                    // A real space, not a margin: the line has to survive being
                    // copied and being read aloud by a screen reader.
                    <span key={i} className={word.mask ? "dict__sk dict__sk--hidden" : "dict__sk"}>
                      {word.mask ?? word.text}{" "}
                    </span>
                  ))}
                </p>

                <p className="dict__skHint">{t("dictation.skeletonHint")}</p>
              </>
            ) : (
            <>
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

            <p className="dict__ru">{sentence.translationRu}</p>

            <p className="dict__tap">{t("dictation.tapAnyWord")}</p>

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

            </>
            )}
          </div>
          )}
        </div>
      </section>

      {lookup && <LookupPopup request={lookup} onClose={() => setLookup(null)} />}

    </div>
  );
}
