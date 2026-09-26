import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { readHandwriting, type Reading } from "@/lib/handwriting";
import type { VocabularyWord } from "@/lib/vocabularyStore";
import "./write-card.css";

/**
 * Writing the word by hand.
 *
 * This is the mode the section was asked for: a tablet, a stylus, squared
 * paper, and a word that has to come out of the hand rather than off a
 * keyboard. It is worth building for a reason beyond pleasantness — producing
 * a spelling stroke by stroke recruits more of the memory than recognising one
 * does, and a keyboard hides the difference by making every letter equally
 * easy to reach.
 *
 * Strokes are kept as points rather than only as pixels. That is what lets the
 * paper be redrawn when the card is resized, and — more importantly — lets the
 * picture sent for reading be rendered in plain dark ink on white however the
 * learner chose to write it. What colour someone likes writing in is a matter
 * of pleasure; what a reader receives should be the same every time.
 */

/** How long the pen must rest before the card reads what was written. */
const SETTLE_MS = 900;

/** Whether the "write here" hint has been seen. It is guidance, not furniture. */
const HINT_KEY = "handwritingHintSeen";

/**
 * Five inks.
 *
 * Every one is a custom property on the paper, so the default ink can invert
 * with the theme and the rest can be tuned in one place. Resolving them at
 * draw time is what keeps a stroke the right colour after the theme changes
 * under it.
 */
const PENS = ["ink", "mint", "amber", "coral", "violet"] as const;
type Pen = (typeof PENS)[number];

interface Stroke {
  pen: Pen;
  points: { x: number; y: number; w: number }[];
}

type State =
  | { phase: "blank" }
  | { phase: "drawing" }
  | { phase: "reading" }
  | { phase: "right" }
  | { phase: "wrong"; reading: Reading }
  /**
   * Nobody is reading the handwriting.
   *
   * The provider we use has no model with eyes, so on this deployment the
   * check cannot happen and the card says so instead of pretending. Writing
   * the word out is still most of the value — the hand has already produced
   * the whole spelling from memory — so the card shows the answer and asks
   * the learner to compare, exactly as the flip card does.
   */
  | { phase: "selfcheck" };

export function WriteCard({
  word,
  onGraded,
}: {
  word: VocabularyWord;
  onGraded: (quality: 0 | 1 | 2 | 3) => void;
}) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const settle = useRef<number | null>(null);

  const [state, setState] = useState<State>({ phase: "blank" });
  const [pen, setPen] = useState<Pen>(() => {
    try {
      const saved = localStorage.getItem("handwritingPen");
      return PENS.includes(saved as Pen) ? (saved as Pen) : "ink";
    } catch {
      return "ink";
    }
  });
  const [hint, setHint] = useState(() => {
    try {
      return localStorage.getItem(HINT_KEY) !== "1";
    } catch {
      return true;
    }
  });
  /* One wrong reading is a spelling slip worth fixing in place; a second means
     the word is not there, and the card should stop pretending otherwise. */
  const [attempts, setAttempts] = useState(0);

  /** Reads a custom property off the paper, so the canvas and the stylesheet
      never hold two opinions about the same colour. */
  const cssValue = useCallback((name: string, fallback: string): string => {
    const paper = paperRef.current;
    if (!paper) return fallback;
    return getComputedStyle(paper).getPropertyValue(name).trim() || fallback;
  }, []);

  const cssNumber = useCallback(
    (name: string, fallback: number): number => {
      const parsed = Number.parseFloat(cssValue(name, String(fallback)));
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    },
    [cssValue],
  );

  /** Resolves a pen name to whatever the stylesheet currently says it is. */
  const colourOf = useCallback(
    (name: Pen): string => cssValue(`--wc-pen-${name}`, "#1c1a17"),
    [cssValue],
  );

  /**
   * Paints the grid, then every stroke held in memory.
   *
   * The grid used to be a CSS background, and it looked it: a repeating
   * gradient lands its lines wherever the maths falls, which on a screen with
   * fractional device pixels means some lines land on a pixel boundary and
   * some straddle two — so the squares came out visibly uneven. Drawing it
   * here instead lets every line sit on a whole device pixel, which is the
   * only way a one-pixel line is ever crisp.
   *
   * It costs nothing to keep it out of what the reader receives, because the
   * picture sent for recognition is rendered separately from the stroke data
   * and never includes the paper.
   */
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ratio = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Whole device pixels throughout, and the leftover split evenly so the
    // grid is centred rather than cut off down one edge.
    const cell = Math.max(10, Math.round(cssNumber("--wc-cell", 26) * ratio));
    const offsetX = Math.floor((canvas.width % cell) / 2);
    const offsetY = Math.floor((canvas.height % cell) / 2);

    ctx.fillStyle = cssValue("--wc-grid", "rgba(0,0,0,0.12)");
    for (let x = offsetX; x <= canvas.width; x += cell) ctx.fillRect(x, 0, 1, canvas.height);
    for (let y = offsetY; y <= canvas.height; y += cell) ctx.fillRect(0, y, canvas.width, 1);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes.current) {
      ctx.strokeStyle = colourOf(stroke.pen);
      for (let i = 1; i < stroke.points.length; i += 1) {
        const from = stroke.points[i - 1];
        const to = stroke.points[i];
        ctx.beginPath();
        ctx.lineWidth = to.w;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }, [colourOf, cssNumber, cssValue]);

  /** Sizes the canvas to its box at device resolution — a canvas stretched by
      CSS draws blurred strokes, which is what handwriting can least afford
      when something else has to read it. */
  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(box.width * ratio);
    const h = Math.round(box.height * ratio);
    // Assigning a size clears the canvas, so this is skipped when nothing
    // changed — but the repaint is not, or a card mounted at the size it
    // already had would come up with no paper under it.
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    redraw();
  }, [redraw]);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  /*
   * Ink follows the room. Switching to the light theme mid-word would
   * otherwise leave the strokes in the shade they were drawn in while the
   * swatch below showed the new one — the two disagreeing about the same pen.
   * Keeping strokes as points rather than pixels is what makes this a repaint
   * rather than a problem.
   */
  useEffect(() => {
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(redraw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    scheme.addEventListener("change", redraw);
    return () => {
      observer.disconnect();
      scheme.removeEventListener("change", redraw);
    };
  }, [redraw]);

  const clear = useCallback(() => {
    strokes.current = [];
    redraw();
    setState({ phase: "blank" });
  }, [redraw]);

  // A new word arrives on a clean sheet.
  useEffect(() => {
    clear();
    setAttempts(0);
  }, [word.id, clear]);

  /**
   * The picture sent for reading: the same strokes, in dark ink on white.
   *
   * Rendering what is on screen would send neon on charcoal, which is a
   * harder problem than it needs to be — and the colour was never part of the
   * answer.
   */
  const snapshot = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext("2d");
    if (!ctx) return null;

    const ratio = Math.min(2, window.devicePixelRatio || 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";

    for (const stroke of strokes.current) {
      for (let i = 1; i < stroke.points.length; i += 1) {
        const from = stroke.points[i - 1];
        const to = stroke.points[i];
        ctx.beginPath();
        ctx.lineWidth = to.w;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
    return flat.toDataURL("image/png");
  };

  const check = useCallback(async () => {
    if (strokes.current.length === 0) return;
    setState({ phase: "reading" });
    const image = snapshot();
    if (!image) return;

    const reading = await readHandwriting(image, word.word);

    if (reading.verdict === "match") {
      setState({ phase: "right" });
      // A beat on the green, so the learner sees the card was accepted rather
      // than just watching the next word appear.
      window.setTimeout(() => onGraded(2), 550);
      return;
    }
    if (reading.verdict === "unavailable") {
      setState({ phase: "selfcheck" });
      return;
    }
    setAttempts((n) => n + 1);
    setState({ phase: "wrong", reading });
  }, [onGraded, word.word]);

  const choosePen = (next: Pen) => {
    setPen(next);
    try {
      localStorage.setItem("handwritingPen", next);
    } catch {
      /* a remembered preference is a convenience, not a requirement */
    }
  };

  const widthFor = (pressure: number) => (pressure > 0 ? 1.6 + pressure * 2.8 : 2.8);

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (state.phase === "reading" || state.phase === "right") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    if (settle.current) window.clearTimeout(settle.current);

    // The hint has done its job the moment someone writes. It is instruction,
    // and instruction that stays after it is understood becomes clutter.
    if (hint) {
      setHint(false);
      try {
        localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* nothing here is worth failing over */
      }
    }
    setState({ phase: "drawing" });

    const box = canvas.getBoundingClientRect();
    strokes.current.push({
      pen,
      points: [
        {
          x: event.clientX - box.left,
          y: event.clientY - box.top,
          w: widthFor(event.pressure),
        },
      ],
    });
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const stroke = strokes.current[strokes.current.length - 1];
    if (!stroke) return;

    const box = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      // A stylus reports pressure; a finger and a mouse report zero, and a
      // constant line is the right answer for both.
      w: widthFor(event.pressure),
    };
    const previous = stroke.points[stroke.points.length - 1];
    stroke.points.push(point);

    // Drawn incrementally rather than by repainting everything, so a long
    // word stays smooth under the pen.
    ctx.strokeStyle = colourOf(stroke.pen);
    ctx.beginPath();
    ctx.lineWidth = point.w;
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const pointerUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    // The pen lifts between letters as well as at the end of a word, so the
    // card waits to see whether writing resumes before it reads anything.
    if (settle.current) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(check, SETTLE_MS);
  };

  useEffect(() => () => { if (settle.current) window.clearTimeout(settle.current); }, []);

  const busy = state.phase === "reading";
  const written = state.phase !== "blank";

  return (
    <div className={`wc wc--${state.phase}`}>
      <p className="wc__prompt">{word.translation}</p>
      <p className="wc__ask">{t("vocabulary.write.ask")}</p>

      <div className="wc__paper" ref={paperRef} data-pen={pen}>
        <canvas
          ref={canvasRef}
          className="wc__canvas"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          aria-label={t("vocabulary.write.ask")}
        />
        {hint && state.phase === "blank" && <span className="wc__ghost">{t("vocabulary.write.hint")}</span>}
      </div>

      {/* Five inks. Purely for pleasure — the reader is sent plain dark ink
          whatever is chosen here — and pleasure is most of why anyone picks up
          a stylus rather than a keyboard. */}
      <div className="wc__pens" role="radiogroup" aria-label={t("vocabulary.write.penLabel")}>
        {PENS.map((name) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={pen === name}
            aria-label={t(`vocabulary.write.pens.${name}`)}
            title={t(`vocabulary.write.pens.${name}`)}
            className={pen === name ? "wc__pen is-on" : "wc__pen"}
            style={{ background: `var(--wc-pen-${name})` }}
            onClick={() => choosePen(name)}
          />
        ))}
      </div>

      <div className="wc__status" role="status" aria-live="polite">
        {busy && <span className="wc__reading">{t("vocabulary.write.reading")}</span>}
        {state.phase === "right" && <span className="wc__right">{t("vocabulary.write.right")}</span>}
        {state.phase === "wrong" && state.reading.verdict === "different" && (
          <span className="wc__wrong">{t("vocabulary.write.readAs", { read: state.reading.read })}</span>
        )}
        {state.phase === "wrong" && state.reading.verdict === "unreadable" && (
          <span className="wc__wrong">{t("vocabulary.write.unreadable")}</span>
        )}
        {state.phase === "selfcheck" && (
          <span className="wc__reading">{t("vocabulary.write.offline")}</span>
        )}
      </div>

      {/* After a second miss the answer is shown: a third blind attempt at a
          word you cannot spell is guessing, not recall. */}
      {(state.phase === "selfcheck" || (attempts >= 2 && state.phase === "wrong")) && (
        <p className="wc__answer">{word.word}</p>
      )}

      {state.phase === "selfcheck" ? (
        <div className="wc__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onGraded(0)}>
            {t("vocabulary.didntKnow")}
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onGraded(2)}>
            {t("vocabulary.knew")}
          </button>
        </div>
      ) : (
        <div className="wc__actions">
          <button type="button" className="btn btn--quiet btn--sm" onClick={clear} disabled={busy}>
            {t("vocabulary.write.clear")}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={check} disabled={busy || !written}>
            {t("vocabulary.write.check")}
          </button>
          <button type="button" className="btn btn--quiet btn--sm" onClick={() => onGraded(0)} disabled={busy}>
            {t("vocabulary.didntKnow")}
          </button>
        </div>
      )}
    </div>
  );
}
