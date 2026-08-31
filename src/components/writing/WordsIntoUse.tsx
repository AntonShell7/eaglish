import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { checkWordUsage, type UsageReport } from "@/lib/wordUsage";
import { getVocabulary, reviewWord, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";

const MIN_WORDS = 35;
const TARGET_COUNT = 5;

/** Situations, not essay titles: a word is used in a moment, not in a topic. */
const SITUATIONS = [
  "message-friend",
  "explain-problem",
  "recommend",
  "disagree",
  "describe-day",
  "ask-favour",
] as const;

/**
 * Writing, rebuilt around the point of this app.
 *
 * An essay brief tests writing. This tests *your words*: five of them, taken
 * from your own collection, put into a short piece of your own. That is the
 * step nothing else here covers — recognising a word on a card and reaching for
 * it unprompted are different abilities, and only the second one is what
 * "knowing a word" means in conversation.
 *
 * The feedback is per word rather than a grade, and a word used correctly is
 * fed back into the scheduler as a successful recall — because it *is* one, and
 * a harder one than any flashcard.
 */
export function WordsIntoUse() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [targets, setTargets] = useState<VocabularyWord[]>([]);
  const [situation, setSituation] = useState<string>(SITUATIONS[0]);
  const [text, setText] = useState("");
  const [report, setReport] = useState<UsageReport | null>(null);
  const [busy, setBusy] = useState(false);

  /** Weakest words first: those are the ones that need to be produced. */
  const pick = () => {
    const pool = getVocabulary()
      .map((word) => ({ word, strength: wordStrength(word) }))
      .sort((a, b) => a.strength - b.strength)
      .slice(0, 14)
      .map((entry) => entry.word);

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);
    setTargets(shuffled);
    setSituation(SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)]);
    setText("");
    setReport(null);
  };

  useEffect(pick, []);

  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const tooShort = words < MIN_WORDS;

  const submit = async () => {
    if (tooShort || targets.length === 0) return;
    setBusy(true);
    const result = await checkWordUsage(
      text,
      targets.map((w) => w.word),
    );
    setReport(result);
    setBusy(false);

    // Correct use counts as a successful review — but graded "good", not
    // "easy": the words are listed on screen while writing, so this is guided
    // production rather than free recall, and inflating the interval here would
    // quietly push the word out of the queue before it is really held.
    let correct = 0;
    for (const verdict of result.verdicts) {
      const match = targets.find((w) => w.word.toLowerCase() === verdict.word.toLowerCase());
      if (!match) continue;
      if (verdict.correct) {
        reviewWord(match.id, 2);
        correct++;
      }
    }

    finish("writing", `words-into-use:${new Date().toDateString()}`, t("tasks.usageDone"));
    return correct;
  };

  if (targets.length === 0) {
    return (
      <div className="card mt-6 p-8 text-center">
        <p className="page-title text-xl">{t("usage.emptyTitle")}</p>
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("usage.emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section className="card p-6 sm:p-8">
        <p className="eyebrow">{t("usage.situationLabel")}</p>
        <h2 className="page-title mt-2 text-2xl">{t(`usage.situations.${situation}`)}</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {t("usage.brief", { count: targets.length, min: MIN_WORDS })}
        </p>

        {!report ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={t("usage.placeholder")}
              className="mt-5 w-full resize-none rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="tabular text-xs" style={{ color: "var(--color-text-muted)" }}>
                {t("writing.wordCount", { count: words })} · {t("usage.minWords", { count: MIN_WORDS })}
              </span>
              {/* Which targets are already in the text, live. */}
              <span className="flex flex-wrap gap-1.5">
                {targets.map((word) => {
                  const inText = text.toLowerCase().includes(word.word.toLowerCase().slice(0, 4));
                  return (
                    <span
                      key={word.id}
                      className={inText ? "chip chip--success" : "chip"}
                      style={{ opacity: inText ? 1 : 0.7 }}
                    >
                      {inText ? "✓ " : ""}
                      {word.word}
                    </span>
                  );
                })}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn btn--primary" onClick={submit} disabled={tooShort || busy}>
                {busy ? t("usage.checking") : t("usage.check")}
              </button>
              <button type="button" className="btn btn--ghost" onClick={pick} disabled={busy}>
                {t("usage.otherWords")}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <div className="grid gap-3">
              {report.verdicts.map((verdict) => (
                <div
                  key={verdict.word}
                  className="rounded-[var(--radius-md)] border-l-4 px-4 py-3"
                  style={{
                    borderColor: verdict.correct
                      ? "var(--color-success)"
                      : verdict.used
                        ? "var(--color-danger)"
                        : "var(--color-border-strong)",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <p className="text-sm font-bold">
                    {verdict.correct ? "✓ " : verdict.used ? "✕ " : "— "}
                    {verdict.word}
                    {!verdict.used && (
                      <span className="font-medium" style={{ color: "var(--color-text-faint)" }}>
                        {" "}
                        · {t("usage.notUsed")}
                      </span>
                    )}
                  </p>
                  {verdict.quote && (
                    <p className="mt-1 text-xs italic" style={{ color: "var(--color-text-faint)" }}>
                      “{verdict.quote}”
                    </p>
                  )}
                  {verdict.comment && <p className="mt-1.5 text-sm leading-relaxed">{verdict.comment}</p>}
                </div>
              ))}
            </div>

            {report.notes.length > 0 && (
              <>
                <p className="eyebrow mt-7">{t("usage.notesTitle")}</p>
                <ul className="mt-2 space-y-2">
                  {report.notes.map((note) => (
                    <li key={note} className="flex gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                      <span style={{ color: "var(--color-accent)" }}>◆</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {report.improved && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  {t("usage.improved")}
                </summary>
                <p
                  className="mt-3 rounded-[var(--radius-md)] border p-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  {report.improved}
                </p>
              </details>
            )}

            <button type="button" className="btn btn--primary mt-7" onClick={pick}>
              {t("usage.again")}
            </button>
          </div>
        )}
      </section>

      {/* The words themselves, with how firmly each is currently held. */}
      <aside className="card h-fit p-6">
        <p className="eyebrow">{t("usage.yourWords")}</p>
        <ul className="mt-4 space-y-4">
          {targets.map((word) => (
            <li key={word.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-bold">{word.word}</span>
                <span className="tabular text-[11px]" style={{ color: "var(--color-text-faint)" }}>
                  {wordStrength(word)}%
                </span>
              </div>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {word.translation}
              </p>
              {word.sentence && (
                <p className="mt-1 text-xs italic" style={{ color: "var(--color-text-faint)" }}>
                  {word.sentence}
                </p>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
