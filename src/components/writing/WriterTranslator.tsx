import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { translateToEnglish, type Unavailable } from "@/lib/translate";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { logActivity } from "@/lib/activityStore";

interface Result {
  english: string;
  note: string;
  example: string;
  unavailable?: Unavailable;
}

/**
 * A Russian → English lookup that sits beside the editor.
 *
 * This is the direction a writer actually gets stuck in: the idea is there in
 * their own language and the English is missing. Answering it in place — with a
 * usage note and an example rather than a bare equivalent — keeps them writing,
 * and the word they needed goes straight into the review queue, which is where
 * words learned under real pressure tend to stick.
 */
export function WriterTranslator({ source }: { source: string }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const phrase = query.trim();
    if (!phrase) return;

    setLoading(true);
    setResult(null);
    setSaved(false);

    const res = await translateToEnglish(phrase);
    setResult(res);
    if (res.english && isWordSaved(res.english)) setSaved(true);
    setLoading(false);
  };

  const save = () => {
    if (!result?.english) return;
    // Stored English-first with the learner's own phrase as the meaning, so the
    // flashcard tests the direction they were weak in.
    addVocabularyWord(result.english, query.trim(), source);
    logActivity("vocabulary");
    setSaved(true);
  };

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <p className="page-title text-base">{t("writing.translatorTitle")}</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {t("writing.translatorHint")}
      </p>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("writing.translatorPlaceholder")}
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-full px-4 py-2 text-sm font-semibold on-primary disabled:opacity-40"
          style={{ background: "var(--color-primary)" }}
        >
          {loading ? "…" : t("writing.translatorGo")}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          {result.unavailable ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t(result.unavailable === "no-key" ? "lookup.noKey" : "lookup.failed")}
            </p>
          ) : (
            <>
              <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                {result.english}
              </p>

              {result.note && (
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {result.note}
                </p>
              )}

              {result.example && (
                <p
                  className="mt-2 border-l-2 pl-2 text-xs italic leading-relaxed"
                  style={{ borderColor: "var(--color-accent)", color: "var(--color-text-muted)" }}
                >
                  {result.example}
                </p>
              )}

              <button
                type="button"
                onClick={save}
                disabled={saved}
                className="mt-3 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                style={{
                  borderColor: saved ? "var(--color-success)" : "var(--color-border)",
                  color: saved ? "var(--color-success)" : "var(--color-text)",
                }}
              >
                {saved ? `✓ ${t("lookup.inVocabulary")}` : t("common.addToVocabulary")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
