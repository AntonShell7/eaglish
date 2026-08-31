import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { VocabularyWord } from "@/lib/vocabularyStore";

/**
 * A review that actually tests memory.
 *
 * The old card was flip-and-rate: see the word, reveal the translation, tell
 * yourself whether you knew it. Two things are wrong with that. Recognising a
 * translation is far easier than producing the word, so the card tests the
 * wrong direction; and self-rating after seeing the answer is unreliable —
 * people consistently believe they would have recalled what they merely
 * recognise. Every interval in the scheduler was therefore built on a guess.
 *
 * Here the learner has to produce the word: in the gap of the sentence they
 * originally met it in when we have one, otherwise from the translation. The
 * grade comes from what they typed, not from what they think they knew, and a
 * single-character slip is treated as a typo rather than a failure.
 */

interface ReviewCardProps {
  word: VocabularyWord;
  onGraded: (quality: 0 | 1 | 2 | 3) => void;
}

type Verdict = "correct" | "typo" | "wrong";

const clean = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё\s-]/gi, "");

/** Edit distance, capped — we only care whether it is 0, 1 or "more". */
function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Splits the stored sentence around the target word, if it is really in there. */
function makeCloze(sentence: string | undefined, word: string) {
  if (!sentence) return null;
  const pattern = new RegExp(`(^|[^a-zA-Z])(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})([^a-zA-Z]|$)`, "i");
  const match = sentence.match(pattern);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[1].length;
  return { before: sentence.slice(0, start), after: sentence.slice(start + match[2].length) };
}

export function ReviewCard({ word, onGraded }: ReviewCardProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const cloze = useMemo(() => makeCloze(word.sentence, word.word), [word.sentence, word.word]);

  useEffect(() => {
    setAnswer("");
    setVerdict(null);
    input.current?.focus();
  }, [word.id]);

  const check = () => {
    if (verdict || !answer.trim()) return;
    const given = clean(answer);
    const expected = clean(word.word);
    if (given === expected) setVerdict("correct");
    else if (expected.length >= 4 && distance(given, expected) <= 1) setVerdict("typo");
    else setVerdict("wrong");
  };

  const reveal = () => setVerdict("wrong");

  const tone =
    verdict === "correct"
      ? "var(--color-success)"
      : verdict === "typo"
        ? "var(--color-accent-ink)"
        : "var(--color-danger)";

  return (
    <div className="card mx-auto flex max-w-xl flex-col gap-5 p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
        {cloze ? t("vocabulary.fillTheGap") : t("vocabulary.recallWord")}
      </p>

      {/* The prompt: the learner's own sentence when we have it. */}
      {cloze ? (
        <p className="text-lg leading-relaxed">
          {cloze.before}
          <span
            className="mx-1 inline-block min-w-[92px] rounded px-2 text-center align-middle font-bold"
            style={{
              background: verdict ? "transparent" : "var(--color-primary-soft)",
              color: verdict ? tone : "var(--color-primary)",
              borderBottom: verdict ? `2px solid ${tone}` : "none",
            }}
          >
            {verdict ? word.word : " "}
          </span>
          {cloze.after}
        </p>
      ) : (
        <p className="page-title text-2xl">{word.translation}</p>
      )}

      {cloze && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {word.translation}
        </p>
      )}

      {!verdict ? (
        <>
          <input
            ref={input}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder={t("vocabulary.typeInEnglish")}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full rounded-[var(--radius-md)] border px-4 py-3 text-lg outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={check}
              disabled={!answer.trim()}
              className="btn btn--primary disabled:opacity-40"
            >
              {t("vocabulary.check")}
            </button>
            <button
              type="button"
              onClick={reveal}
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t("vocabulary.dontRemember")}
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="rounded-[var(--radius-md)] border-l-4 px-4 py-3"
            style={{ borderColor: tone, background: "var(--color-surface-2)" }}
          >
            <p className="text-sm font-bold" style={{ color: tone }}>
              {verdict === "correct"
                ? t("vocabulary.correct")
                : verdict === "typo"
                  ? t("vocabulary.almost")
                  : t("vocabulary.notThisTime")}
            </p>
            <p className="mt-1 text-sm">
              {word.word}
              {verdict !== "correct" && answer.trim() && (
                <span style={{ color: "var(--color-text-muted)" }}> · {t("vocabulary.youWrote", { answer })}</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* The grade follows the attempt; "easy" is the only judgement left
                to the learner, and only after a clean answer. */}
            <button
              type="button"
              onClick={() => onGraded(verdict === "correct" ? 2 : verdict === "typo" ? 1 : 0)}
              className="btn btn--primary"
            >
              {t("vocabulary.next")}
            </button>

            {verdict === "correct" && (
              <button
                type="button"
                onClick={() => onGraded(3)}
                className="rounded-full border px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              >
                {t("vocabulary.wasEasy")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
