import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { lookupWord, translateSentence, type WordLookupResult } from "@/lib/translate";
import { addVocabularyWord } from "@/lib/vocabularyStore";
import { logActivity } from "@/lib/activityStore";

interface WordPopupProps {
  word: string;
  sentence: string;
  text: ReadingText;
  anchor: { x: number; y: number };
  onClose: () => void;
}

export function WordPopup({ word, sentence, text, anchor, onClose }: WordPopupProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<WordLookupResult | null>(null);
  const [sentenceTranslation, setSentenceTranslation] = useState<string | null>(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    lookupWord(word, sentence, text).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [word, sentence, text]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleTranslateSentence = async () => {
    if (sentenceTranslation) {
      setSentenceTranslation(null);
      return;
    }
    setSentenceLoading(true);
    const res = await translateSentence(sentence, text);
    setSentenceTranslation(res.translation);
    setSentenceLoading(false);
  };

  const handleAdd = () => {
    if (!result) return;
    addVocabularyWord(word, result.translation, text.title);
    logActivity("vocabulary");
    setAdded(true);
    setTimeout(onClose, 500);
  };

  const left = Math.min(Math.max(anchor.x - 140, 12), window.innerWidth - 292);
  const top = anchor.y + 16;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-[280px] rounded-2xl border p-4 backdrop-blur-xl"
      style={{
        left,
        top,
        background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-soft-lg)",
      }}
    >
      {!result ? (
        <div className="flex items-center gap-2 py-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--color-primary)" }} />
          {t("common.loading")}
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{word.replace(/[^a-zA-Z']/g, "")}</p>
            {result.partOfSpeech && (
              <span className="text-[11px] italic" style={{ color: "var(--color-text-muted)" }}>
                {result.partOfSpeech}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {result.translation}
          </p>

          {sentenceTranslation && (
            <p
              className="mt-3 rounded-lg border-l-2 pl-2 text-xs leading-relaxed"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-text-muted)" }}
            >
              {sentenceTranslation}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleTranslateSentence}
              className="rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              {sentenceLoading ? t("common.loading") : t("common.translateSentence")}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={added || result.unavailable}
              className="rounded-full px-3 py-1.5 text-xs font-semibold on-primary disabled:opacity-40"
              style={{ background: added ? "var(--color-success)" : "var(--color-primary)" }}
            >
              {added ? "✓" : t("common.addToVocabulary")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
