import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { explainWord, translatorEntry, type TranslatorEntry } from "@/lib/translate";
import { TranslateMark } from "./TranslateMark";
import { addVocabularyWord } from "@/lib/vocabularyStore";
import { aiConfigured } from "@/lib/aiClient";
import "./translator.css";
import { SpeakButton } from "@/components/ui/SpeakButton";

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
  /* The explanation is a second question, asked only when somebody asks it:
     most lookups do not need one, and a paragraph fetched for every "table"
     would make the common case slow for the sake of the rare one. */
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
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
    setExplanation(null);

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

  const explain = async () => {
    if (!entry || explaining) return;
    setExplaining(true);
    const result = await explainWord(entry.source);
    setExplaining(false);
    setExplanation(result.text || t("translator.failed"));
  };

  const reset = () => {
    setEntry(null);
    setError(false);
    setExplanation(null);
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
        <TranslateMark className="tr-tab__mark" />
        <span className="tr-tab__label">{t("translator.open")}</span>
      </button>
    );
  }

  return (
    <section className="tr" role="dialog" aria-label={t("translator.open")}>
      <header className="tr__top">
        <p className="tr__title">
          <TranslateMark className="tr__titleMark" />
          {t("translator.open")}
        </p>
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

      {/* Two boxes, the way every translator a person has used is laid out:
          what you typed, and what it means. The answer used to arrive as a
          card of labelled rows under the field, which reads as a dictionary
          entry rather than as the other half of a pair — and left the panel
          looking like a search box with notes attached. */}
      {entry && (
        <article className="tr__out">
          <p className="tr__outLabel">{t("translator.result")}</p>
          <p className="tr__outTop">
            <span className="tr__outWord">{entry.source}</span>
            {entry.partOfSpeech && <span className="tr__pos">{entry.partOfSpeech}</span>}
            {entry.english && <SpeakButton text={entry.english} />}
          </p>

          <p className="tr__primary">
            {entry.primary}
            {/* Two or three words saying what an opaque answer is. */}
            {entry.note && <span className="tr__note"> ({entry.note})</span>}
          </p>

          {/* The other senses, when the word really has them. They exist to
              stop somebody confidently using the wrong one. */}
          {entry.alternatives.length > 0 && (
            <p className="tr__alts">{entry.alternatives.join(" · ")}</p>
          )}

          {entry.definition && <p className="tr__def">{entry.definition}</p>}

          {entry.example && <p className="tr__example">{entry.example}</p>}

          {explanation && <p className="tr__explain">{explanation}</p>}

          <div className="tr__actions">
            <button
              type="button"
              className={saved ? "tr__save is-saved" : "tr__save"}
              onClick={keep}
              disabled={saved}
            >
              {saved ? t("translator.saved") : t("translator.keep")}
            </button>
            {!explanation && (
              <button type="button" className="tr__again" onClick={explain} disabled={explaining}>
                {explaining ? t("translator.explaining") : t("translator.explain")}
              </button>
            )}
            <button type="button" className="tr__again" onClick={reset}>
              {t("translator.another")}
            </button>
          </div>
        </article>
      )}

    </section>
  );
}
