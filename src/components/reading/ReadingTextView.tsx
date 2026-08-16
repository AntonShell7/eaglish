import { useState } from "react";
import type { ReadingText } from "@/data/readingTexts";
import { WordPopup } from "./WordPopup";

interface ActiveWord {
  word: string;
  sentence: string;
  x: number;
  y: number;
}

function splitTokens(sentence: string) {
  return sentence.split(/(\s+)/);
}

export function ReadingTextView({ text }: { text: ReadingText }) {
  const [active, setActive] = useState<ActiveWord | null>(null);

  return (
    <div className="text-lg leading-loose">
      {text.sentences.map((s, i) => (
        <span key={i}>
          {splitTokens(s.text).map((token, j) =>
            /^\s+$/.test(token) ? (
              <span key={j}>{token}</span>
            ) : (
              <button
                key={j}
                type="button"
                onClick={(e) => setActive({ word: token, sentence: s.text, x: e.clientX, y: e.clientY })}
                className="rounded px-0.5 transition-colors duration-150 hover:bg-[var(--color-primary-soft)]"
              >
                {token}
              </button>
            ),
          )}{" "}
        </span>
      ))}

      {active && (
        <WordPopup
          word={active.word}
          sentence={active.sentence}
          text={text}
          anchor={{ x: active.x, y: active.y }}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
