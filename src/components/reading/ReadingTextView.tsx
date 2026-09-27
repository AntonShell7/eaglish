import { useEffect, useMemo, useState } from "react";
import type { ReadingText } from "@/data/readingTexts";
import { LookupPopup, type LookupRequest } from "@/components/lookup/LookupPopup";
import { getVocabulary } from "@/lib/vocabularyStore";
import { usesWord } from "@/lib/wordMatch";

function splitTokens(sentence: string) {
  return sentence.split(/(\s+)/);
}

const normalise = (token: string) => token.toLowerCase().replace(/[^a-z']/g, "");

export function ReadingTextView({ text }: { text: ReadingText }) {
  const [request, setRequest] = useState<LookupRequest | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  // Re-read after the popup closes so a word just saved is underlined at once.
  useEffect(() => {
    if (request) return;
    setSaved(getVocabulary().map((w) => w.word));
  }, [request, text.id]);

  /*
   * Which tokens in this text are words the learner has saved.
   *
   * Comparing the surface form against the stored headword only worked when
   * the two happened to be identical. Save a word from "he concedes" and the
   * vocabulary keeps "concede", so every later sentence containing "concedes"
   * went unmarked — which looked like saving had silently failed. Matching
   * goes through the same inflection-aware comparison the rest of the app
   * uses, and the answer is computed once per token rather than per render.
   */
  const marked = useMemo(() => {
    const map = new Map<string, boolean>();
    if (saved.length === 0) return map;

    for (const sentence of text.sentences) {
      for (const token of splitTokens(sentence.text)) {
        const key = normalise(token);
        if (!key || map.has(key)) continue;
        map.set(key, saved.some((word) => usesWord(key, word)));
      }
    }
    return map;
  }, [text, saved]);

  return (
    <div>
      <div className="reading-type">
        {text.sentences.map((s, i) => (
          <span key={i}>
            {splitTokens(s.text).map((token, j) => {
              // Raw string, not a span: a wrapper here made the selection
              // highlight stripe at every gap between words.
              if (/^\s+$/.test(token)) return token;

              const known = marked.get(normalise(token)) ?? false;
              return (
                // A span, not a button: browsers treat buttons as controls
                // rather than text, so drag-selecting across them produces no
                // selection at all — you couldn't copy a sentence out of the
                // text. Keyboard users reach the same lookup by selecting with
                // Shift+Arrow, which raises the (focusable) lookup button.
                <span
                  key={j}
                  onClick={(e) => {
                    // A drag-select ends with mouseup on a word, which would
                    // fire this click and hijack the copy. If text is selected,
                    // the learner was selecting — leave it to SelectionLookup.
                    if (window.getSelection()?.toString().trim()) return;

                    setRequest({
                      word: token,
                      sentence: s.text,
                      knownSentenceTranslation: s.translationRu,
                      glossary: text.glossary,
                      source: text.title,
                      anchor: { x: e.clientX, y: e.clientY },
                    });
                  }}
                  className="cursor-pointer rounded py-0.5 transition-colors duration-150 hover:bg-[var(--color-primary-soft)]"
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
                </span>
              );
            })}{" "}
          </span>
        ))}
      </div>

      {request && <LookupPopup request={request} onClose={() => setRequest(null)} />}
    </div>
  );
}
