import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { parseLine, type Dialogue, type Expression } from "@/data/slangDialogues";
import { addVocabularyWord, isWordSaved } from "@/lib/vocabularyStore";
import { saveSlangResult } from "@/lib/slangProgress";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import "./slang.css";

/**
 * Working through one conversation.
 *
 * Two stages, and the order is the argument. First the dialogue is read whole,
 * with the expressions marked but not explained — because meeting an idiom in
 * a line you half understand is the actual experience this module is training,
 * and a glossary shown first turns it back into a vocabulary list.
 *
 * Only then the checks, and never on the dialogue's own sentences. Recognising
 * "dodged a bullet" in the line you just read tests thirty seconds of memory;
 * recognising it somewhere new is the thing that will happen in a conversation.
 */

type Stage = "read" | "checks" | "done";

function ExpressionPanel({ expression, onClose }: { expression: Expression; onClose: () => void }) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(() => isWordSaved(expression.phrase));

  const save = () => {
    // The Russian side goes on the card: an English definition is the lesson,
    // but it is not what a learner wants on the back of a flashcard at speed.
    addVocabularyWord(expression.phrase, expression.ru, t("nav.slang"), expression.meaning);
    setSaved(true);
  };

  return (
    <aside className="sl-panel" role="dialog" aria-label={expression.phrase}>
      <div className="sl-panel__top">
        <div>
          <p className="sl-panel__phrase">{expression.phrase}</p>
          <p className="sl-panel__kind">
            {t(`slangModule.kinds.${expression.kind}`)} · {t(`everyday.registerShort.${expression.register}`)}
          </p>
        </div>
        <button type="button" className="sl-panel__close" onClick={onClose} aria-label={t("common.close")}>
          ✕
        </button>
      </div>

      <p className="sl-panel__meaning">{expression.meaning}</p>
      <p className="sl-panel__ru">{expression.ru}</p>

      {/* The trap is the reason the module exists, so it is never folded away. */}
      {expression.trap && (
        <p className="sl-panel__trap">
          <span className="sl-panel__trapLabel">{t("slangModule.trap")}</span>
          {expression.trap}
        </p>
      )}

      {expression.senses && (
        <ul className="sl-panel__senses">
          {expression.senses.map((sense) => (
            <li key={sense}>{sense}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={saved ? "btn btn--quiet btn--sm" : "btn btn--primary btn--sm"}
        onClick={save}
        disabled={saved}
      >
        {saved ? t("slangModule.inVocabulary") : t("slangModule.addToVocabulary")}
      </button>
    </aside>
  );
}

export function DialogueRunner({ dialogue, onExit }: { dialogue: Dialogue; onExit: () => void }) {
  const { t, i18n } = useTranslation();
  const { finish } = useTaskDone();
  const ru = i18n.language.startsWith("ru");

  const [stage, setStage] = useState<Stage>("read");
  const [open, setOpen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => dialogue.checks.map(() => null));

  const byPhrase = useMemo(() => {
    const map = new Map<string, Expression>();
    for (const expression of dialogue.expressions) map.set(expression.phrase, expression);
    return map;
  }, [dialogue]);

  const correct = answers.filter((answer, i) => answer === dialogue.checks[i].answer).length;
  const answered = answers.filter((a) => a !== null).length;

  /*
   * The updater takes the previous answers rather than the ones this render
   * closed over. Two taps landing in the same batch — a double tap, or a fast
   * pass down the page — would otherwise both read the same stale array and
   * the second would erase the first.
   */
  const answer = (index: number, choice: number) => {
    setAnswers((prev) => {
      if (prev[index] !== null) return prev;
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  /* Finishing is a consequence of the answers, so it is watched rather than
     fired from the click: recording a score inside a state updater would run
     twice under StrictMode and log the dialogue as finished twice. */
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    if (!answers.every((a) => a !== null)) return;
    recorded.current = true;

    const score = answers.filter((a, i) => a === dialogue.checks[i].answer).length;
    saveSlangResult(dialogue.id, score, dialogue.checks.length);
    finish("slang", `dialogue:${dialogue.id}`, t("slangModule.taskDone"));
    setStage("done");
  }, [answers, dialogue, finish, t]);

  const saveAll = () => {
    for (const expression of dialogue.expressions) {
      addVocabularyWord(expression.phrase, expression.ru, t("nav.slang"), expression.meaning);
    }
    onExit();
  };

  const opened = open ? byPhrase.get(open) : undefined;

  return (
    <div className="sl-run">
      <button type="button" className="btn btn--quiet btn--sm" onClick={onExit}>
        ← {t("slangModule.backToList")}
      </button>

      <header className="sl-run__head">
        <p className="eyebrow">
          {dialogue.level} · {t(`slangModule.stage.${stage === "done" ? "checks" : stage}`)}
        </p>
        <h2 className="page-title mt-2 text-3xl">{ru ? dialogue.titleRu : dialogue.title}</h2>
        <p className="sl-run__scene">{ru ? dialogue.sceneRu : dialogue.scene}</p>
      </header>

      {stage === "read" && (
        <>
          <div className="sl-dialogue">
            {dialogue.lines.map((line, i) => (
              <p key={i} className={line.who === 0 ? "sl-line sl-line--a" : "sl-line sl-line--b"}>
                <span className="sl-line__who">{dialogue.cast[line.who]}</span>
                <span className="sl-line__text">
                  {parseLine(line.text).map((piece, j) =>
                    piece.ref ? (
                      <button
                        key={j}
                        type="button"
                        className={open === piece.ref ? "sl-mark is-open" : "sl-mark"}
                        onClick={() => setOpen(open === piece.ref ? null : piece.ref!)}
                      >
                        {piece.text}
                      </button>
                    ) : (
                      <span key={j}>{piece.text}</span>
                    ),
                  )}
                </span>
              </p>
            ))}
          </div>

          <p className="sl-hint">{t("slangModule.tapHint")}</p>

          <button type="button" className="btn btn--primary mt-6" onClick={() => setStage("checks")}>
            {t("slangModule.toChecks")}
          </button>
        </>
      )}

      {(stage === "checks" || stage === "done") && (
        <div className="sl-checks">
          {dialogue.checks.map((check, i) => {
            const given = answers[i];
            return (
              <section key={i} className="sl-check">
                <p className="sl-check__text">{check.text}</p>
                <p className="sl-check__q">{check.question}</p>

                <div className="sl-check__options">
                  {check.options.map((option, j) => {
                    let className = "sl-option";
                    if (given !== null) {
                      if (j === check.answer) className += " is-right";
                      else if (j === given) className += " is-wrong";
                    }
                    return (
                      <button
                        key={j}
                        type="button"
                        className={className}
                        onClick={() => answer(i, j)}
                        disabled={given !== null}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* The explanation appears whether the answer was right or
                    wrong: a lucky guess deserves the reason as much as a miss. */}
                {given !== null && <p className="sl-check__why">{check.why}</p>}
              </section>
            );
          })}

          {stage === "checks" && answered < dialogue.checks.length && (
            <p className="sl-hint">
              {t("slangModule.remaining", { count: dialogue.checks.length - answered })}
            </p>
          )}

          {stage === "done" && (
            <div className="sl-done">
              <p className="page-title text-2xl">
                {t("slangModule.score", { correct, total: dialogue.checks.length })}
              </p>
              <p className="sl-hint">{t("slangModule.saveAllBody", { count: dialogue.expressions.length })}</p>
              <div className="sl-done__actions">
                <button type="button" className="btn btn--primary" onClick={saveAll}>
                  {t("slangModule.saveAll")}
                </button>
                <button type="button" className="btn btn--ghost" onClick={onExit}>
                  {t("slangModule.backToList")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {opened && <ExpressionPanel expression={opened} onClose={() => setOpen(null)} />}
    </div>
  );
}
