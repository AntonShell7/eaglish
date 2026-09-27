import { useState } from "react";
import { useTranslation } from "react-i18next";
import { checkSentences, type PracticeFeedback } from "@/lib/wordPractice";
import { aiConfigured } from "@/lib/aiClient";
import { lookupWord } from "@/lib/translate";
import "./word-practice.css";

export interface PracticeWord {
  word: string;
  /** Known up front where a glossary exists; looked up on demand otherwise. */
  translation?: string;
}

/**
 * "Now use them."
 *
 * Offered after the work is already finished and counted, and worded as an
 * invitation. The moment this becomes the thing standing between a learner and
 * a completed text, it stops being practice and becomes a toll.
 *
 * It asks for separate sentences rather than a retelling, and the difference
 * matters: a summary makes the text the subject and the words incidental, so
 * people write around the hard ones. A sentence built for one word has nowhere
 * to hide.
 */
export function WordPractice({ context, words }: { context: string; words: PracticeWord[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Translations revealed by tapping, plus any that arrived from a lookup. */
  const [shown, setShown] = useState<Record<string, string>>({});

  if (words.length === 0 || !aiConfigured()) return null;

  const reveal = async (entry: PracticeWord) => {
    if (shown[entry.word]) {
      setShown(({ [entry.word]: _drop, ...rest }) => rest);
      return;
    }
    if (entry.translation) {
      setShown((s) => ({ ...s, [entry.word]: entry.translation as string }));
      return;
    }
    // Dictation has no glossary, so the translation is fetched the first time
    // somebody actually asks for it rather than for every word up front.
    setShown((s) => ({ ...s, [entry.word]: "…" }));
    const found = await lookupWord(entry.word);
    setShown((s) => ({ ...s, [entry.word]: found.translation || t("practice.noTranslation") }));
  };

  const send = async () => {
    setBusy(true);
    setError(null);
    const result = await checkSentences(context, words.map((w) => w.word), text.trim());
    setBusy(false);
    if (result.ok) setFeedback(result.feedback);
    else setError(t(`practice.error.${result.reason}`));
  };

  if (!open) {
    return (
      <section className="wp wp--invite">
        <p className="wp__title">{t("practice.inviteTitle")}</p>
        <p className="wp__body">{t("practice.inviteBody")}</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)}>
          {t("practice.start")}
        </button>
      </section>
    );
  }

  return (
    <section className="wp">
      <p className="wp__title">{t("practice.taskTitle")}</p>
      <p className="wp__body">{t("practice.taskBody")}</p>

      {/* Tapping a chip shows the meaning again. Forgetting a word ninety
          seconds after meeting it is the normal case, not a failure, and
          making someone scroll back up to check is how an exercise gets
          abandoned. */}
      <ul className="wp__words">
        {words.map((entry) => {
          const verdict = feedback?.words.find((w) => w.word === entry.word);
          return (
            <li key={entry.word}>
              <button
                type="button"
                className={verdict ? `wp__word is-${verdict.status}` : "wp__word"}
                onClick={() => reveal(entry)}
                title={t("practice.tapForMeaning")}
              >
                {entry.word}
                {shown[entry.word] && <span className="wp__gloss">{shown[entry.word]}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <textarea
        className="field wp__input"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("practice.placeholder")}
        disabled={busy}
      />

      {!feedback && (
        <div className="wp__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={send}
            disabled={busy || text.trim().length < 15}
          >
            {busy ? t("practice.checking") : t("practice.check")}
          </button>
          <span className="wp__hint">{t("practice.optional")}</span>
        </div>
      )}

      {error && <p className="wp__error">{error}</p>}

      {feedback && (
        <div className="wp__feedback">
          {feedback.summary && <p className="wp__summary">{feedback.summary}</p>}

          {/* Words first, and separately from grammar: using a word correctly
              inside a sentence with a slipped tense is a success with a small
              repair, and merging the two would hide that. */}
          <ul className="wp__verdicts">
            {feedback.words.map((w) => (
              <li key={w.word} className={`wp__verdict is-${w.status}`}>
                <span className="wp__verdictWord">{w.word}</span>
                <span className="wp__verdictNote">{w.note || t(`practice.status.${w.status}`)}</span>
              </li>
            ))}
          </ul>

          {feedback.grammar.length > 0 && (
            <div className="wp__notes">
              <p className="wp__notesTitle">{t("practice.grammar")}</p>
              {feedback.grammar.map((note, i) => (
                <p key={i} className="wp__note">
                  <s>{note.quote}</s> → <b>{note.fix}</b>
                  <span className="wp__why">{note.why}</span>
                </p>
              ))}
            </div>
          )}

          {feedback.style && (
            <div className="wp__notes">
              <p className="wp__notesTitle">{t("practice.style")}</p>
              <p className="wp__note">
                <b>{feedback.style.fix}</b>
                <span className="wp__why">{feedback.style.why}</span>
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
            {t("practice.again")}
          </button>
        </div>
      )}
    </section>
  );
}
