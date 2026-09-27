import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { explainInEnglish, lookupWord, translateToEnglish } from "@/lib/translate";
import { addVocabularyWord } from "@/lib/vocabularyStore";
import { aiConfigured } from "@/lib/aiClient";
import "./translator.css";

/**
 * The translator that is always there.
 *
 * Every exercise in this app that asks a learner to *produce* English — write
 * a sentence with a new word, answer a dictation, reply in a lesson — has the
 * same failure: they know what they want to say and they are missing one word.
 * At that moment they leave. They open a translator in another tab or on their
 * phone, and a good share of them do not come back to the sentence they were
 * halfway through.
 *
 * So the lookup lives in the corner of every page instead.
 *
 * It answers with four things rather than one, because a bare translation is
 * what sends people back out again: the word, what it means in Russian, what
 * it means in English, and a sentence using it. The example is the part that
 * decides whether the word can actually be used — "выкрутиться" translating to
 * "wriggle out of" is not enough to write a sentence with, and seeing it in
 * one is.
 *
 * There is no history. A list of everything looked up this session is a list
 * nobody reads, and the word worth keeping has a button for that.
 */

interface Result {
  /** The English word, whichever direction it arrived from. */
  word: string;
  ru: string;
  /** English definition. Absent when the model would only be guessing. */
  definition?: string;
  example?: string;
  synonyms?: string[];
}

export function Translator() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  /* Opening it should not also require a click into the field: the only
     reason anyone opens this is to type. */
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  const toggle = useCallback(() => setOpen((was) => !was), []);

  /*
   * Escape closes it, and the shortcut opens it from anywhere.
   *
   * The whole point is not breaking a sentence in progress, so reaching the
   * translator must not cost a trip to the corner of the screen with a mouse.
   */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === "k") {
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

    // Cyrillic anywhere means they are reaching for the English word.
    const fromRussian = /[Ѐ-ӿ]/.test(phrase);

    if (fromRussian) {
      // This one direction already returns the whole set, so it is one call.
      const found = await translateToEnglish(phrase);
      setBusy(false);
      if (found.unavailable || !found.english) {
        setError(true);
        return;
      }
      setResult({
        word: found.english,
        ru: phrase,
        definition: found.note || undefined,
        example: found.example || undefined,
      });
      return;
    }

    /* Going the other way takes two, and they are independent, so they go
       together rather than one after the other — a lookup that takes twice as
       long as it needs to is one people stop using. */
    const [translated, explained] = await Promise.all([
      lookupWord(phrase),
      explainInEnglish(phrase),
    ]);
    setBusy(false);

    if (translated.unavailable && explained.unavailable) {
      setError(true);
      return;
    }

    setResult({
      word: phrase,
      ru: translated.unavailable ? "" : translated.translation,
      definition: explained.unavailable ? undefined : explained.definition,
      example: explained.unavailable ? undefined : explained.example,
      synonyms: explained.synonyms?.length ? explained.synonyms : undefined,
    });
  };

  /* A word looked up mid-sentence is a word being learned, so it can go
     straight onto a card without leaving the page either. */
  const keep = () => {
    if (!result || !result.ru) return;
    addVocabularyWord(result.word, result.ru, t("translator.source"), result.definition);
    setSaved(true);
  };

  const reset = () => {
    setResult(null);
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
          {busy ? "…" : "→"}
        </button>
      </form>

      {error && <p className="tr__error">{t("translator.failed")}</p>}

      {!result && !error && !busy && <p className="tr__hint">{t("translator.hint")}</p>}

      {result && (
        <article className="tr__card">
          <p className="tr__word">{result.word}</p>

          {/* The Russian first: it is what they came for and it is the fastest
              thing to read. Everything under it is the part that makes the word
              usable rather than merely recognised. */}
          {result.ru && <p className="tr__ru">{result.ru}</p>}

          {result.definition && <p className="tr__def">{result.definition}</p>}

          {result.example && (
            <p className="tr__example">
              <span className="tr__exampleLabel">{t("translator.example")}</span>
              {result.example}
            </p>
          )}

          {result.synonyms && (
            <p className="tr__synonyms">
              <span className="tr__exampleLabel">{t("translator.synonyms")}</span>
              {result.synonyms.join(", ")}
            </p>
          )}

          <div className="tr__actions">
            <button
              type="button"
              className={saved ? "tr__save is-saved" : "tr__save"}
              onClick={keep}
              disabled={saved || !result.ru}
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
