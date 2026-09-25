import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SectionHero } from "@/components/SectionHero";
import { SentenceDrill } from "@/components/activation/SentenceDrill";
import { getVocabulary, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import { activatedCount, getActivations } from "@/lib/activation";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import "@/components/activation/activation.css";

/** A short run, so the session has an end that arrives. */
const RUN = 5;

/**
 * The active vocabulary.
 *
 * This section used to hand out essay briefs — write a letter of complaint,
 * describe a chart — which is a writing exercise wearing a vocabulary
 * exercise's clothes. It practised composition, took twenty minutes, and
 * touched a handful of words badly.
 *
 * The problem it should solve is narrower and much more common. A word you can
 * translate on a card and have never produced lives in recognition memory: it
 * answers when prompted and stays silent in the half-second that speech
 * allows. You know perfectly well what a marsh is, and out loud you say "wet
 * place", because the word has never once had a path out of your head. No
 * amount of further card review fixes that, because card review rehearses the
 * direction that already works.
 *
 * So: one word, one sentence, immediate judgement on that word's use. It is
 * the only exercise here where the learner makes something, and the only
 * evidence that a word is genuinely theirs.
 */
export default function Writing() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();

  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [activated, setActivated] = useState(0);
  const [words, setWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    setWords(getVocabulary());
    setActivated(activatedCount());
  }, [running]);

  /**
   * Which words to practise.
   *
   * Never-produced words first, because that is the whole gap this closes, and
   * among those the ones the scheduler already considers solid — a word you
   * cannot yet recall is not ready to be produced, and asking for it produces a
   * blank page rather than a sentence.
   */
  const candidates = useMemo(() => {
    const active = getActivations();
    return words
      .map((word) => ({ word, strength: wordStrength(word), used: Boolean(active[word.word.toLowerCase()]) }))
      .filter((entry) => entry.strength >= 20)
      .sort((a, b) => Number(a.used) - Number(b.used) || b.strength - a.strength)
      .map((entry) => entry.word);
  }, [words]);

  const start = () => {
    setQueue(candidates.slice(0, RUN));
    setIndex(0);
    setDone(0);
    setRunning(true);
  };

  const advance = (correct: boolean) => {
    if (correct) setDone((n) => n + 1);
    if (index + 1 >= queue.length) {
      finish("writing", `activation:${new Date().toDateString()}:${Math.floor(Date.now() / 1000)}`, t("activation.taskDone"));
      setRunning(false);
      setIndex(0);
      return;
    }
    setIndex((i) => i + 1);
  };

  if (running && queue[index]) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mx-auto mb-6 flex max-w-[38rem] items-center justify-between gap-3">
          <button type="button" className="btn btn--quiet btn--sm" onClick={() => setRunning(false)}>
            ← {t("activation.stop")}
          </button>
          <span className="tabular text-xs" style={{ color: "var(--color-text-faint)" }}>
            {index + 1} / {queue.length}
          </span>
        </div>

        <SentenceDrill
          key={queue[index].id}
          word={queue[index]}
          onDone={advance}
          onSkip={() => advance(false)}
        />
      </div>
    );
  }

  return (
    <SectionHero kicker={t("nav.writing")} title={t("activation.title")} description={t("activation.intro")}>
      {/* The one number this section is responsible for. Words known and words
          usable are different counts, and only showing the first is how every
          other app hides this gap. */}
      <section className="card mt-8 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">{t("activation.activeLabel")}</p>
            <p className="tabular mt-2 text-4xl font-bold leading-none">
              {activated}
              <span className="text-lg font-medium" style={{ color: "var(--color-text-faint)" }}>
                {" "}
                / {words.length}
              </span>
            </p>
            <p className="mt-3 max-w-md text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("activation.activeExplain")}
            </p>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--lg shrink-0"
            onClick={start}
            disabled={candidates.length === 0}
          >
            {t("activation.start", { count: Math.min(RUN, candidates.length) })}
          </button>
        </div>

        {candidates.length === 0 && (
          <p className="mt-5 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {words.length === 0 ? t("activation.emptyNoWords") : t("activation.emptyTooNew")}{" "}
            <Link to="/reading" style={{ color: "var(--color-primary)" }}>
              {t("activation.emptyLink")}
            </Link>
          </p>
        )}
      </section>

      {done > 0 && (
        <p className="mt-4 text-sm" style={{ color: "var(--color-success)" }}>
          {t("activation.sessionDone", { count: done })}
        </p>
      )}

      {/* The sentences already written, which are the best mnemonics the
          learner will ever have — their own. */}
      <Sentences />
    </SectionHero>
  );
}

function Sentences() {
  const { t } = useTranslation();
  const entries = useMemo(() => Object.entries(getActivations()).sort((a, b) => b[1].at - a[1].at), []);
  if (entries.length === 0) return null;

  return (
    <section className="mt-10">
      <p className="eyebrow">{t("activation.yoursTitle")}</p>
      <ul className="mt-4 grid gap-2">
        {entries.slice(0, 12).map(([word, entry]) => (
          <li key={word} className="card px-5 py-4">
            <p className="text-sm font-bold">{word}</p>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-reading)", color: "var(--color-text-muted)" }}
            >
              {entry.sentence}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
