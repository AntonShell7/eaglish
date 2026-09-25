import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  explainInEnglish,
  lookupWord,
  translateToRussian,
  type GlossaryLike,
  type WordExplanationResult,
  type WordLookupResult,
} from "@/lib/translate";
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
const MODE_KEY = "lookupMode";

/**
 * Translate, or explain in English.
 *
 * The coursebook this was modelled on never translates: a word is explained in
 * simpler English, so the reader stays inside the language and the explanation
 * is itself practice. That works beautifully at B1 and up and fails badly at
 * A1, where the definition contains more unknown words than the headword. So
 * the choice belongs to the reader, and it sticks between lookups.
 */
type Mode = "ru" | "en";

function storedMode(): Mode {
  return localStorage.getItem(MODE_KEY) === "en" ? "en" : "ru";
}

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
  const [mode, setMode] = useState<Mode>(storedMode);
  const [result, setResult] = useState<WordLookupResult | null>(null);
  const [explanation, setExplanation] = useState<WordExplanationResult | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [sentence, setSentence] = useState<string | null>(null);
  const [band, setBand] = useState<number | null>(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setExplanation(null);
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

  /** English side is fetched lazily: most lookups never ask for it. */
  useEffect(() => {
    if (mode !== "en" || explanation || explaining) return;
    setExplaining(true);
    explainInEnglish(request.word, { sentence: request.sentence }).then((r) => {
      setExplanation(r);
      setExplaining(false);
    });
  }, [mode, explanation, explaining, request.word, request.sentence]);

  const chooseMode = (next: Mode) => {
    localStorage.setItem(MODE_KEY, next);
    setMode(next);
  };

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
  /** Placement, recomputed once the popup's real height is known. */
  const [position, setPosition] = useState({ left: -9999, top: -9999 });

  useLayoutEffect(() => {
    const place = () => {
      const height = ref.current?.offsetHeight ?? 220;
      const margin = 12;
      const maxLeft = Math.max(margin, window.innerWidth - WIDTH - margin);
      const left = Math.min(Math.max(request.anchor.x - WIDTH / 2, margin), maxLeft);

      // Below the word by default; above it when there is no room below.
      const below = request.anchor.y + 14;
      const fitsBelow = below + height + margin <= window.innerHeight;
      const raw = fitsBelow ? below : request.anchor.y - height - 14;
      const maxTop = Math.max(margin, window.innerHeight - height - margin);
      setPosition({ left, top: Math.min(Math.max(raw, margin), maxTop) });
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [request.anchor.x, request.anchor.y, result, explanation, sentence]);

  const handleKnown = () => {
    if (!result) return;
    markKnown(result.word);
    onClose();
  };

  const { left, top } = position;

  /*
   * The popup is placed against the viewport, and it has to stay inside it.
   *
   * It used to be positioned with a single clamp against `window.innerWidth`
   * and rendered inside the page. Both parts were wrong. `position: fixed`
   * resolves against the nearest transformed ancestor rather than the viewport,
   * and the page wrapper animates a transform on every navigation — so the
   * popup's coordinates were measured from one box and applied to another, and
   * a word near the top of a text opened its popup off-screen, above and to the
   * left of everything. Tapping a word is the whole app; it cannot be a coin
   * toss whether the answer lands somewhere reachable.
   *
   * So: a portal to <body>, escaping any ancestor that could capture it, and
   * the real measured height used to decide whether the popup hangs below the
   * word or flips above it.
   */
  return createPortal(
    <div
      ref={ref}
      className="fixed z-[60] rounded-2xl border p-4 backdrop-blur-xl lookup-pop"
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

          <div
            className="mt-2 flex rounded-full border p-0.5 text-[11px] font-bold"
            style={{ borderColor: "var(--color-border)" }}
          >
            {(["ru", "en"] as Mode[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseMode(option)}
                className="flex-1 rounded-full px-2 py-1"
                style={{
                  background: mode === option ? "var(--color-primary)" : "transparent",
                  color: mode === option ? "var(--color-on-primary)" : "var(--color-text-muted)",
                }}
              >
                {t(`lookup.mode.${option}`)}
              </button>
            ))}
          </div>

          {mode === "ru" ? (
            <p
              className="mt-2 text-sm"
              style={{ color: result.unavailable ? "var(--color-text-muted)" : "var(--color-text)" }}
            >
              {result.unavailable
                ? t(result.unavailable === "no-key" ? "lookup.noKey" : "lookup.failed")
                : result.translation}
            </p>
          ) : (
            <div className="mt-2 text-sm">
              {!explanation ? (
                <p style={{ color: "var(--color-text-muted)" }}>{t("common.loading")}</p>
              ) : explanation.unavailable ? (
                <p style={{ color: "var(--color-text-muted)" }}>
                  {t(explanation.unavailable === "no-key" ? "lookup.noKey" : "lookup.failed")}
                </p>
              ) : (
                <>
                  <p className="leading-relaxed">{explanation.definition}</p>
                  {explanation.example && (
                    <p className="mt-2 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
                      “{explanation.example}”
                    </p>
                  )}
                  {explanation.synonyms && explanation.synonyms.length > 0 && (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      ≈ {explanation.synonyms.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

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
    </div>,
    document.body,
  );
}