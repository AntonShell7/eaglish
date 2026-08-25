import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { lookupWord, translateToRussian, type GlossaryLike, type WordLookupResult } from "@/lib/translate";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { markKnown } from "@/lib/knownWords";
import { bandOf, ensureLexicon } from "@/lib/lexicon";

export interface LookupRequest {
  word: string;
  /** Surrounding sentence, used as context and for the sentence translation. */
  sentence?: string;
  /** Pre-translated sentence, so a curated text costs nothing. */
  knownSentenceTranslation?: string;
  glossary?: GlossaryLike;
  /** Where the word was found, shown later in the vocabulary list. */
  source?: string;
  anchor: { x: number; y: number };
}

const WIDTH = 288;

/**
 * The one word-lookup surface, used from every page: reading texts, the writing
 * editor, the slang cards, or any text the learner selects.
 *
 * Keeping it in one component is what makes "save a word anywhere" consistent —
 * the same context, the same save behaviour, and the same refusal to save a
 * failed lookup.
 */
export function LookupPopup({ request, onClose }: { request: LookupRequest; onClose: () => void }) {
  const { t } = useTranslation();
  const [result, setResult] = useState<WordLookupResult | null>(null);
  const [sentence, setSentence] = useState<string | null>(null);
  const [band, setBand] = useState<number | null>(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setSentence(null);
    setSaved(false);

    ensureLexicon().then(() => setBand(bandOf(request.word)));
    lookupWord(request.word, { sentence: request.sentence, glossary: request.glossary }).then((r) => {
      if (cancelled) return;
      setResult(r);
      // Surface "already in your vocabulary" rather than letting the learner
      // add the same word twice and wonder why nothing changed.
      if (isWordSaved(r.word)) setSaved(true);
    });

    return () => {
      cancelled = true;
    };
  }, [request.word, request.sentence, request.glossary]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleSentence = async () => {
    if (!request.sentence) return;
    if (sentence) {
      setSentence(null);
      return;
    }
    setSentenceLoading(true);
    const res = await translateToRussian(request.sentence, { known: request.knownSentenceTranslation });
    setSentence(
      res.unavailable ? t(res.unavailable === "no-key" ? "lookup.noKey" : "lookup.failed") : res.translation,
    );
    setSentenceLoading(false);
  };

  const handleSave = () => {
    if (!result || result.unavailable) return;
    // The sentence travels with the word: it is what makes a real recall test
    // possible when this word comes back for review.
    addVocabularyWord(result.word, result.translation, request.source, request.sentence);
    setSaved(true);
    setTimeout(onClose, 450);
  };

  /**
   * "I already know this" is the most valuable tap in the app: one word of
   * ground truth beats a whole level's worth of assumption, and it keeps the
   * review queue free of words that were never a problem.
   */
  const handleKnown = () => {
    if (!result) return;
    markKnown(result.word);
    onClose();
  };

  const left = Math.min(Math.max(request.anchor.x - WIDTH / 2, 12), window.innerWidth - WIDTH - 12);
  const top = Math.min(request.anchor.y + 14, window.innerHeight - 190);

  return (
    <div
      ref={ref}
      className="fixed z-[60] rounded-2xl border p-4 backdrop-blur-xl"
      style={{
        left,
        top,
        width: WIDTH,
        background: "color-mix(in srgb, var(--color-surface) 94%, transparent)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-soft-lg)",
      }}
      role="dialog"
    >
      {!result ? (
        <div className="flex items-center gap-2 py-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--color-primary)" }} />
          {t("common.loading")}
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{result.word}</p>
            <span className="flex items-center gap-2">
              {/* How common the word is — the difference between a word worth
                  learning and one worth ignoring. */}
              {band !== null && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: band === 0 ? "var(--color-surface-2)" : "var(--color-primary-soft)",
                    color: band === 0 ? "var(--color-text-muted)" : "var(--color-primary)",
                  }}
                  title={t("lookup.bandHint")}
                >
                  {band === 0 ? t("lookup.bandRare") : t("lookup.bandTop", { count: band * 1000 })}
                </span>
              )}
              {result.partOfSpeech && (
                <span className="text-[11px] italic" style={{ color: "var(--color-text-muted)" }}>
                  {result.partOfSpeech}
                </span>
              )}
            </span>
          </div>

          <p className="mt-1 text-sm" style={{ color: result.unavailable ? "var(--color-text-muted)" : "var(--color-text)" }}>
            {result.unavailable ? t(result.unavailable === "no-key" ? "lookup.noKey" : "lookup.failed") : result.translation}
          </p>

          {sentence && (
            <p
              className="mt-3 border-l-2 pl-2 text-xs leading-relaxed"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-text-muted)" }}
            >
              {sentence}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {request.sentence && (
              <button
                type="button"
                onClick={handleSentence}
                className="rounded-full border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: "var(--color-border)" }}
              >
                {sentenceLoading ? t("common.loading") : t("common.translateSentence")}
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saved || Boolean(result.unavailable)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold on-primary disabled:opacity-50"
              style={{ background: saved ? "var(--color-success)" : "var(--color-primary)" }}
            >
              {saved ? `✓ ${t("lookup.inVocabulary")}` : t("common.addToVocabulary")}
            </button>

            <button
              type="button"
              onClick={handleKnown}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            >
              {t("lookup.alreadyKnow")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
