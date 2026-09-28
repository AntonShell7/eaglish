import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { translatorEntry, type TranslatorEntry } from "@/lib/translate";
import { addVocabularyWord } from "@/lib/vocabularyStore";
import { aiConfigured } from "@/lib/aiClient";
import "./translator.css";

/**
 * The translator that is always there.
 *
 * Every exercise in this app that asks a learner to produce English has the
 * same failure: they know what they want to say and are missing one word. At
 * that moment they leave — another tab, or their phone — and a good share do
 * not come back to the sentence they were halfway through. So the lookup lives
 * in the corner of every page instead.
 *
 * It shows every sense a word has, not the first one. That is the whole
 * difference between this and the popup in a reading text: a reader tapping a
 * word has a sentence around it and wants one answer, while somebody typing
 * here has no context and usually does not know the word has more than one
 * meaning. "date" is дата, and it is also свидание and финик, and a learner
 * given only the first writes about a calendar when they meant dinner.
 */

export function Translator() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [entry, setEntry] = useState<TranslatorEntry | null>(null);
  const [saved, setSaved] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  /* Opening it should not also require a click into the field: the only
     reason anyone opens this is to type. */
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  const toggle = useCallback(() => setOpen((was) => !was), []);

  /* Escape closes it, and the shortcut opens it from anywhere — the point is
     not breaking a sentence in progress, so reaching it must not cost a trip
     to the corner of the screen with a mouse. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggle]);

  if (!aiConfigured()) return null;

  const run = async () => {
    const phrase = text.trim();
    if (!phrase || busy) return;

    setBusy(true);
    setError(false);
    setSaved(false);

    const found = await translatorEntry(phrase);
    setBusy(false);

    if (found.unavailable || !found.primary) {
      setError(true);
      setEntry(null);
      return;
    }
    setEntry(found);
  };

  /* A word looked up mid-sentence is a word being learned, so it can go
     straight onto a card without leaving the page. The first sense goes on the
     back — the others are here to prevent a mistake, not to be memorised. */
  const keep = () => {
    if (!entry) return;
    addVocabularyWord(entry.english, entry.russian, t("translator.source"), entry.definition);
    setSaved(true);
  };

  const reset = () => {
    setEntry(null);
    setError(false);
    setText("");
    field.current?.focus();
  };

  if (!open) {
    return (
      <button
        type="button"
        className="tr-tab"
        onClick={toggle}
        title={t("translator.shortcut")}
        aria-label={t("translator.open")}
      >
        <span className="tr-tab__mark" aria-hidden>
          A<span className="tr-tab__ru">я</span>
        </span>
        <span className="tr-tab__label">{t("translator.open")}</span>
      </button>
    );
  }

  return (
    <section className="tr" role="dialog" aria-label={t("translator.open")}>
      <header className="tr__top">
        <p className="tr__title">{t("translator.open")}</p>
        <button
          type="button"
          className="tr__close"
          onClick={() => setOpen(false)}
          aria-label={t("common.close")}
        >
          ✕
        </button>
      </header>

      <form
        className="tr__form"
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <input
          ref={field}
          className="tr__field"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t("translator.placeholder")}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="tr__go" disabled={busy || !text.trim()}>
          {busy ? <span className="tr__spin" aria-hidden /> : "→"}
        </button>
      </form>

      {error && <p className="tr__error">{t("translator.failed")}</p>}

      {entry && (
        <article className="tr__card">
          <p className="tr__word">
            {entry.source}
            {entry.partOfSpeech && <span className="tr__pos">{entry.partOfSpeech}</span>}
          </p>

          {/* Every sense, in order. The first is the answer; the rest are here
              so that nobody confidently uses the wrong one. */}
          <ol className="tr__senses">
            <li className="tr__sense is-primary">{entry.primary}</li>
            {entry.alternatives.map((sense) => (
              <li key={sense} className="tr__sense">
                {sense}
              </li>
            ))}
          </ol>

          {entry.definition && <p className="tr__def">{entry.definition}</p>}

          {entry.example && (
            <p className="tr__example">
              <span className="tr__label">{t("translator.example")}</span>
              {entry.example}
            </p>
          )}

          <div className="tr__actions">
            <button
              type="button"
              className={saved ? "tr__save is-saved" : "tr__save"}
              onClick={keep}
              disabled={saved}
            >
              {saved ? t("translator.saved") : t("translator.keep")}
            </button>
            <button type="button" className="tr__again" onClick={reset}>
              {t("translator.another")}
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
