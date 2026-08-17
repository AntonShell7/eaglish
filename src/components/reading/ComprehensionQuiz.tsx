import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ComprehensionQuestion } from "@/data/readingTexts";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { recordQuizResult } from "@/lib/readingHistory";

interface ComprehensionQuizProps {
  textId: string;
  questions: ComprehensionQuestion[];
}

export function ComprehensionQuiz({ textId, questions }: ComprehensionQuizProps) {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  // Starting a different text resets the quiz.
  useEffect(() => {
    setAnswers({});
    setChecked(false);
  }, [textId]);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;

  const handleCheck = () => {
    setChecked(true);
    recordQuizResult(textId, correctCount, questions.length);
    // Once per text per day: retaking it to raise a score is welcome, farming
    // the daily goal with the same five questions is not.
    finish("quiz", `quiz:${textId}`, t("tasks.quizDone"));
  };

  const handleRetry = () => {
    setAnswers({});
    setChecked(false);
  };

  return (
    <section
      className="mt-6 rounded-[var(--radius-lg)] border p-6 sm:p-8"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <h3 className="page-title text-xl">{t("reading.comprehension")}</h3>

      <ol className="mt-6 space-y-6">
        {questions.map((q, qi) => {
          const picked = answers[q.id];
          return (
            <li key={q.id}>
              <p className="text-sm font-semibold">
                {qi + 1}. {q.question}
              </p>

              <div className="mt-3 grid gap-2">
                {q.options.map((option, oi) => {
                  const isPicked = picked === oi;
                  const isRight = oi === q.answer;

                  let borderColor = "var(--color-border)";
                  let background = "var(--color-surface-2)";
                  let color = "var(--color-text)";

                  if (checked && isRight) {
                    borderColor = "var(--color-success)";
                    background = "color-mix(in srgb, var(--color-success) 12%, transparent)";
                  } else if (checked && isPicked && !isRight) {
                    borderColor = "var(--color-danger)";
                    background = "color-mix(in srgb, var(--color-danger) 12%, transparent)";
                  } else if (isPicked) {
                    borderColor = "var(--color-primary)";
                    color = "var(--color-primary)";
                  }

                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={checked}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className="rounded-[var(--radius-md)] border px-4 py-2.5 text-left text-sm transition-colors duration-150 disabled:cursor-default"
                      style={{ borderColor, background, color }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: picked === q.answer ? "var(--color-success)" : "var(--color-text-muted)" }}
                >
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!allAnswered}
            className="rounded-full px-5 py-3 text-sm font-semibold on-primary disabled:opacity-40"
            style={{ background: "var(--color-primary)" }}
          >
            {t("reading.checkAnswers")}
          </button>
        ) : (
          <>
            <span
              className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                background: "var(--color-primary-soft)",
                color: "var(--color-primary)",
              }}
            >
              {t("reading.result", { correct: correctCount, total: questions.length })}
            </span>
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {correctCount === questions.length ? t("reading.perfect") : t("reading.keepGoing")}
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-full border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: "var(--color-border)" }}
            >
              {t("reading.tryAgain")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
