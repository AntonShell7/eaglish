import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Step, TrackLesson, TrackModule } from "@/data/track";
import { judgeTypedAnswer } from "@/lib/trackAnswer";
import { assemblyTokens, sameAssembly } from "@/lib/assembly";
import { finishLesson, resurfacedSteps } from "@/lib/trackProgress";
import "./track.css";

/**
 * One lesson, one screen at a time.
 *
 * The frame is a thin rule filling along the top, one question holding the
 * screen, and a footer that answers it. What is deliberately not here is the
 * quiz-template furniture that came with the first draft: a tick in a green
 * circle, the whole footer flooding with colour, a red button, and a shake on
 * a wrong answer. Those are the gestures of a free game, and this is a thing
 * somebody paid for. A hairline changing colour and three characters of small
 * capitals say the same word with none of the noise — and the sentence under
 * them, set in the caption face with a measure, is the part that teaches.
 *
 * What is being taught has no pictures. "brb" does not look like anything, so
 * in place of Duolingo's picture there are two formats that are ours: the
 * expression quoted inside a real exchange, and the question of which room it
 * belongs in, which is the mistake people in this register actually make.
 */

type Judged = "right" | "wrong" | null;

interface Props {
  module: TrackModule;
  lesson: TrackLesson;
  onExit: () => void;
}

export function LessonPlayer({ module, lesson, onExit }: Props) {
  const { t } = useTranslation();

  /*
   * The running order, built once.
   *
   * Steps from several lessons ago are mixed in here rather than added at the
   * end, and nothing on screen says they are revision. The effect depends on
   * an old expression turning up unannounced in the middle of a new lesson —
   * "wait, that was four lessons ago" — which an announced revision block
   * cannot produce. A review lesson is exempt: it is already all revision.
   */
  const steps = useMemo<Step[]>(() => {
    if (lesson.review) return lesson.steps;
    const back = resurfacedSteps(lesson.id);
    if (back.length === 0) return lesson.steps;
    const out = [...lesson.steps];
    let at = out.findIndex((step) => step.kind !== "rule" && step.kind !== "chat") + 1;
    for (const step of back) {
      at = Math.min(at + 2, out.length);
      out.splice(at, 0, step);
    }
    return out;
  }, [lesson]);

  const asked = steps.filter((step) => step.kind !== "rule" && step.kind !== "chat").length;

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [judged, setJudged] = useState<Judged>(null);
  const [checking, setChecking] = useState(false);
  const [over, setOver] = useState(false);

  const step = steps[index];
  const last = index >= steps.length - 1;
  /* How many questions are behind us. The header used to divide by the number
     of screens while the result divided by the number of questions, so one
     lesson was two different lengths depending which end you read. */
  const answered = steps
    .slice(0, index + (judged ? 1 : 0))
    .filter((s) => s.kind !== "rule" && s.kind !== "chat").length;

  /** Per-step answer state. Each exercise owns its own shape. */
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [assembled, setAssembled] = useState<number[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [missedPair, setMissedPair] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Record<number, boolean>>({});

  const fieldRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const advancing = useRef(false);

  useEffect(() => {
    setPicked(null);
    setTyped("");
    setAssembled([]);
    setJoined([]);
    setLeftPick(null);
    setMissedPair([]);
    setRooms({});
    setJudged(null);
    const headingTimer = window.setTimeout(() => {
      const heading = stageRef.current?.querySelector<HTMLElement>("h2");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }, index === 0 ? 0 : 260);
    // A phone keyboard should open only after an intentional tap on the field.
    const desktop = window.matchMedia("(min-width: 761px) and (pointer: fine)").matches;
    const timer = step && desktop && (step.kind === "type" || step.kind === "gap")
      ? window.setTimeout(() => fieldRef.current?.focus(), 360)
      : null;
    return () => {
      window.clearTimeout(headingTimer);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [index, step]);

  useEffect(() => {
    if (judged) nextRef.current?.focus({ preventScroll: true });
  }, [judged]);

  useEffect(() => () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
  }, []);

  /* ── pairs judge themselves as they are played ─────────────────────────── */

  const matchPairs = step?.kind === "match" ? step.pairs : [];
  const rightColumn = useMemo(
    () => (step?.kind === "match" ? shuffled([...new Set(step.pairs.map(([, b]) => b))], step.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.kind === "match" ? step.id : null],
  );

  const tileBank = useMemo(
    () => step?.kind === "assemble"
      ? shuffled(assemblyTokens(step.answers[0]).map((text, id) => ({ id, text })), step.id)
      : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.kind === "assemble" ? step.id : null],
  );

  const addTile = (id: number) => {
    if (assembled.includes(id)) return;
    const next = tileBank.find((tile) => tile.id !== id && !assembled.includes(tile.id));
    setAssembled((was) => [...was, id]);
    window.requestAnimationFrame(() => {
      const selector = next ? `[data-bank-tile="${next.id}"]` : `[data-placed-tile="${id}"]`;
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
    });
  };
  const removeTile = (id: number) => {
    setAssembled((was) => was.filter((tileId) => tileId !== id));
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-bank-tile="${id}"]`)?.focus({ preventScroll: true });
    });
  };

  /* Joined stores left expressions only. Several expressions may share one
     translation (thx and tq both mean «спасибо»), and the same right card must
     stay available until every matching left expression has used it. */
  const tapRight = (value: string) => {
    if (!leftPick || joined.includes(leftPick)) return;
    const pair = matchPairs.find(([a]) => a === leftPick);
    if (pair && pair[1] === value) {
      setJoined((was) => [...was, leftPick]);
      setMissedPair([]);
    } else {
      setMissedPair([leftPick, value]);
      window.setTimeout(() => setMissedPair([]), 420);
    }
    setLeftPick(null);
  };

  /* ── can this be checked, and is it right ──────────────────────────────── */

  const ready = (() => {
    if (!step) return false;
    switch (step.kind) {
      case "rule":
      case "chat":
        return true;
      case "choice":
        return picked !== null;
      case "match":
        return joined.length === matchPairs.length;
      case "type":
      case "gap":
        return typed.trim().length > 0;
      case "assemble":
        return tileBank.length > 0 && assembled.length === tileBank.length;
      case "register":
        return true;
    }
  })();

  const correct = useCallback(async (): Promise<boolean> => {
    if (!step) return false;
    switch (step.kind) {
      case "rule":
      case "chat":
      case "match":
        return true;
      case "choice":
        return picked === step.answer;
      case "type":
      case "gap":
        return judgeTypedAnswer(step, typed);
      case "assemble": {
        const selected = assembled.map((id) => tileBank.find((tile) => tile.id === id)?.text ?? "");
        return step.answers.some((answer) => sameAssembly(selected, answer));
      }
      case "register":
        return step.rooms.every((room, i) => (rooms[i] === true) === room.ok);
    }
  }, [step, picked, typed, assembled, tileBank, rooms]);

  const advanceRef = useRef<(() => void) | null>(null);

  const check = useCallback(async () => {
    if (!ready || judged || checking || advancing.current) return;
    if (step.kind === "rule" || step.kind === "chat") {
      advanceRef.current?.();
      return;
    }
    setChecking(true);
    try {
      const ok = await correct();
      setJudged(ok ? "right" : "wrong");
    } finally {
      setChecking(false);
    }
  }, [ready, judged, checking, step, correct]);

  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    if (last) {
      finishLesson(lesson);
      setOver(true);
      return;
    }
    const move = () => {
      setIndex((was) => was + 1);
      setLeaving(false);
      advancing.current = false;
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      move();
      return;
    }
    setLeaving(true);
    advanceTimer.current = window.setTimeout(move, 240);
  }, [last, lesson]);

  advanceRef.current = advance;

  /* Keyboard shortcuts never steal Enter or Space from a focused button. */
  useEffect(() => {
    if (over) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === "Enter") {
        if (target?.closest("button, a, textarea, select, [contenteditable=true]")) return;
        event.preventDefault();
        if (judged) advance();
        else check();
        return;
      }
      if (judged || !step || target?.closest("input, textarea, select, [contenteditable=true]")) return;
      const n = Number(event.key);
      if (!Number.isNaN(n) && n >= 1 && step.kind === "choice" && n <= step.options.length) {
        setPicked(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, judged, step, advance, check]);

  if (over) {
    return (
      <div className="tk-done">
        <div className="tk-done__confetti" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => <span key={i} />)}
        </div>
        <div className="tk-done__card">
          <div className="tk-done__mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 33l11 11 23-25" />
            </svg>
          </div>
          <span className="tk-done__h">{t("track.finish")}</span>
          <h2 className="tk-done__title">{t("track.finishTitle")}</h2>
          <p className="tk-done__lesson">{lesson.titleRu}</p>
          <p className="tk-done__p">{t("track.finishNote")}</p>
          <button type="button" className="tk-press tk-go tk-done__go" onClick={onExit} autoFocus>
            <span>{t("track.next")}</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="tk-player">
      <h1 className="tk-sr-only">{lesson.titleRu}</h1>
      <div className="tk-top">
        <button type="button" className="tk-leave" onClick={onExit}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {t("track.toPath")}
        </button>
        <span className="tk-where">{lesson.titleRu}</span>
        <span className="tk-count">
          {Math.min(answered + 1, asked)} / {asked}
        </span>
        <div
          className="tk-bar"
          role="progressbar"
          aria-label={lesson.titleRu}
          aria-valuemin={0}
          aria-valuemax={asked}
          aria-valuenow={answered}
        >
          <div
            className="tk-bar__fill"
            style={{ width: `${(answered / Math.max(asked, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div ref={stageRef} className={`tk-stage ${leaving ? "tk-out" : "tk-in"}`} key={index} inert={checking || leaving}>
        <span className="tk-kicker">{t(`track.kind.${step.kind}`)}</span>
        <div className="tk-stage__in">
        <StepBody
          step={step}
          judged={judged}
          picked={picked}
          setPicked={setPicked}
          typed={typed}
          setTyped={setTyped}
          tiles={tileBank}
          assembled={assembled}
          addTile={addTile}
          removeTile={removeTile}
          joined={joined}
          leftPick={leftPick}
          setLeftPick={setLeftPick}
          missedPair={missedPair}
          tapRight={tapRight}
          rightColumn={rightColumn}
          rooms={rooms}
          setRooms={setRooms}
          fieldRef={fieldRef}
          tone={module.tone}
        />
        </div>
      </div>

      <Foot judged={judged} ready={ready} checking={checking} step={step} onCheck={check} onNext={advance} last={last} nextRef={nextRef} />
    </div>
  );
}

/* ── the verdict ─────────────────────────────────────────────────────────── */

function Foot({
  judged,
  ready,
  checking,
  step,
  onCheck,
  onNext,
  last,
  nextRef,
}: {
  judged: Judged;
  ready: boolean;
  checking: boolean;
  step: Step;
  onCheck: () => void;
  onNext: () => void;
  last: boolean;
  nextRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useTranslation();
  const silent = step.kind === "rule" || step.kind === "chat";

  if (!judged) {
    return (
      <div className="tk-foot">
        <div className="tk-foot__in">
          <span className="tk-foot__said" />
          <button
            type="button"
            className="tk-press tk-go"
            disabled={!ready || checking}
            aria-busy={checking}
            onClick={onCheck}
          >
            {checking ? "Проверяю…" : silent ? t("track.gotIt") : t("track.check")}
          </button>
        </div>
      </div>
    );
  }

  const why = whyOf(step, judged);

  return (
    <div className={`tk-foot tk-foot--${judged}`} role="status" aria-live="polite" aria-atomic="true">
      <div className="tk-foot__in">
        <span className="tk-foot__mark">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {judged === "right" ? <path d="M5 13l4 4L19 7" /> : <path d="M7 7l10 10M17 7L7 17" />}
          </svg>
        </span>
        <span className="tk-foot__said">
          <span className="tk-foot__h">
            {judged === "right" ? t("track.right") : t("track.wrong")}
          </span>
          {why && <span className="tk-foot__why">{why}</span>}
        </span>
        <button ref={nextRef} type="button" className="tk-press tk-go" onClick={onNext}>
          {last ? t("track.finishBtn") : t("track.next")}
        </button>
      </div>
    </div>
  );
}

/** Typed and assembled answers always show the canonical written form. */
function whyOf(step: Step, _judged: Judged): string | null {
  switch (step.kind) {
    case "choice":
    case "register":
      return step.whyRu;
    case "type":
    case "gap":
    case "assemble":
      return `Правильный вариант: ${step.answers[0]}`;
    default:
      return null;
  }
}

/* ── one body per kind ───────────────────────────────────────────────────── */

/** A stable deal: a re-render must never move answers under the cursor. */
function shuffled<T>(values: T[], id: string): T[] {
  let seed = 0;
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface BodyProps {
  step: Step;
  judged: Judged;
  picked: number | null;
  setPicked: (n: number) => void;
  typed: string;
  setTyped: (s: string) => void;
  tiles: { id: number; text: string }[];
  assembled: number[];
  addTile: (id: number) => void;
  removeTile: (id: number) => void;
  joined: string[];
  leftPick: string | null;
  setLeftPick: (s: string | null) => void;
  missedPair: string[];
  tapRight: (s: string) => void;
  rightColumn: string[];
  rooms: Record<number, boolean>;
  setRooms: (f: (was: Record<number, boolean>) => Record<number, boolean>) => void;
  fieldRef: React.RefObject<HTMLInputElement | null>;
  tone: TrackModule["tone"];
}

function StepBody(p: BodyProps) {
  const { t } = useTranslation();
  const { step, judged } = p;

  switch (step.kind) {
    case "rule":
      return (
        <div className="tk-rule">
          <h2 className="tk-rule__h">{step.titleRu}</h2>
          {step.bodyRu.split("\n\n").map((para) => (
            <p className="tk-rule__p" key={para.slice(0, 24)}>
              {para}
            </p>
          ))}
          {step.forms && (
            <div className="tk-forms">
              {step.forms.map((form) => (
                <div className="tk-form" key={form.short}>
                  <span className="tk-form__short">{form.short}</span>
                  <span className="tk-form__long">
                    {form.long}
                    {form.fullForm && <span className="tk-form__full">{form.fullForm}</span>}
                    {form.noteRu && <span className="tk-form__note">{form.noteRu}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "chat":
      return (
        <>
          <h2 className="tk-ask">{step.titleRu}</h2>
          {/* The window itself, because recognising the window is half of why
              the expression lands. What it does not have is a gradient avatar
              or a hardcoded "online" — those were somebody else's interface
              and the second one was not even true. */}
          <div className="tk-thread">
            <div className="tk-thread__top">
              <span className="tk-thread__face">{step.withWhom.slice(0, 1)}</span>
              <span>
                <span className="tk-thread__who">{step.withWhom}</span>
                <span className="tk-thread__sub">{t("track.threadSub")}</span>
              </span>
            </div>
            <div className="tk-thread__body">
              {step.lines.map((line, i) => (
                <div
                  className={`tk-msg${line.me ? " tk-msg--me" : ""}${
                    i > 0 && Boolean(step.lines[i - 1].me) !== Boolean(line.me) ? " tk-msg--turn" : ""
                  }`}
                  key={i}
                >
                  <span
                    className="tk-msg__bubble"
                    style={{ animationDelay: `${0.12 + i * 0.16}s` }}
                  >
                    {line.text}
                  </span>
                  <span className="tk-msg__at">{line.at}</span>
                  {line.glossRu && <span className="tk-msg__gloss">{line.glossRu}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      );

    case "choice":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          {step.quote && <p className="tk-quote">{step.quote}</p>}
          <div className="tk-opts">
            {step.options.map((option, i) => {
              let state = "";
              if (judged) {
                if (i === step.answer) state = " tk-opt--right";
                else if (i === p.picked) state = " tk-opt--miss";
              } else if (i === p.picked) state = " tk-opt--on";
              return (
                <button
                  type="button"
                  key={option}
                  className={`tk-press tk-opt${state}`}
                  disabled={judged !== null}
                  onClick={() => p.setPicked(i)}
                >
                  <span className="tk-opt__n">{i + 1}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </>
      );

    case "match":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          <div className="tk-pairs">
            <div>
              {step.pairs.map(([left]) => (
                <button
                  type="button"
                  key={left}
                  className={`tk-press tk-pair${
                    p.joined.includes(left)
                      ? " tk-pair--done"
                      : p.missedPair.includes(left)
                        ? " tk-pair--miss"
                        : p.leftPick === left
                          ? " tk-pair--on"
                          : ""
                  }`}
                  disabled={p.joined.includes(left)}
                  onClick={() => p.setLeftPick(left)}
                >
                  {left}
                </button>
              ))}
            </div>
            <div>
              {p.rightColumn.map((value) => {
                const done = step.pairs
                  .filter(([, right]) => right === value)
                  .every(([left]) => p.joined.includes(left));
                return (
                  <button
                    type="button"
                    key={value}
                    className={`tk-press tk-pair${
                      done
                        ? " tk-pair--done"
                        : p.missedPair.includes(value)
                          ? " tk-pair--miss"
                          : ""
                    }`}
                    disabled={done}
                    onClick={() => p.tapRight(value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      );

    case "type":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          {step.quote && <p className="tk-quote">{step.quote}</p>}
          <input
            ref={p.fieldRef}
            className="tk-field"
            value={p.typed}
            disabled={judged !== null}
            placeholder={step.hint ? `${step.hint}…` : t("track.typeHere")}
            aria-label={step.promptRu}
            onChange={(event) => p.setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </>
      );

    case "assemble":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          <p className="tk-quote">{step.quote}</p>
          <div className="tk-builder">
            <div
              className={`tk-build-answer${judged ? ` tk-build-answer--${judged}` : ""}`}
              role="group"
              aria-label="Твоё предложение"
            >
              {p.assembled.length === 0 && (
                <span className="tk-build-answer__empty">Здесь появится твоё предложение</span>
              )}
              {p.assembled.map((id, position) => {
                const tile = p.tiles.find((item) => item.id === id);
                if (!tile) return null;
                return (
                  <button
                    type="button"
                    key={id}
                    data-placed-tile={id}
                    className="tk-press tk-tile tk-tile--placed"
                    style={{ animationDelay: `${Math.min(position * 35, 280)}ms` }}
                    disabled={judged !== null}
                    onClick={() => p.removeTile(id)}
                    aria-label={`Убрать слово ${tile.text}`}
                  >
                    {tile.text}
                  </button>
                );
              })}
            </div>
            <p className="tk-builder__hint">Нажимай на слова по порядку. Ошибся — нажми на слово выше, чтобы вернуть его.</p>
            <div className="tk-bank" role="group" aria-label="Слова для предложения">
              {p.tiles.map((tile) => p.assembled.includes(tile.id) ? (
                <span className="tk-tile-slot" key={tile.id} aria-hidden="true">{tile.text}</span>
              ) : (
                <button
                  type="button"
                  key={tile.id}
                  data-bank-tile={tile.id}
                  className="tk-press tk-tile"
                  disabled={judged !== null}
                  onClick={() => p.addTile(tile.id)}
                  aria-label={`Добавить слово ${tile.text}`}
                >
                  {tile.text}
                </button>
              ))}
            </div>
          </div>
        </>
      );

    case "gap":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          <p className="tk-quote tk-gap__context">
            <span>Перевод всего предложения</span>
            {step.quote}
          </p>
          <p className="tk-gap">
            <span>{step.before}</span>
            <input
              ref={p.fieldRef}
              value={p.typed}
              disabled={judged !== null}
              onChange={(event) => p.setTyped(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-label={step.promptRu}
              style={{ width: `${Math.min(34, Math.max(7, ...step.answers.map((answer) => answer.length + 2)))}ch` }}
            />
            <span>{step.after}</span>
          </p>
        </>
      );

    case "register":
      return (
        <>
          <h2 className="tk-ask">{t("track.roomsAsk", { phrase: step.phrase })}</h2>
          {/* One tick per room, not a tick and a cross. Two buttons a row was
              eight taps for a four-line question, and it made the learner
              state the obvious half as explicitly as the interesting half. */}
          <div className="tk-rooms">
            {step.rooms.map((room, i) => {
              const ticked = p.rooms[i] === true;
              let state = ticked ? " tk-room--on" : "";
              if (judged) state += ticked === room.ok ? " tk-room--right" : " tk-room--miss";
              return (
                <button
                  type="button"
                  className={`tk-press tk-room${state}`}
                  key={room.labelRu}
                  aria-pressed={ticked}
                  disabled={judged !== null}
                  onClick={() => p.setRooms((was) => ({ ...was, [i]: !was[i] }))}
                >
                  <span className="tk-room__box" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{room.labelRu}</span>
                </button>
              );
            })}
          </div>
        </>
      );
  }
}
