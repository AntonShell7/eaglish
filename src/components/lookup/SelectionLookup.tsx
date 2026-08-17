import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LookupPopup, type LookupRequest } from "./LookupPopup";

/** Beyond this it's a passage, not a word — the popup is the wrong tool. */
const MAX_WORDS = 4;

/**
 * Select any English text anywhere in the app and a "look it up" button appears.
 *
 * This is the mechanism behind the whole premise: words are learned by meeting
 * them repeatedly in real context, so capturing one has to be possible wherever
 * it turns up — a reading text, a writing prompt, a sample answer, an
 * achievement description — not only on the page that happens to own a
 * dictionary.
 */
export function SelectionLookup() {
  const { t } = useTranslation();
  const [offer, setOffer] = useState<{ word: string; sentence?: string; x: number; y: number } | null>(null);
  const [request, setRequest] = useState<LookupRequest | null>(null);

  useEffect(() => {
    const onSelection = () => {
      // A popup is open — leave its own selection alone.
      if (request) return;

      // Inside a field, selecting means "delete this" or "copy this" — offering
      // a translation there would fight the user's actual intent.
      const focused = document.activeElement;
      if (
        focused instanceof HTMLInputElement ||
        focused instanceof HTMLTextAreaElement ||
        (focused instanceof HTMLElement && focused.isContentEditable)
      ) {
        setOffer(null);
        return;
      }

      const sel = window.getSelection();
      const raw = sel?.toString().trim() ?? "";

      if (!raw || !sel || sel.rangeCount === 0) {
        setOffer(null);
        return;
      }

      // Latin script only: selecting Russian UI copy shouldn't offer a lookup.
      if (!/[a-zA-Z]/.test(raw) || /[а-яА-ЯёЁ]/.test(raw)) {
        setOffer(null);
        return;
      }

      const words = raw.split(/\s+/).filter(Boolean);
      if (words.length > MAX_WORDS) {
        setOffer(null);
        return;
      }

      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setOffer(null);
        return;
      }

      // The sentence around the selection, for context — best effort only.
      const container = sel.anchorNode?.parentElement?.closest("p, li, td, h1, h2, h3, blockquote");
      const full = container?.textContent ?? "";
      const sentence = full
        .split(/(?<=[.!?])\s+/)
        .find((s) => s.includes(raw))
        ?.trim();

      setOffer({
        word: raw.replace(/^[^\w']+|[^\w']+$/g, ""),
        sentence: sentence && sentence.length > raw.length ? sentence : undefined,
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    };

    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, [request]);

  const open = () => {
    if (!offer) return;
    setRequest({
      word: offer.word,
      sentence: offer.sentence,
      source: t("lookup.fromSelection"),
      anchor: { x: offer.x, y: offer.y },
    });
    setOffer(null);
  };

  return (
    <>
      {offer && !request && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // don't clear the selection
          onClick={open}
          className="fixed z-[55] rounded-full px-3 py-1.5 text-xs font-semibold on-primary shadow-lg"
          style={{
            left: Math.min(Math.max(offer.x - 60, 12), window.innerWidth - 132),
            top: Math.min(offer.y + 8, window.innerHeight - 48),
            background: "var(--color-primary)",
          }}
        >
          {t("lookup.lookUp")}
        </button>
      )}

      {request && <LookupPopup request={request} onClose={() => setRequest(null)} />}
    </>
  );
}
