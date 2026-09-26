import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkSentence, getHint, markActivated, type Hint, type UsageVerdict } from "@/lib/activation";
import { reviewWord, type VocabularyWord } from "@/lib/vocabularyStore";
import { usesWord } from "@/lib/wordMatch";
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

  useEffect(() => {
    setSentence("");
    setVerdict(null);
    setHint(null);
    setHintLevel(0);
    input.current?.focus();
  }, [word.id]);

  const askForHint = async () => {
    // The first press reveals the Russian sentence, the second the model one.
    // Both arrive in a single call, so pressing twice costs nothing extra.
    if (hint) {
      setHintLevel((level) => Math.min(2, level + 1));
      return;
    }
    setHintBusy(true);
    const got = await getHint(word);
    setHint(got);
    setHintLevel(1);
    setHintBusy(false);
  };

  const submit = async () => {
    const text = sentence.trim();
    if (!text || busy) return;

    setBusy(true);
    const result = await checkSentence(word, text);
    setVerdict(result);
    setBusy(false);

    if (result.correct) {
      markActivated(word.word, text);
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
        <p className="eyebrow">{t("activation.useThis")}</p>

        <p className="drill__word">{word.word}</p>
        <p className="drill__translation">{word.translation}</p>

        {/* Where they met it. Reading the original context before writing is
            what stops the sentence coming out as a dictionary definition. */}
        {word.sentence && <p className="drill__seen">{word.sentence}</p>}
      </div>

      {!verdict ? (
        <>
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

          {!containsWord && <p className="drill__warn">{t("activation.maybeMissing", { word: word.word })}</p>}

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

          <div className="drill__actions">
            <button type="button" className="btn btn--primary" onClick={submit} disabled={!sentence.trim() || busy}>
              {busy ? t("activation.checking") : t("activation.check")}
            </button>

            {hintLevel < 2 && (
              <button type="button" className="btn btn--ghost" onClick={askForHint} disabled={hintBusy}>
                {hintBusy
                  ? t("activation.thinking")
                  : hintLevel === 0
                    ? t("activation.hint1")
                    : t("activation.hint2")}
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
              <p className={verdict.correct ? "drill__badge is-good" : "drill__badge"}>
                {verdict.correct ? t("activation.good") : t("activation.notYet")}
              </p>

              <p className="drill__yours">{sentence.trim()}</p>

              {verdict.verdict && <p className="drill__verdict">{verdict.verdict}</p>}

              {verdict.fix && (
                <div className="drill__fix">
                  <p className="eyebrow">{t("activation.fixTitle")}</p>
                  <p className="drill__fixText">{verdict.fix}</p>
                </div>
              )}

              {verdict.notes.length > 0 && (
                <ul className="drill__notes">
                  {verdict.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
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
            {!verdict.correct && (
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
