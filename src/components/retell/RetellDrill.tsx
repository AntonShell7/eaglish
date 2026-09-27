import { useState } from "react";
import { useTranslation } from "react-i18next";
import { checkRetelling, type RetellFeedback } from "@/lib/retell";
import { aiConfigured } from "@/lib/aiClient";
import "./retell.css";

/**
 * "Now tell me what you just read."
 *
 * Offered after the work is already finished and counted, and worded as an
 * invitation rather than a next step. That is deliberate: the moment this
 * becomes the thing standing between a learner and a completed text, it stops
 * being writing practice and becomes a toll.
 *
 * The words are shown because the point is not a summary — it is putting the
 * new vocabulary through the one direction the rest of the app never
 * exercises. Recognising a word is not the same as reaching for it.
 */
export function RetellDrill({ title, words }: { title: string; words: string[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<RetellFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (words.length === 0 || !aiConfigured()) return null;

  const send = async () => {
    setBusy(true);
    setError(null);
    const result = await checkRetelling(title, words, text.trim());
    setBusy(false);
    if (result.ok) setFeedback(result.feedback);
    else setError(t(`retell.error.${result.reason}`));
  };

  if (!open) {
    return (
      <section className="rt rt--invite">
        <p className="rt__title">{t("retell.inviteTitle")}</p>
        <p className="rt__body">{t("retell.inviteBody")}</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)}>
          {t("retell.start")}
        </button>
      </section>
    );
  }

  return (
    <section className="rt">
      <p className="rt__title">{t("retell.taskTitle")}</p>
      <p className="rt__body">{t("retell.taskBody")}</p>

      <ul className="rt__words">
        {words.map((word) => {
          const verdict = feedback?.words.find((w) => w.word === word);
          return (
            <li key={word} className={verdict ? `rt__word is-${verdict.status}` : "rt__word"}>
              {word}
            </li>
          );
        })}
      </ul>

      <textarea
        className="field rt__input"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("retell.placeholder")}
        disabled={busy}
      />

      {!feedback && (
        <div className="rt__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={send}
            disabled={busy || text.trim().length < 20}
          >
            {busy ? t("retell.checking") : t("retell.check")}
          </button>
          <span className="rt__hint">{t("retell.optional")}</span>
        </div>
      )}

      {error && <p className="rt__error">{error}</p>}

      {feedback && (
        <div className="rt__feedback">
          {feedback.summary && <p className="rt__summary">{feedback.summary}</p>}

          {/* Words first, and separately from grammar: using a word correctly
              inside a sentence with a slipped tense is a success with a small
              repair, and merging the two would hide that. */}
          <ul className="rt__verdicts">
            {feedback.words.map((w) => (
              <li key={w.word} className={`rt__verdict is-${w.status}`}>
                <span className="rt__verdictWord">{w.word}</span>
                <span className="rt__verdictNote">{w.note || t(`retell.status.${w.status}`)}</span>
              </li>
            ))}
          </ul>

          {feedback.grammar.length > 0 && (
            <div className="rt__notes">
              <p className="rt__notesTitle">{t("retell.grammar")}</p>
              {feedback.grammar.map((note, i) => (
                <p key={i} className="rt__note">
                  <s>{note.quote}</s> → <b>{note.fix}</b>
                  <span className="rt__why">{note.why}</span>
                </p>
              ))}
            </div>
          )}

          {feedback.style && (
            <div className="rt__notes">
              <p className="rt__notesTitle">{t("retell.style")}</p>
              <p className="rt__note">
                <b>{feedback.style.fix}</b>
                <span className="rt__why">{feedback.style.why}</span>
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn btn--quiet btn--sm"
            onClick={() => {
              setFeedback(null);
              setError(null);
            }}
          >
            {t("retell.again")}
          </button>
        </div>
      )}
    </section>
  );
}
