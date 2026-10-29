import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Step, TrackLesson, TrackModule } from "@/data/track";
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
  const [right, setRight] = useState(0);
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
  const [built, setBuilt] = useState<number[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Record<number, boolean>>({});

  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPicked(null);
    setTyped("");
    setBuilt([]);
    setJoined([]);
    setLeftPick(null);
    setRooms({});
    setJudged(null);
    if (step && (step.kind === "type" || step.kind === "gap")) {
      window.setTimeout(() => fieldRef.current?.focus(), 60);
    }
  }, [index, step]);

  /* ── pairs judge themselves as they are played ─────────────────────────── */

  const matchPairs = step?.kind === "match" ? step.pairs : [];
  /*
   * Shuffled from the step's id, and memoised on the id rather than on the
   * pairs. Both halves of that are the same bug found twice: `step.pairs` is a
   * fresh array every render, so a memo keyed on it is no memo, and a random
   * shuffle inside it re-dealt the column on every keystroke — the answers
   * moved under the cursor mid-game.
   */
  const rightColumn = useMemo(
    () => (step?.kind === "match" ? shuffled(step.pairs.map(([, b]) => b), step.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.kind === "match" ? step.id : null],
  );

  const tapRight = (value: string) => {
    if (!leftPick || joined.includes(value)) return;
    const pair = matchPairs.find(([a]) => a === leftPick);
    if (pair && pair[1] === value) setJoined((was) => [...was, leftPick, value]);
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
        return joined.length === matchPairs.length * 2;
      case "assemble":
        return built.length > 0;
      case "type":
      case "gap":
        return typed.trim().length > 0;
      case "register":
        /* Leaving a row alone means "not here", so there is nothing to wait
           for. Requiring at least one tick would itself be a hint. */
        return true;
    }
  })();

  /** Loose on purpose: case, spacing and a trailing stop are not the skill. */
  const same = (a: string, b: string) =>
    a.trim().toLowerCase().replace(/[.!?,]+$/, "").replace(/\s+/g, " ") ===
    b.trim().toLowerCase().replace(/[.!?,]+$/, "").replace(/\s+/g, " ");

  const correct = (): boolean => {
    if (!step) return false;
    switch (step.kind) {
      case "rule":
      case "chat":
      case "match":
        return true;
      case "choice":
        return picked === step.answer;
      case "assemble": {
        const tiles = assembleTiles(step);
        return same(built.map((i) => tiles[i]).join(" "), step.answer.join(" "));
      }
      case "type":
      case "gap":
        return step.answers.some((answer) => same(typed, answer));
      case "register":
        return step.rooms.every((room, i) => (rooms[i] === true) === room.ok);
    }
  };

  /* check() turns the page itself on the screens that ask nothing, and advance
     is declared below it. A ref rather than a reorder, because moving advance
     above check would only move the same problem the other way. */
  const advanceRef = useRef<(() => void) | null>(null);

  const check = useCallback(() => {
    if (!ready || judged) return;
    /* A rule and a thread asked nothing, so there is nothing to mark. They
       used to run through the same path, and the footer congratulated the
       learner for reading — which also counted, so a six-question lesson
       could end eight correct out of six. */
    if (step.kind === "rule" || step.kind === "chat") {
      advanceRef.current?.();
      return;
    }
    const ok = correct();
    if (ok) setRight((was) => was + 1);
    setJudged(ok ? "right" : "wrong");
  }, [ready, judged, step, picked, typed, built, joined, rooms]);

  const advance = useCallback(() => {
    if (last) {
      finishLesson(lesson);
      setOver(true);
      return;
    }
    /* The outgoing screen is given its exit before the incoming one is built.
       Without the pause they cross-fade in place, which looks like a flicker
       rather than a turn of the page. */
    setLeaving(true);
    window.setTimeout(() => {
      setIndex((was) => was + 1);
      setLeaving(false);
    }, 180);
  }, [last, lesson]);

  advanceRef.current = advance;

  /* Enter checks, then Enter continues; number keys pick an option. The whole
     lesson is playable without the mouse, which is how anybody doing one every
     evening will end up playing it. */
  useEffect(() => {
    if (over) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (judged) advance();
        else check();
        return;
      }
      if (judged || !step) return;
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
        <div className="tk-done__n">
          {right}
          <span className="tk-done__of">/{asked}</span>
        </div>
        <span className="tk-done__h">{t("track.finish")}</span>
        <p className="tk-done__p">{lesson.titleRu}</p>
        <button type="button" className="tk-press tk-go" onClick={onExit}>
          {t("track.toPath")}
        </button>
      </div>
    );
  }

  if (!step) return null;

  return (
    <div className="tk-player">
      {/* Back, where you are, how far in — and the bar as the rule under all
          three. The learner used to have none of this: the player drops the
          page hero, so without a title here there was nothing on screen
          saying which lesson was open. */}
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
        <div className="tk-bar">
          <div
            className="tk-bar__fill"
            style={{ width: `${(answered / Math.max(asked, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className={`tk-stage ${leaving ? "tk-out" : "tk-in"}`} key={index}>
        <span className="tk-kicker">{t(`track.kind.${step.kind}`)}</span>
        <div className="tk-stage__in">
        <StepBody
          step={step}
          judged={judged}
          picked={picked}
          setPicked={setPicked}
          typed={typed}
          setTyped={setTyped}
          built={built}
          setBuilt={setBuilt}
          joined={joined}
          leftPick={leftPick}
          setLeftPick={setLeftPick}
          tapRight={tapRight}
          rightColumn={rightColumn}
          rooms={rooms}
          setRooms={setRooms}
          fieldRef={fieldRef}
          tone={module.tone}
        />
        </div>
      </div>

      <Foot judged={judged} ready={ready} step={step} onCheck={check} onNext={advance} last={last} />
    </div>
  );
}

/* ── the verdict ─────────────────────────────────────────────────────────── */

function Foot({
  judged,
  ready,
  step,
  onCheck,
  onNext,
  last,
}: {
  judged: Judged;
  ready: boolean;
  step: Step;
  onCheck: () => void;
  onNext: () => void;
  last: boolean;
}) {
  const { t } = useTranslation();
  const silent = step.kind === "rule" || step.kind === "chat";

  if (!judged) {
    return (
      <div className="tk-foot">
        <div className="tk-foot__in">
          <span className="tk-foot__said" />
          <button type="button" className="tk-press tk-go" disabled={!ready} onClick={onCheck}>
            {silent ? t("track.gotIt") : t("track.check")}
          </button>
        </div>
      </div>
    );
  }

  const why = whyOf(step, judged);

  return (
    <div className={`tk-foot tk-foot--${judged}`}>
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
        {/* The same ink button, whatever the verdict. A red "continue" marks
            the way forward as an error, and it is not one. */}
        <button type="button" className="tk-press tk-go" onClick={onNext}>
          {last ? t("track.finishBtn") : t("track.next")}
        </button>
      </div>
    </div>
  );
}

/**
 * What is said under the verdict.
 *
 * A wrong answer always gets the right one, because the worst thing a drill
 * can do is mark somebody wrong and move on. A right answer gets the
 * explanation only where there is one worth reading — praise with nothing
 * under it teaches people to stop reading the footer.
 */
function whyOf(step: Step, judged: Judged): string | null {
  switch (step.kind) {
    case "choice":
    case "register":
      return step.whyRu;
    case "assemble":
      return judged === "wrong" ? step.answer.join(" ") : null;
    case "type":
    case "gap":
      return judged === "wrong" ? step.answers[0] : null;
    default:
      return null;
  }
}

/* ── one body per kind ───────────────────────────────────────────────────── */

/**
 * Shuffle, the same way every time for a given step.
 *
 * Seeded from the step id rather than from Math.random, so a re-render — and
 * there is one on every keystroke — cannot deal the tiles again underneath
 * the hand that is using them.
 */
function shuffled(values: string[], id: string): string[] {
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

/** The bank for an assemble step: the answer plus its distractors. */
function assembleTiles(step: Extract<Step, { kind: "assemble" }>): string[] {
  return shuffled([...step.answer, ...step.extra], step.id);
}

interface BodyProps {
  step: Step;
  judged: Judged;
  picked: number | null;
  setPicked: (n: number) => void;
  typed: string;
  setTyped: (s: string) => void;
  built: number[];
  setBuilt: (f: (was: number[]) => number[]) => void;
  joined: string[];
  leftPick: string | null;
  setLeftPick: (s: string | null) => void;
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
              {p.rightColumn.map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`tk-press tk-pair${p.joined.includes(value) ? " tk-pair--done" : ""}`}
                  disabled={p.joined.includes(value)}
                  onClick={() => p.tapRight(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </>
      );

    case "assemble": {
      const tiles = assembleTiles(step);
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
          {step.quote && <p className="tk-quote">{step.quote}</p>}
          <div className="tk-line">
            {p.built.map((tileIndex, slot) => (
              <button
                type="button"
                key={`${tileIndex}-${slot}`}
                className="tk-press tk-tile"
                disabled={judged !== null}
                onClick={() => p.setBuilt((was) => was.filter((_, i) => i !== slot))}
              >
                {tiles[tileIndex]}
              </button>
            ))}
          </div>
          <div className="tk-bank">
            {tiles.map((tile, i) => (
              <button
                type="button"
                key={`${tile}-${i}`}
                className={`tk-press tk-tile${p.built.includes(i) ? " tk-tile--spent" : ""}`}
                disabled={p.built.includes(i) || judged !== null}
                onClick={() => p.setBuilt((was) => [...was, i])}
              >
                {tile}
              </button>
            ))}
          </div>
        </>
      );
    }

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
            onChange={(event) => p.setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </>
      );

    case "gap":
      return (
        <>
          <h2 className="tk-ask">{step.promptRu}</h2>
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
