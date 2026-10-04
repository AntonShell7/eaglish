import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { addVocabularyBatch, isWordSaved, BATCH_SIZE } from "@/lib/vocabularyStore";
import { lookupWord } from "@/lib/translate";
import "./bulk-add.css";

/**
 * A whole list of words at once.
 *
 * This is the entry point for the case the product was missing: somebody is
 * given twenty words to learn — a homework list, a chapter glossary, words off
 * a whiteboard — and they have no connection to anything the learner has read.
 * They are a *set*, and they arrive together.
 *
 * Adding them one at a time through a two-field form is twenty forms, and
 * nobody does that twice. So this takes the list however it was copied, which
 * in practice is one of four shapes:
 *
 *   word — translation        a list someone typed out properly
 *   word - translation        the same, with a plain hyphen
 *   word: translation         the same again
 *   word                      no translation, because the task was to find them
 *
 * A line with no translation is not an error. Those are looked up, which is
 * the most useful thing the app can do with a bare list and the reason to
 * paste it here rather than into a notes app.
 *
 * The set gets its own folder, named by the learner or after today, because
 * the one thing that makes these twenty words a set is that they came in
 * together — and losing that grouping loses the only thing they have in common.
 */

interface Parsed {
  word: string;
  translation: string;
  /** No translation given; the model will be asked for one. */
  lookup: boolean;
  duplicate: boolean;
}

/** `—`, `–`, `-`, `:` and tab, which is what a copied table column arrives as. */
const SPLIT = /\s[—–-]\s|\t|\s{2,}|:\s/;

function parse(raw: string): Parsed[] {
  const out: Parsed[] = [];
  const seen = new Set<string>();

  for (const line of raw.split(/[\n;]/)) {
    const text = line.trim().replace(/^[\d]+[.)]\s*/, ""); // "1. word" from a numbered list
    if (!text) continue;

    const at = text.search(SPLIT);
    const word = (at === -1 ? text : text.slice(0, at)).trim();
    const translation = at === -1 ? "" : text.slice(at).replace(SPLIT, "").trim();
    if (!word) continue;

    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ word, translation, lookup: !translation, duplicate: isWordSaved(word) });
  }
  return out;
}

export function BulkAdd({ onAdded }: { onAdded: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [folder, setFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const parsed = useMemo(() => parse(raw), [raw]);
  const fresh = parsed.filter((p) => !p.duplicate);
  const needLookup = fresh.filter((p) => p.lookup).length;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (fresh.length === 0 || busy) return;
    setBusy(true);

    /* Translations are fetched one at a time rather than all at once. Twenty
       simultaneous requests is twenty times the burst for no gain — nobody is
       reading them as they land — and a serial queue degrades into "some words
       have translations" instead of into twenty timeouts. A word whose lookup
       fails is still saved: an untranslated word in your list is a word you can
       fix, and a word that silently did not save is a word you lost. */
    const entries: { word: string; translation: string }[] = [];
    for (const item of fresh) {
      if (!item.lookup) {
        entries.push({ word: item.word, translation: item.translation });
        continue;
      }
      try {
        const found = await lookupWord(item.word);
        entries.push({ word: item.word, translation: found.translation || "—" });
      } catch {
        entries.push({ word: item.word, translation: "—" });
      }
    }

    addVocabularyBatch(entries, folder.trim() || undefined);
    setBusy(false);
    setDone(entries.length);
    setRaw("");
    setFolder("");
    onAdded();
  };

  if (!open) {
    return (
      <button type="button" className="ba__open" onClick={() => setOpen(true)}>
        {t("bulk.open")}
      </button>
    );
  }

  if (done !== null) {
    return (
      <div className="ba ba--done">
        <p className="ba__doneLine">{t("bulk.saved", { count: done })}</p>
        <div className="ba__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDone(null)}>
            {t("bulk.more")}
          </button>
          <button
            type="button"
            className="btn btn--quiet btn--sm"
            onClick={() => {
              setDone(null);
              setOpen(false);
            }}
          >
            {t("bulk.close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="ba" onSubmit={submit}>
      <p className="ba__title">{t("bulk.title")}</p>
      <p className="ba__hint">{t("bulk.hint")}</p>

      <textarea
        className="field ba__input"
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={t("bulk.placeholder")}
        disabled={busy}
        autoFocus
      />

      {/* What the app understood, before anything is saved. A paste that was
          split wrongly is obvious here and invisible after the fact. */}
      {parsed.length > 0 && (
        <div className="ba__preview">
          <p className="ba__count">
            {t("bulk.found", { count: fresh.length })}
            {parsed.length !== fresh.length && ` · ${t("bulk.already", { count: parsed.length - fresh.length })}`}
            {needLookup > 0 && ` · ${t("bulk.willLookUp", { count: needLookup })}`}
          </p>
          <ul className="ba__rows">
            {parsed.slice(0, 8).map((item) => (
              <li key={item.word} className={item.duplicate ? "ba__row is-dupe" : "ba__row"}>
                <span className="ba__word">{item.word}</span>
                <span className="ba__tr">
                  {item.duplicate ? t("bulk.alreadyOne") : item.translation || t("bulk.willFind")}
                </span>
              </li>
            ))}
            {parsed.length > 8 && <li className="ba__more">{t("bulk.andMore", { count: parsed.length - 8 })}</li>}
          </ul>
        </div>
      )}

      {/* Naming is optional. A set saved without a name gets today's date,
          which is the thing the learner will actually recognise later. */}
      {fresh.length >= BATCH_SIZE && (
        <input
          type="text"
          className="field ba__folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder={t("bulk.folderPlaceholder")}
          disabled={busy}
        />
      )}

      <div className="ba__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy || fresh.length === 0}>
          {busy ? t("bulk.saving") : t("bulk.save", { count: fresh.length })}
        </button>
        <button
          type="button"
          className="btn btn--quiet btn--sm"
          onClick={() => {
            setOpen(false);
            setRaw("");
          }}
          disabled={busy}
        >
          {t("bulk.cancel")}
        </button>
      </div>
    </form>
  );
}
