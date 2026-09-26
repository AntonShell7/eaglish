import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SectionHero } from "@/components/SectionHero";
import { SentenceDrill } from "@/components/activation/SentenceDrill";
import { getVocabulary, type VocabularyWord } from "@/lib/vocabularyStore";
import { activatedCount, getActivations } from "@/lib/activation";
import { buildSets, orderForPractice, type WordSet } from "@/lib/wordSets";
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

  const sets = useMemo(() => buildSets(), [words, running]);
  const all = sets.find((set) => set.kind === "all");
  const grouped = sets.filter((set) => set.kind !== "all");

  const start = (set: WordSet) => {
    // Ordered, never filtered. Which word comes first is worth deciding; which
    // words you are allowed to practise is not the app's business.
    setQueue(orderForPractice(set.words).slice(0, RUN));
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
          usable are different counts, and showing only the first is how every
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
            onClick={() => all && start(all)}
            disabled={!all}
          >
            {t("activation.startAll")}
          </button>
        </div>

        {words.length === 0 && (
          <p className="mt-5 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("activation.emptyNoWords")}{" "}
            <Link to="/reading" style={{ color: "var(--color-primary)" }}>
              {t("activation.emptyLink")}
            </Link>
          </p>
        )}
      </section>

      {/* Sets, which nobody had to create. Every word already knows the text it
          came from and the week it arrived; asking a learner to re-enter that
          as folders would be asking them to do the filing this app exists to
          abolish. */}
      {grouped.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow">{t("activation.setsTitle")}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((set) => (
              <button
                key={set.id}
                type="button"
                className="card card--interactive flex h-full flex-col p-5 text-left"
                onClick={() => start(set)}
              >
                <p className="eyebrow">
                  {set.kind === "source" ? t("activation.setFromText") : t("activation.setFromWeek")}
                </p>
                <h3 className="page-title mt-2 text-base leading-snug">
                  {set.kind === "week" ? weekLabel(Number(set.title), t) : set.title}
                </h3>
                <p className="mt-2 flex-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("activation.setCount", { count: set.words.length })}
                </p>
                <p className="mt-3 text-xs" style={{ color: "var(--color-text-faint)" }}>
                  {t("activation.setActive", { active: set.active, total: set.words.length })}
                </p>
                <span
                  className="mt-2 block h-1 overflow-hidden rounded-full"
                  style={{ background: "var(--color-surface-3)" }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${set.words.length ? (set.active / set.words.length) * 100 : 0}%`,
                      background: "var(--color-primary)",
                      transition: "width var(--dur-4) var(--ease)",
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

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

/** "На этой неделе" / "Неделю назад" / "N недель назад". */
function weekLabel(weeksAgo: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (weeksAgo === 0) return t("activation.weekThis");
  return t("activation.weekAgo", { count: weeksAgo });
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
            {/* All of them, not the latest: four sentences with one word show
                its range, and one shows only that it was used once. */}
            <ul className="mt-1 grid gap-1">
              {entry.sentences.map((line) => (
                <li
                  key={line}
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-reading)", color: "var(--color-text-muted)" }}
                >
                  {line}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
