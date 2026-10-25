import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Step, TrackLesson, TrackModule } from "@/data/track";
import { finishLesson, resurfacedSteps } from "@/lib/trackProgress";
import "./track.css";

/**
 * One lesson, one screen at a time.
 *
 * The shape is Duolingo's because Duolingo's shape is right: a thin progress
 * bar, one question filling the screen, and a footer that answers it. What is
 * different is what is being taught. Duolingo drills words and can show a
 * picture; nothing here has a picture, because "brb" does not look like
 * anything. The pictures are replaced by the place the expression lives — a
 * messenger thread — and by the question of which room you can say it in,
 * which is the mistake learners of this register actually make.
 *
 * Every screen judges the same way: the footer slides up, says right or wrong
 * and why, and the same button that checked now continues. One button in one
 * place for both jobs, so the hand never has to look for it.
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
   * Steps the learner saw several lessons ago are mixed in here rather than
   * added at the end, and nothing on screen says they are revision. The whole
   * effect depends on an old expression turning up unannounced in the middle
   * of a new lesson — "wait, that was four lessons ago" — which an announced
   * revision block cannot produce. A review lesson is exempt: it is already
   * all revision.
   */
  const steps = useMemo<Step[]>(() => {
    if (lesson.review) return lesson.steps;
    const back = resurfacedSteps(lesson.id);
    if (back.length === 0) return lesson.steps;
    const out = [...lesson.steps];
    // After the teaching is done, before the lesson's own drilling ends.
    let at = out.findIndex((step) => step.kind !== "rule" && step.kind !== "chat") + 1;
    for (const step of back) {
      at = Math.min(at + 2, out.length);
      out.splice(at, 0, step);
    }
    return out;
  }, [lesson]);

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [judged, setJudged] = useState<Judged>(null);
  const [right, setRight] = useState(0);
  const [over, setOver] = useState(false);

  const step = steps[index];
  const last = index >= steps.length - 1;

  /** Reset per-step answer state. Each exercise owns its own shape. */
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [built, setBuilt] = useState<number[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
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
    // A step that wants typing should not also want a click on the field.
    if (step && (step.kind === "type" || step.kind === "gap")) {
      window.setTimeout(() => fieldRef.current?.focus(), 60);
    }
  }, [index, step]);

  /* ── the pairs game judges itself as you play ──────────────────────────── */

  const matchPairs = step?.kind === "match" ? step.pairs : [];
  /*
   * The right-hand column, shuffled from the step's id rather than from
   * Math.random, and memoised on the id rather than on the pairs.
   *
   * Both of those are the same bug found twice. `step.pairs` is a fresh array
   * on every render, so a memo keyed on it is no memo at all, and a random
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
    if (pair && pair[1] === value) {
      setJoined((was) => [...was, leftPick, value]);
      setLeftPick(null);
    } else {
      setMiss(value);
      window.setTimeout(() => setMiss(null), 420);
      setLeftPick(null);
    }
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
        return Object.keys(rooms).length === step.rooms.length;
    }
  })();

  /** Loose on purpose: case, spacing and a trailing full stop are not the skill. */
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
        return step.rooms.every((room, i) => rooms[i] === room.ok);
    }
  };

  const check = useCallback(() => {
    if (!ready || judged) return;
    /* A rule and a chat asked nothing, so there is nothing to mark. They used
       to run through the same path and the footer congratulated the learner
       for reading — which also counted towards the score, so a lesson could
       end eight correct out of six. The button on those screens just turns
       the page. */
    if (step.kind === "rule" || step.kind === "chat") {
      advanceRef.current?.();
      return;
    }
    const ok = correct();
    if (ok) setRight((was) => was + 1);
    setJudged(ok ? "right" : "wrong");
  }, [ready, judged, step, picked, typed, built, joined, rooms]);

  /* check() turns the page itself on the screens that ask nothing, and advance
     is declared below it. A ref rather than a reorder, because moving advance
     above check would only move the same problem the other way. */
  const advanceRef = useRef<(() => void) | null>(null);

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
    }, 150);
  }, [last, lesson]);

  advanceRef.current = advance;

  /* Enter checks, then Enter continues. Number keys pick an option. The whole
     lesson is playable without the mouse, which is how anybody doing this
     every evening will end up playing it. */
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
      if (!Number.isNaN(n) && n >= 1) {
        if (step.kind === "choice" && n <= step.options.length) setPicked(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, judged, step, advance, check]);

  if (over) {
    return (
      <div className="tk-done">
        <div className="tk-done__ring">{lesson.review ? "✦" : "✓"}</div>
        <h2 className="tk-done__h">{t("track.finish")}</h2>
        <p className="tk-done__p">{lesson.titleRu}</p>
        <div className="tk-score">
          <div className="tk-score__cell">
            <div className="tk-score__n">
              {right}/{steps.filter((s) => s.kind !== "rule" && s.kind !== "chat").length}
            </div>
            <div className="tk-score__l">{t("track.scoreRight")}</div>
          </div>
          <div className="tk-score__cell">
            <div className="tk-score__n">{steps.length}</div>
            <div className="tk-score__l">{t("track.scoreSteps")}</div>
          </div>
        </div>
        <button type="button" className="tk-go" onClick={onExit}>
          {t("track.toPath")}
        </button>
      </div>
    );
  }

  if (!step) return null;

  const kicker =
    index === 0 && !lesson.review
      ? { text: t("track.newThing"), className: "tk-kicker tk-kicker--new" }
      : { text: t(`track.kind.${step.kind}`), className: "tk-kicker" };

  return (
    <div className="tk-player">
      <div className="tk-top">
        <button type="button" className="tk-close" onClick={onExit} aria-label={t("track.leave")}>
          ✕
        </button>
        <div className="tk-bar">
          <div
            className="tk-bar__fill"
            style={{ width: `${((index + (judged ? 1 : 0)) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={`tk-stage ${leaving ? "tk-slide-out" : "tk-slide-in"}`} key={index}>
        <span className={kicker.className}>{kicker.text}</span>
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
          miss={miss}
          tapRight={tapRight}
          rightColumn={rightColumn}
          rooms={rooms}
          setRooms={setRooms}
          fieldRef={fieldRef}
          tone={module.tone}
        />
      </div>

      <Foot
        judged={judged}
        ready={ready}
        step={step}
        onCheck={check}
        onNext={advance}
        last={last}
      />
    </div>
  );
}

/* ── the footer ──────────────────────────────────────────────────────────── */

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
          <button type="button" className="tk-go" disabled={!ready} onClick={onCheck}>
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
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {judged === "right" ? <path d="M5 13l4 4L19 7" /> : <path d="M7 7l10 10M17 7L7 17" />}
          </svg>
        </span>
        <span className="tk-foot__said">
          <span className="tk-foot__h">
            {judged === "right" ? t("track.right") : t("track.wrong")}
          </span>
          {why && <span className="tk-foot__why">{why}</span>}
        </span>
        <button
          type="button"
          className={`tk-go${judged === "wrong" ? " tk-go--wrong" : ""}`}
          onClick={onNext}
        >
          {last ? t("track.finishBtn") : t("track.next")}
        </button>
      </div>
    </div>
  );
}

/**
 * What is said under the verdict.
 *
 * A wrong answer always gets the right one, because the single worst thing a
 * drill can do is mark somebody wrong and move on. A right answer gets the
 * explanation only when there is one worth reading — praise with nothing
 * under it trains people to stop reading the footer.
 */
function whyOf(step: Step, judged: Judged): string | null {
  switch (step.kind) {
    case "choice":
      return step.whyRu;
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
 * Shuffle, but the same way every time for a given step.
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
  miss: string | null;
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
          <div className="tk-rule__glyph">{step.glyph}</div>
          <h2 className="tk-rule__h">{step.titleRu}</h2>
          <p className="tk-rule__p">{step.bodyRu}</p>
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
          <div className="tk-chat">
            <div className="tk-chat__top">
              <span className="tk-chat__face">{step.withWhom.slice(0, 1)}</span>
              <span>
                <span className="tk-chat__who">{step.withWhom}</span>
                <span className="tk-chat__state"> · online</span>
              </span>
            </div>
            <div className="tk-chat__body">
              {step.lines.map((line, i) => (
                <div className={`tk-msg${line.me ? " tk-msg--me" : ""}`} key={i}>
                  <div
                    className="tk-msg__bubble"
                    style={{ animationDelay: `${0.12 + i * 0.16}s` }}
                  >
                    {line.text}
                  </div>
                  <div className="tk-msg__at">{line.at}</div>
                  {line.glossRu && <div className="tk-msg__gloss">{line.glossRu}</div>}
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
          {step.quote && <div className="tk-quote">{step.quote}</div>}
          <div className="tk-opts">
            {step.options.map((option, i) => {
              let state = "";
              if (judged) {
                if (i === step.answer) state = " tk-opt--right";
                else if (i === p.picked) state = " tk-opt--wrong";
              } else if (i === p.picked) state = " tk-opt--picked";
              return (
                <button
                  type="button"
                  key={option}
                  className={`tk-opt${state}`}
                  onClick={() => !judged && p.setPicked(i)}
                >
                  <span className="tk-opt__key">{i + 1}</span>
                  {option}
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
            <div className="tk-opts">
              {step.pairs.map(([left]) => (
                <button
                  type="button"
                  key={left}
                  className={`tk-pair${
                    p.joined.includes(left)
                      ? " tk-pair--joined"
                      : p.leftPick === left
                        ? " tk-pair--picked"
                        : ""
                  }`}
                  onClick={() => !p.joined.includes(left) && p.setLeftPick(left)}
                >
                  {left}
                </button>
              ))}
            </div>
            <div className="tk-opts">
              {p.rightColumn.map((rightValue) => (
                <button
                  type="button"
                  key={rightValue}
                  className={`tk-pair${
                    p.joined.includes(rightValue)
                      ? " tk-pair--joined"
                      : p.miss === rightValue
                        ? " tk-pair--miss"
                        : ""
                  }`}
                  onClick={() => p.tapRight(rightValue)}
                >
                  {rightValue}
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
          {step.quote && <div className="tk-quote">{step.quote}</div>}
          <div className="tk-line">
            {p.built.map((tileIndex, slot) => (
              <button
                type="button"
                key={`${tileIndex}-${slot}`}
                className="tk-tile"
                onClick={() => !judged && p.setBuilt((was) => was.filter((_, i) => i !== slot))}
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
                className={`tk-tile${p.built.includes(i) ? " tk-tile--spent" : ""}`}
                disabled={p.built.includes(i) || judged !== null}
                onClick={() => p.setBuilt((was) => [...was, i])}
                style={{ animationDelay: `${i * 0.04}s` }}
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
          {step.quote && <div className="tk-quote">{step.quote}</div>}
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
          <div className="tk-gap">
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
          </div>
        </>
      );

    case "register":
      return (
        <>
          <h2 className="tk-ask">
            {t("track.roomsAsk", { phrase: step.phrase })}
          </h2>
          <div className="tk-rooms">
            {step.rooms.map((room, i) => {
              const answered = p.rooms[i];
              let state = "";
              if (judged) state = answered === room.ok ? " tk-room--right" : " tk-room--wrong";
              return (
                <div className={`tk-room${state}`} key={room.labelRu}>
                  <span className="tk-room__name">{room.labelRu}</span>
                  <button
                    type="button"
                    className="tk-room__pick"
                    aria-pressed={answered === true}
                    aria-label={`${room.labelRu}: ${t("track.yes")}`}
                    onClick={() => !judged && p.setRooms((was) => ({ ...was, [i]: true }))}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="tk-room__pick"
                    aria-pressed={answered === false}
                    aria-label={`${room.labelRu}: ${t("track.no")}`}
                    onClick={() => !judged && p.setRooms((was) => ({ ...was, [i]: false }))}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </>
      );
  }
}
