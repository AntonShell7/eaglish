import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isArabic } from "@/i18n/content";
import { dialogueReplyOrder } from "@/lib/dialogueFill";
import type { DialogueFillStep } from "@/data/trackModel";

export function DialogueFill({ step, selected, onChange, judged }: {
  step: DialogueFillStep;
  selected: number[];
  onChange: (value: number[]) => void;
  judged: "right" | "wrong" | null;
}) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(() => step.replies.findIndex((_, i) => selected[i] == null || selected[i] < 0));
  const order = useMemo(() => dialogueReplyOrder(step), [step]);
  const bank = useRef<HTMLDivElement>(null);
  const gaps = useRef<(HTMLButtonElement | null)[]>([]);
  const choose = (id: number) => {
    if (judged || active < 0 || selected.includes(id)) return;
    const next = step.replies.map((_, i) => i === active ? id : selected[i] ?? -1);
    onChange(next);
    const empty = next.findIndex(value => value < 0);
    setActive(empty);
    if (empty >= 0) gaps.current[empty]?.focus({ preventScroll: true });
  };

  return <div className="tk-dialogue-fill">
    <h2 className="tk-ask">{t("track.dialogueFill.title")}</h2>
    {!judged && <p className="tk-dialogue-fill__hint">{t("track.dialogueFill.hint")}</p>}
    <p className="tk-dialogue-fill__scene" dir="auto" lang={isArabic() ? "ar" : "ru"}>{step.sceneRu}</p>
    <div className="tk-thread" lang="en" dir="ltr">
      <div className="tk-thread__body">
        {step.lines.map((line, index) => {
          const gap = line.gap;
          const answer = gap === undefined ? undefined : selected[gap];
          const filled = answer !== undefined && answer >= 0;
          const correct = gap !== undefined && answer === gap;
          const expression = gap === undefined ? "" : step.replies[gap];
          const start = gap === undefined ? -1 : line.text.indexOf(expression);
          return <div key={index} className={`tk-msg${line.me ? " tk-msg--me" : ""} tk-msg--turn`}>
            <span className="tk-dialogue-fill__speaker">{line.me ? "Alex" : "Sam"}</span>
            {gap === undefined ? <span className="tk-msg__bubble">{line.text}</span> : <div className="tk-msg__bubble">
              {line.text.slice(0, start)}
              <button type="button" ref={el => { gaps.current[gap] = el; }}
                className={`tk-dialogue-fill__gap${active === gap && !judged ? " is-active" : ""}${judged ? correct ? " is-right" : " is-wrong" : ""}`}
                aria-label={t("track.dialogueFill.gap", { number: gap + 1 }) + (filled ? `: ${step.replies[answer]}` : "")}
                aria-pressed={active === gap} disabled={Boolean(judged)}
                onClick={() => {
                  setActive(gap);
                  if (filled) onChange(step.replies.map((_, i) => i === gap ? -1 : selected[i] ?? -1));
                  requestAnimationFrame(() => bank.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true }));
                }}>
                <span className="tk-dialogue-fill__number" aria-hidden="true">{gap + 1}</span>
                <span>{filled ? step.replies[answer] : "…"}</span>
                {filled && !judged && <span aria-hidden="true">×</span>}
              </button>
              {line.text.slice(start + expression.length)}
              {judged && !correct && <p className="tk-dialogue-fill__correction">✓ {step.replies[gap]}</p>}
            </div>}
            {(gap === undefined || judged) && <details className="tk-dialogue-fill__translation" dir="auto">
              <summary lang={i18n.language}>{t("track.dialogueFill.translation")}</summary>
              <p dir="auto" lang={isArabic() ? "ar" : "ru"}>{line.glossRu}</p>
            </details>}
          </div>;
        })}
      </div>
    </div>
    {!judged && <div className="tk-dialogue-fill__bank" ref={bank} role="group" aria-label={t("track.dialogueFill.bank")}>
      <p className="tk-dialogue-fill__hint" aria-live="polite">{active >= 0 ? t("track.dialogueFill.choose", { number: active + 1 }) : t("track.dialogueFill.ready")}</p>
      {order.map(id => <button type="button" key={id} lang="en" dir="ltr"
        className="tk-dialogue-fill__tile" disabled={selected.includes(id) || active < 0}
        onClick={() => choose(id)}>{step.replies[id]}</button>)}
    </div>}
  </div>;
}
