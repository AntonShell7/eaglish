import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  checkSentence,
  getHint,
  markActivated,
  sentencesFor,
  tooSimilar,
  type Hint,
  type UsageVerdict,
} from "@/lib/activation";
import { reviewWord, type VocabularyWord } from "@/lib/vocabularyStore";
import { usesWord } from "@/lib/wordMatch";
import { useInputMode } from "@/lib/inputMode";
import { PenToggle } from "@/components/ui/PenToggle";
import { HandwritingPad, type HandwritingPadHandle } from "@/components/ui/HandwritingPad";
import { transcribeHandwriting } from "@/lib/handwriting";
import "./activation.css";

/**
 * One word, one sentence.
 *
 * Kept to a single word on purpose. An essay brief produces one piece of
 * writing an evening and practises five words badly; this produces a sentence a
 * minute, and a sentence is the smallest unit in which a word can actually be
 * wrong. The rhythm is a flashcard's — see, answer, learn — with the one change
 * that matters: the answer has to be built rather than recognised.
 */
let verdictKey = 0;

export function SentenceDrill({
  word,
  onDone,
  onSkip,
}: {
  word: VocabularyWord;
  onDone: (correct: boolean) => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [sentence, setSentence] = useState("");
  const [verdict, setVerdict] = useState<UsageVerdict | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintBusy, setHintBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const pad = useRef<HandwritingPadHandle | null>(null);
  const [mode] = useInputMode();
  const pen = mode === "pen";
  /* Written by hand and compared against the model sentence rather than sent
     for marking: nothing on the server reads handwriting yet, so the only
     honest check is one the learner makes with the answer in front of them. */
  const [inked, setInked] = useState(false);
  /**
   * What the model read off the pad, waiting to be confirmed.
   *
   * Nothing is graded until the learner agrees this is what they wrote. A
   * single misread word would otherwise have the model critiquing a sentence
   * nobody wrote, and wrong feedback is worse than none.
   */
  const [reading, setReading] = useState<string | null>(null);
  const [readingFailed, setReadingFailed] = useState(false);
  /* What this learner already wrote with this word. The exercise is to say
     something new, not to reproduce a sentence that once worked. */
  const written = useMemo(() => sentencesFor(word.word), [word.word, verdictKey]);

  useEffect(() => {
    setSentence("");
    setVerdict(null);
    setHint(null);
    setHintLevel(0);
    setInked(false);
    setReading(null);
    setReadingFailed(false);
    pad.current?.clear();
    if (!pen) input.current?.focus();
  }, [word.id, pen]);

  const askForHint = async () => {
    // The first press reveals the Russian sentence, the second the model one.
    // Both arrive in a single call, so pressing twice costs nothing extra.
    if (hint) {
      setHintLevel((level) => Math.min(2, level + 1));
      return;
    }
    setHintBusy(true);
    // The learner's own sentences go with the request, so the suggestion
    // points somewhere they have not been rather than back at what they wrote.
    const got = await getHint(word, written);
    setHint(got);
    setHintLevel(1);
    setHintBusy(false);
  };

  /** Another idea, when the first one does not spark anything. */
  const anotherHint = async () => {
    setHintBusy(true);
    const got = await getHint(word, [...written, hint?.toTranslate ?? "", hint?.model ?? ""].filter(Boolean));
    setHint(got);
    setHintLevel((level) => Math.max(1, level));
    setHintBusy(false);
  };

  /**
   * Sends the pad to be read, and stops. Nothing is graded off this.
   */
  const readPad = async () => {
    const image = pad.current?.toImage();
    if (!image || busy) return;
    setBusy(true);
    setReadingFailed(false);
    const got = await transcribeHandwriting(image);
    setBusy(false);
    if (got) setReading(got);
    else setReadingFailed(true);
  };

  const submit = async (fromPad?: string) => {
    const text = (fromPad ?? sentence).trim();
    if (!text || busy) return;

    if (tooSimilar(text, written)) {
      setVerdict({
        correct: false,
        repeat: true,
        verdict: t("activation.tooSimilar"),
        issues: [],
        alternatives: [],
      });
      return;
    }

    setBusy(true);
    const result = await checkSentence(word, text);
    setVerdict(result);
    setBusy(false);
    // The confirmed transcription becomes the answer, so the verdict screen
    // shows what was judged rather than an empty keyboard field.
    if (fromPad) setSentence(fromPad);
    setReading(null);

    if (result.correct) {
      markActivated(word.word, text);
      verdictKey++;
      // Producing a word unprompted is stronger evidence than any card, so it
      // counts as a good recall — but not an easy one, because the word was on
      // screen the whole time.
      reviewWord(word.id, 2);
    }
  };

  /*
   * A hint, never a gate.
   *
   * This used to block the submission, which meant a heuristic got the last
   * word over a person: "ghost someone" written as "I ghosted my friend" was
   * refused, and so was "cafe" for "café", because the learner's keyboard has
   * no acute accent. A check that cannot be sure has no business refusing an
   * answer — it can only raise an eyebrow, and the model decides.
   */
  const containsWord = !sentence.trim() || usesWord(sentence, word.word);

  return (
    <div className="drill">
      <div className="drill__card">
        <div className="drill__head">
          <p className="eyebrow">{t("activation.useThis")}</p>
          <PenToggle />
        </div>

        <p className="drill__word">{word.word}</p>
        <p className="drill__translation">{word.translation}</p>

        {/* Where they met it. Reading the original context before writing is
            what stops the sentence coming out as a dictionary definition. */}
        {word.sentence && <p className="drill__seen">{word.sentence}</p>}
      </div>

      {written.length > 0 && (
        <div className="drill__written">
          <p className="eyebrow">{t("activation.alreadyWrote")}</p>
          <ul className="drill__writtenList">
            {written.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="drill__writtenHint">{t("activation.sayNew")}</p>
        </div>
      )}

      {!verdict ? (
        <>
          {pen ? (
            <div className="drill__pad">
              <HandwritingPad rows={3} padRef={(handle) => (pad.current = handle)} onFirstStroke={() => setInked(true)} />
            </div>
          ) : (
          <textarea
            ref={input}
            className="field drill__input"
            rows={3}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder={t("activation.placeholder", { word: word.word })}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          )}

          {!pen && !containsWord && <p className="drill__warn">{t("activation.maybeMissing", { word: word.word })}</p>}

          {hint && hintLevel >= 1 && hint.toTranslate && (
            <div className="drill__hint">
              <p className="eyebrow">{t("activation.hintTranslate")}</p>
              <p className="drill__hintRu">{hint.toTranslate}</p>
            </div>
          )}

          {hint && hintLevel >= 2 && hint.model && (
            <div className="drill__hint drill__hint--model">
              <p className="eyebrow">{t("activation.hintModel")}</p>
              <p className="drill__hintEn">{hint.model}</p>
            </div>
          )}

          {/* What was read, before anything is judged. The text is editable
              rather than merely confirmable, because the commonest correction
              is one word and retyping the sentence to fix it is worse than
              having written it on a keyboard in the first place. */}
          {reading !== null && (
            <div className="drill__reading">
              <p className="eyebrow">{t("input.iRead")}</p>
              <textarea
                className="field drill__readingText"
                rows={2}
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                autoCorrect="off"
                spellCheck={false}
              />
              <div className="drill__readingActions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => void submit(reading)}
                  disabled={!reading.trim() || busy}
                >
                  {busy ? t("activation.checking") : t("input.yesCheck")}
                </button>
                <button
                  type="button"
                  className="btn btn--quiet btn--sm"
                  onClick={() => {
                    setReading(null);
                    pad.current?.clear();
                    setInked(false);
                  }}
                  disabled={busy}
                >
                  {t("input.rewrite")}
                </button>
              </div>
            </div>
          )}

          {readingFailed && <p className="drill__warn">{t("input.unreadable")}</p>}

          <div className="drill__actions">
            {pen ? (
              <button type="button" className="btn btn--primary" onClick={readPad} disabled={!inked || busy}>
                {busy ? t("input.reading") : t("activation.check")}
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => void submit()} disabled={!sentence.trim() || busy}>
                {busy ? t("activation.checking") : t("activation.check")}
              </button>
            )}

            {!pen && hintLevel < 2 && (
              <button type="button" className="btn btn--ghost" onClick={askForHint} disabled={hintBusy}>
                {hintBusy
                  ? t("activation.thinking")
                  : hintLevel === 0
                    ? t("activation.hint1")
                    : t("activation.hint2")}
              </button>
            )}

            {hint && (
              <button type="button" className="btn btn--quiet" onClick={anotherHint} disabled={hintBusy}>
                {t("activation.another")}
              </button>
            )}

            <button type="button" className="btn btn--quiet" onClick={onSkip}>
              {t("activation.skip")}
            </button>
          </div>

          <p className="drill__hintNote">{t("activation.hintNote")}</p>
        </>
      ) : (
        <div className="drill__result">
          {verdict.unavailable ? (
            <p className="drill__offline">{t("activation.offline")}</p>
          ) : (
            <>
              {/* Three states, not two. The word can land in a sentence that
                  still needs work, and saying "not quite" about that tells the
                  learner the one part they got right was the part that failed. */}
              <p
                className={
                  verdict.repeat
                    ? "drill__badge is-partly"
                    : verdict.correct
                      ? verdict.issues.length === 0
                        ? "drill__badge is-good"
                        : "drill__badge is-partly"
                      : "drill__badge is-wrong"
                }
              >
                {verdict.repeat
                  ? t("activation.repeat")
                  : verdict.correct
                    ? verdict.issues.length === 0
                      ? t("activation.perfect")
                      : t("activation.wordOkay")
                    : t("activation.wordWrong")}
              </p>

              <p className="drill__yours">{sentence.trim()}</p>

              {verdict.verdict && <p className="drill__verdict">{verdict.verdict}</p>}

              {verdict.fix && (
                <div className="drill__fix">
                  <p className="eyebrow">{t("activation.fixTitle")}</p>
                  <p className="drill__fixText">{verdict.fix}</p>
                </div>
              )}

              {verdict.issues.length > 0 && (
                <div className="drill__issues">
                  <p className="eyebrow">{t("activation.issuesTitle")}</p>
                  <ul className="drill__notes">
                    {verdict.issues.map((issue) => (
                      <li key={issue.note}>
                        <span className="drill__issueKind">{t(`activation.issueKind.${issue.kind}`)}</span>
                        {issue.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What else the word can do. A word met once in one sentence
                  gets filed as though it had one meaning, and seeing it work
                  somewhere else is what widens it. */}
              {verdict.alternatives.length > 0 && (
                <div className="drill__alts">
                  <p className="eyebrow">{t("activation.alsoTitle")}</p>
                  <ul className="drill__altList">
                    {verdict.alternatives.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="drill__actions">
            <button type="button" className="btn btn--primary" onClick={() => onDone(verdict.correct)}>
              {t("activation.next")}
            </button>
            {(!verdict.correct || verdict.repeat) && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setVerdict(null);
                  input.current?.focus();
                }}
              >
                {t("activation.tryAgain")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
