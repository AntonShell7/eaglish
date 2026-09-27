import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateToEnglish, translateToRussian } from "@/lib/translate";
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
 * So the lookup lives in the corner of every page instead. It is deliberately
 * small: a tab you can ignore, one field, an answer, and a button to keep the
 * word. Nothing about it competes with the exercise underneath.
 *
 * Direction is guessed from what was typed rather than asked for, because
 * asking is a decision the learner should not have to make mid-sentence, and
 * the guess is close to free: Cyrillic in, English out.
 */

const HISTORY = 6;

interface Entry {
  from: string;
  to: string;
  toRu: boolean;
}

export function Translator() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const field = useRef<HTMLInputElement>(null);

  /* Opening it should not also require a click into the field: the only
     reason anyone opens this is to type. */
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  /*
   * Escape closes it, and the shortcut opens it from anywhere.
   *
   * The whole point is not breaking a sentence in progress, so reaching the
   * translator must not cost a trip to the corner of the screen with a mouse.
   */
  const toggle = useCallback(() => setOpen((was) => !was), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      // Not while the learner is typing into something else, unless they
      // asked for it with the modifier.
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

    // Cyrillic anywhere means they are reaching for the English word.
    const wantsEnglish = /[Ѐ-ӿ]/.test(phrase);
    /* The two directions do not share a return shape, and neither reports
       failure by throwing: they answer with `unavailable` set and a placeholder
       string, so the check is on that rather than on a rejected promise. */
    let answer: string;
    let failed: boolean;
    if (wantsEnglish) {
      const result = await translateToEnglish(phrase);
      answer = result.english;
      failed = Boolean(result.unavailable) || !result.english;
    } else {
      const result = await translateToRussian(phrase);
      answer = result.translation;
      failed = Boolean(result.unavailable) || !result.translation;
    }

    setBusy(false);

    if (failed) {
      setError(true);
      return;
    }

    setEntries((prev) =>
      [{ from: phrase, to: answer, toRu: !wantsEnglish }, ...prev].slice(0, HISTORY),
    );
    setText("");
    field.current?.focus();
  };

  /* A word looked up mid-sentence is a word being learned, so it can go
     straight onto a card without leaving the page either. */
  const keep = (entry: Entry) => {
    const english = entry.toRu ? entry.from : entry.to;
    const russian = entry.toRu ? entry.to : entry.from;
    addVocabularyWord(english, russian, t("translator.source"));
    setSaved((prev) => new Set(prev).add(english));
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

      {entries.length === 0 && !error && <p className="tr__hint">{t("translator.hint")}</p>}

      <ul className="tr__list">
        {entries.map((entry, i) => {
          const english = entry.toRu ? entry.from : entry.to;
          const kept = saved.has(english);
          return (
            <li key={`${entry.from}-${i}`} className="tr__entry">
              <div className="tr__pair">
                <span className="tr__from">{entry.from}</span>
                <span className="tr__to">{entry.to}</span>
              </div>
              <button
                type="button"
                className={kept ? "tr__keep is-kept" : "tr__keep"}
                onClick={() => keep(entry)}
                disabled={kept}
                title={t("translator.keep")}
              >
                {kept ? "✓" : "+"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
