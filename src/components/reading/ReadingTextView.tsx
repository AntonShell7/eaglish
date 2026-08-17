import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { LookupPopup, type LookupRequest } from "@/components/lookup/LookupPopup";
import { getVocabulary } from "@/lib/vocabularyStore";

function splitTokens(sentence: string) {
  return sentence.split(/(\s+)/);
}

const normalise = (token: string) => token.toLowerCase().replace(/[^a-z']/g, "");

export function ReadingTextView({ text }: { text: ReadingText }) {
  const { t } = useTranslation();
  const [request, setRequest] = useState<LookupRequest | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  // Re-read after the popup closes so a word just saved is underlined at once.
  useEffect(() => {
    if (request) return;
    setSavedWords(new Set(getVocabulary().map((w) => w.word.toLowerCase())));
  }, [request, text.id]);

  const anySaved = useMemo(
    () => text.sentences.some((s) => splitTokens(s.text).some((tok) => savedWords.has(normalise(tok)))),
    [text, savedWords],
  );

  return (
    <div>
      <div className="text-lg leading-loose">
        {text.sentences.map((s, i) => (
          <span key={i}>
            {splitTokens(s.text).map((token, j) => {
              if (/^\s+$/.test(token)) return <span key={j}>{token}</span>;

              const known = savedWords.has(normalise(token));
              return (
                <button
                  key={j}
                  type="button"
                  onClick={(e) =>
                    setRequest({
                      word: token,
                      sentence: s.text,
                      knownSentenceTranslation: s.translationRu,
                      glossary: text.glossary,
                      source: text.title,
                      anchor: { x: e.clientX, y: e.clientY },
                    })
                  }
                  className="rounded px-0.5 transition-colors duration-150 hover:bg-[var(--color-primary-soft)]"
                  style={
                    known
                      ? {
                          // A word already in the review queue, met again in the
                          // wild — the repetition the whole method rests on.
                          textDecoration: "underline",
                          textDecorationColor: "var(--color-accent)",
                          textDecorationThickness: "2px",
                          textUnderlineOffset: "3px",
                        }
                      : undefined
                  }
                >
                  {token}
                </button>
              );
            })}{" "}
          </span>
        ))}
      </div>

      {anySaved && (
        <p className="mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {t("lookup.savedHint")}
        </p>
      )}

      {request && <LookupPopup request={request} onClose={() => setRequest(null)} />}
    </div>
  );
}
