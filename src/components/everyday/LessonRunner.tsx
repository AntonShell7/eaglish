import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Exercise, Lesson, Phrase, Register } from "@/data/everydayLessons";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { saveLessonResult } from "@/lib/lessonProgress";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";

const REGISTERS: Register[] = ["neutral", "casual", "veryCasual"];

/** Decorative only — the written label carries the meaning. */
const REGISTER_DOT: Record<Register, string> = {
  neutral: "var(--color-success)",
  casual: "var(--color-primary)",
  veryCasual: "#f59e0b",
};

type Stage = "study" | "match" | "drill" | "done";

const STAGES: Stage[] = ["study", "match", "drill"];

function RegisterPill({ register }: { register: Register }) {
  const { t } = useTranslation();
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: REGISTER_DOT[register] }}
      />
      {t(`everyday.registerShort.${register}`)}
    </span>
  );
}

/* ── Stage 1: meet the phrases ──────────────────────────────────────────── */

function StudyStage({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const [savedTick, setSavedTick] = useState(0);

  // Clamped: two fast taps on Next can both land before React re-renders, and
  // an index past the end would take the card down with it.
  const position = Math.min(index, lesson.phrases.length - 1);
  const phrase = lesson.phrases[position];
  const saved = useMemo(() => isWordSaved(phrase.phrase), [phrase.phrase, savedTick]);
  const isLast = position === lesson.phrases.length - 1;

  const save = () => {
    // The Russian side is what a learner needs on the back of the card; the
    // English definition is the lesson, not the flashcard.
    addVocabularyWord(phrase.phrase, phrase.ru, t("nav.everydayEnglish"));
    setSavedTick((n) => n + 1);
  };

  return (
    <div>
      <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
        {t("everyday.cardOf", { done: position + 1, total: lesson.phrases.length })}
      </p>

      <div
        className="mt-3 rounded-[var(--radius-lg)] border p-6 sm:p-8"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="page-title text-2xl">{phrase.phrase}</h3>
          <RegisterPill register={phrase.register} />
        </div>

        <p className="mt-4 text-sm leading-relaxed">{phrase.meaning}</p>

        {i18n.language.startsWith("ru") && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {phrase.ru}
          </p>
        )}

        <p
          className="mt-5 rounded-[var(--radius-md)] px-4 py-3 text-sm italic"
          style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
        >
          {phrase.example}
        </p>

        <button
          type="button"
          onClick={save}
          disabled={saved}
          className="mt-5 rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-70"
          style={{
            borderColor: saved ? "var(--color-success)" : "var(--color-border)",
            color: saved ? "var(--color-success)" : "var(--color-text-muted)",
          }}
        >
          {saved ? `✓ ${t("common.saved")}` : t("everyday.saveToVocab")}
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, position - 1))}
          disabled={position === 0}
          className="rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          {t("everyday.prev")}
        </button>

        <button
          type="button"
          onClick={() => (isLast ? onDone() : setIndex(position + 1))}
          className="rounded-full px-5 py-2.5 text-sm font-semibold on-primary"
          style={{ background: "var(--color-primary)" }}
        >
          {isLast ? t("everyday.toPractice") : t("everyday.next")}
        </button>
      </div>
    </div>
  );
}

/* ── Stage 2: match phrase to meaning ───────────────────────────────────── */

/** Deterministic per mount: a reshuffle mid-exercise would move the answers. */
function shuffled<T>(items: T[]): T[] {
  return items
    .map((item) => ({ item, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map(({ item }) => item);
}

function MatchStage({
  phrases,
  onDone,
}: {
  phrases: Phrase[];
  onDone: (correct: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const right = useMemo(() => shuffled(phrases), [phrases]);
  // Match against the Russian bridge for a Russian interface and the English
  // definition otherwise — nobody should be asked to pair English with a
  // language they didn't choose.
  const sideOf = (p: Phrase) => (i18n.language.startsWith("ru") ? p.ru : p.meaning);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const meaningsRef = useRef<HTMLDivElement>(null);

  const done = matched.length === phrases.length;

  /**
   * On a phone the two columns stack, so the meanings sit below the fold: after
   * picking a phrase you'd be scrolling blind. Bring them into view and keep the
   * chosen phrase pinned at the top of the list.
   */
  const pick = (phrase: string) => {
    setPicked(phrase);
    if (window.innerWidth < 640) {
      meaningsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const choose = (phraseKey: string, translationKey: string) => {
    if (phraseKey === translationKey) {
      setMatched((m) => [...m, phraseKey]);
      setPicked(null);
      setWrongPair(null);
      return;
    }
    // First wrong try costs the point but not the progress — the pair stays open.
    setMissed((m) => (m.includes(phraseKey) ? m : [...m, phraseKey]));
    setWrongPair(translationKey);
    window.setTimeout(() => setWrongPair(null), 500);
  };

  return (
    <div>
      <h3 className="page-title text-xl">{t("everyday.matchTitle")}</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("everyday.matchHint")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          {phrases.map((p) => {
            const isMatched = matched.includes(p.phrase);
            const isPicked = picked === p.phrase;
            return (
              <button
                key={p.phrase}
                type="button"
                disabled={isMatched}
                onClick={() => pick(p.phrase)}
                className="w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm font-semibold transition-colors duration-150"
                style={{
                  borderColor: isMatched
                    ? "var(--color-success)"
                    : isPicked
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  background: isPicked ? "var(--color-primary-soft)" : "var(--color-surface)",
                  color: isMatched ? "var(--color-success)" : isPicked ? "var(--color-primary)" : "var(--color-text)",
                  opacity: isMatched ? 0.65 : 1,
                }}
              >
                {isMatched && "✓ "}
                {p.phrase}
              </button>
            );
          })}
        </div>

        <div ref={meaningsRef} className="space-y-2">
          {picked && (
            <p
              className="sticky top-0 z-10 -mx-1 rounded-[var(--radius-md)] px-3 py-2 text-xs font-semibold sm:hidden"
              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
            >
              {t("everyday.matching", { phrase: picked })}
            </p>
          )}
          {right.map((p) => {
            const isMatched = matched.includes(p.phrase);
            const isWrong = wrongPair === p.phrase;
            return (
              <button
                key={p.phrase}
                type="button"
                disabled={isMatched || !picked}
                onClick={() => picked && choose(picked, p.phrase)}
                className="w-full rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm transition-colors duration-150"
                style={{
                  borderColor: isMatched
                    ? "var(--color-success)"
                    : isWrong
                      ? "var(--color-danger)"
                      : "var(--color-border)",
                  background: "var(--color-surface)",
                  color: isMatched ? "var(--color-success)" : isWrong ? "var(--color-danger)" : "var(--color-text)",
                  opacity: isMatched ? 0.65 : 1,
                }}
              >
                {sideOf(p)}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={!done}
        onClick={() => onDone(phrases.length - missed.length)}
        className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold on-primary disabled:opacity-40"
        style={{ background: "var(--color-primary)" }}
      >
        {t("everyday.continue")}
      </button>
    </div>
  );
}

/* ── Stage 3: use it in a situation ─────────────────────────────────────── */

function optionsFor(exercise: Exercise, t: (key: string) => string): string[] {
  return exercise.kind === "register" ? REGISTERS.map((r) => t(`everyday.register.${r}`)) : exercise.options;
}

function answerIndexOf(exercise: Exercise): number {
  return exercise.kind === "register" ? REGISTERS.indexOf(exercise.answer) : exercise.answer;
}

function DrillStage({
  exercises,
  onDone,
}: {
  exercises: Exercise[];
  onDone: (correct: number) => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const exercise = exercises[Math.min(index, exercises.length - 1)];
  const options = optionsFor(exercise, t);
  const answer = answerIndexOf(exercise);
  const isLast = index === exercises.length - 1;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (isLast) {
      onDone(correct);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const [before, after] =
    exercise.kind === "gap" ? exercise.text.split("___") : ["", ""];

  return (
    <div>
      <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
        {t("everyday.taskOf", { done: index + 1, total: exercises.length })}
      </p>

      <div
        className="mt-3 rounded-[var(--radius-lg)] border p-6 sm:p-8"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
      >
        {exercise.kind === "gap" && (
          <>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {exercise.setup}
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              {before}
              <span
                className="mx-1 inline-block min-w-[90px] rounded px-2 text-center align-middle font-semibold"
                style={{
                  background: "var(--color-primary-soft)",
                  color: "var(--color-primary)",
                }}
              >
                {picked !== null ? options[picked] : " "}
              </span>
              {after}
            </p>
          </>
        )}

        {exercise.kind === "reply" && (
          <>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("everyday.replyPrompt")}
            </p>
            <p className="mt-3 text-lg leading-relaxed">{exercise.situation}</p>
          </>
        )}

        {exercise.kind === "register" && (
          <>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("everyday.registerPrompt")}
            </p>
            <p className="page-title mt-3 text-2xl">{exercise.phrase}</p>
          </>
        )}

        <div className="mt-6 grid gap-2">
          {options.map((option, i) => {
            const isAnswer = i === answer;
            const isPicked = picked === i;
            const revealed = picked !== null;

            let borderColor = "var(--color-border)";
            let color = "var(--color-text)";
            let background = "var(--color-surface-2)";
            if (revealed && isAnswer) {
              borderColor = "var(--color-success)";
              color = "var(--color-success)";
            } else if (revealed && isPicked) {
              borderColor = "var(--color-danger)";
              color = "var(--color-danger)";
            } else if (revealed) {
              background = "transparent";
              color = "var(--color-text-muted)";
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => pick(i)}
                disabled={revealed}
                className="rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm font-medium transition-colors duration-150 disabled:cursor-default"
                style={{ borderColor, color, background }}
              >
                {revealed && isAnswer && "✓ "}
                {revealed && isPicked && !isAnswer && "✕ "}
                {option}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div
            className="mt-5 rounded-[var(--radius-md)] border-l-4 px-4 py-3"
            style={{
              borderColor: picked === answer ? "var(--color-success)" : "var(--color-primary)",
              background: "var(--color-surface-2)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              {picked === answer ? t("everyday.correct") : t("everyday.notQuite")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{exercise.why}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={picked === null}
        onClick={next}
        className="mt-5 rounded-full px-5 py-2.5 text-sm font-semibold on-primary disabled:opacity-40"
        style={{ background: "var(--color-primary)" }}
      >
        {isLast ? t("everyday.finishLesson") : t("everyday.next")}
      </button>
    </div>
  );
}

/* ── The lesson itself ──────────────────────────────────────────────────── */

export function LessonRunner({
  lesson,
  onExit,
  onNextLesson,
}: {
  lesson: Lesson;
  onExit: () => void;
  onNextLesson?: () => void;
}) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [stage, setStage] = useState<Stage>("study");
  const [matchScore, setMatchScore] = useState(0);
  const [drillScore, setDrillScore] = useState(0);
  const [savedAll, setSavedAll] = useState(false);

  const total = lesson.phrases.length + lesson.exercises.length;
  const score = matchScore + drillScore;

  const complete = (drillCorrect: number) => {
    setDrillScore(drillCorrect);
    setStage("done");
    saveLessonResult(lesson.id, matchScore + drillCorrect, total);
    // One lesson, one goal unit — a retake sharpens the score, not the counter.
    finish("vocabulary", `lesson:${lesson.id}`, t("tasks.lessonDone"));
  };

  const restart = () => {
    setMatchScore(0);
    setDrillScore(0);
    setStage("study");
  };

  const saveEverything = () => {
    lesson.phrases.forEach((p) => addVocabularyWord(p.phrase, p.ru, t("nav.everydayEnglish")));
    setSavedAll(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <button
        type="button"
        onClick={onExit}
        className="text-sm font-semibold"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← {t("everyday.backToLessons")}
      </button>

      <h1 className="page-title mt-4 text-2xl sm:text-3xl">{lesson.title}</h1>

      {/* Stage rail: three steps, so the lesson never feels open-ended. */}
      {stage !== "done" && (
        <ol className="mt-5 flex items-center gap-2">
          {STAGES.map((s, i) => {
            const active = s === stage;
            const passed = STAGES.indexOf(stage) > i;
            return (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span
                  className="flex-1 rounded-full"
                  style={{
                    height: 4,
                    background: active || passed ? "var(--color-primary)" : "var(--color-border)",
                  }}
                />
                <span
                  className="text-[11px] font-semibold whitespace-nowrap"
                  style={{ color: active ? "var(--color-primary)" : "var(--color-text-muted)" }}
                >
                  {t(`everyday.stage.${s}`)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-7">
        {stage === "study" && <StudyStage lesson={lesson} onDone={() => setStage("match")} />}

        {stage === "match" && (
          <MatchStage
            phrases={lesson.phrases}
            onDone={(correct) => {
              setMatchScore(correct);
              setStage("drill");
            }}
          />
        )}

        {stage === "drill" && <DrillStage exercises={lesson.exercises} onDone={complete} />}

        {stage === "done" && (
          <div
            className="rounded-[var(--radius-lg)] border p-7 text-center sm:p-10"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
          >
            <p className="page-title text-3xl">{t("everyday.doneTitle")}</p>
            <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("everyday.doneScore", { correct: score, total })}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={saveEverything}
                disabled={savedAll}
                className="rounded-full border px-4 py-2.5 text-sm font-semibold disabled:opacity-70"
                style={{
                  borderColor: savedAll ? "var(--color-success)" : "var(--color-border)",
                  color: savedAll ? "var(--color-success)" : "var(--color-text-muted)",
                }}
              >
                {savedAll ? `✓ ${t("everyday.savedAll")}` : t("everyday.saveAll")}
              </button>

              <button
                type="button"
                onClick={restart}
                className="rounded-full border px-4 py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              >
                {t("everyday.again")}
              </button>

              {onNextLesson && (
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold on-primary"
                  style={{ background: "var(--color-primary)" }}
                >
                  {t("everyday.nextLesson")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
