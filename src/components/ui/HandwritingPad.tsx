import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./handwriting-pad.css";

/**
 * A sheet to write on.
 *
 * Extracted from the vocabulary drill's card so that dictation and the writing
 * exercises can use the same one. Everything that was learned building the
 * first version is kept, and most of it is about the grid:
 *
 * The squares are painted on the canvas at whole device pixels, not with a CSS
 * repeating gradient. A gradient lands its lines on fractional pixels, so some
 * come out one pixel wide and others two, and the paper reads as crooked
 * rather than as paper. Here every line is drawn with fillRect at an integer
 * offset and the gaps are identical.
 *
 * Strokes are stored as points rather than as pixels, so the sheet survives a
 * resize, a rotation and a theme change — the canvas is simply repainted from
 * the same coordinates at the new size and in the new ink.
 */

const PENS = ["mint", "red", "amber", "violet", "ink"] as const;
type Pen = (typeof PENS)[number];
type Tool = Pen | "eraser";

/**
 * How close a stroke has to pass to be rubbed out, in CSS pixels.
 *
 * Whole strokes go rather than pixels. That sounds cruder and is what people
 * actually want here: a letter is usually one or two strokes, so this rubs out
 * letters, which is the unit anybody is thinking in when they want to fix a
 * word. Pixel erasing leaves half-letters behind and needs far more precision
 * than a fingertip has.
 */
const ERASER_RADIUS = 14;

interface Stroke {
  pen: Pen;
  points: { x: number; y: number; w: number }[];
}

const PEN_KEY = "handwritingPen";
/** The square, in CSS pixels. Matches the ruling on ordinary squared paper. */
const SQUARE = 26;

export interface HandwritingPadHandle {
  /** True once anything has been written. */
  hasInk: () => boolean;
  clear: () => void;
  /**
   * A PNG data URL of the writing alone, for a model to read.
   *
   * Redrawn rather than exported: the visible canvas carries the grid and
   * whatever ink colour the learner picked, and both are noise to something
   * trying to read words. Black on white, no ruling, is what OCR is good at.
   */
  toImage: () => string | null;
}

export function HandwritingPad({
  rows = 4,
  onFirstStroke,
  padRef,
}: {
  /** Height, in squares. Four is a comfortable two lines of adult handwriting. */
  rows?: number;
  onFirstStroke?: () => void;
  padRef?: (handle: HandwritingPadHandle) => void;
}) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const strokes = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const [written, setWritten] = useState(false);

  const [pen, setPen] = useState<Pen>(() => {
    try {
      const saved = localStorage.getItem(PEN_KEY) as Pen | null;
      return saved && PENS.includes(saved) ? saved : "mint";
    } catch {
      return "mint";
    }
  });
  /* The eraser is a tool, not a colour, so it is kept apart from the ink the
     learner last chose — switching to it and back must return the same pen. */
  const [tool, setTool] = useState<Tool>("mint");

  /* Colours come from the stylesheet rather than from constants here, so the
     ink follows the theme without this file knowing what the theme is. */
  const inkOf = useCallback((which: Pen): string => {
    const root = paperRef.current;
    if (!root) return "#7fd0b4";
    const value = getComputedStyle(root).getPropertyValue(`--ink-${which}`).trim();
    return value || "#7fd0b4";
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const paper = paperRef.current;
    if (!canvas || !paper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* The grid, in device pixels. Integer offsets and an integer step are the
       whole trick: anything else and the lines alias unevenly. */
    const step = Math.round(SQUARE * ratio);
    const line = getComputedStyle(paper).getPropertyValue("--grid-line").trim() || "rgba(255,255,255,.07)";
    ctx.fillStyle = line;
    for (let x = step; x < canvas.width; x += step) ctx.fillRect(x, 0, 1, canvas.height);
    for (let y = step; y < canvas.height; y += step) ctx.fillRect(0, y, canvas.width, 1);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes.current) {
      ctx.strokeStyle = inkOf(stroke.pen);
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
  }, [inkOf]);

  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    const paper = paperRef.current;
    if (!canvas || !paper) return;
    const ratio = window.devicePixelRatio || 1;
    const width = paper.clientWidth;
    const height = rows * SQUARE;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    redraw();
  }, [redraw, rows]);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  /* Repaint when the theme changes: the ink and the grid are both read from
     custom properties, and neither updates itself on a painted canvas. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(redraw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    media.addEventListener("change", redraw);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", redraw);
    };
  }, [redraw]);

  const clear = useCallback(() => {
    strokes.current = [];
    setWritten(false);
    redraw();
  }, [redraw]);

  const toImage = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.current.length === 0) return null;
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext("2d");
    if (!ctx) return null;

    const ratio = window.devicePixelRatio || 1;
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
  }, []);

  useEffect(() => {
    padRef?.({ hasInk: () => strokes.current.length > 0, clear, toImage });
  }, [padRef, clear, toImage]);

  const choosePen = (next: Pen) => {
    setPen(next);
    setTool(next);
    try {
      localStorage.setItem(PEN_KEY, next);
    } catch {
      // A remembered pen is a convenience, never a requirement.
    }
  };

  /* Pressure where the stylus reports it, a steady width where it does not —
     a finger and a mouse both report zero, and a line that thins to nothing
     because of that looks like a failing pen. */
  const widthFor = (pressure: number) => (pressure > 0 ? 1.6 + pressure * 2.8 : 2.6);

  const at = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      w: widthFor(event.pressure),
    };
  };

  /** Rubs out every stroke passing within the eraser's radius of a point. */
  const erase = useCallback(
    (x: number, y: number) => {
      const before = strokes.current.length;
      strokes.current = strokes.current.filter(
        (stroke) => !stroke.points.some((p) => Math.hypot(p.x - x, p.y - y) <= ERASER_RADIUS),
      );
      if (strokes.current.length !== before) redraw();
    },
    [redraw],
  );

  const down = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // A palm resting on a tablet arrives as a separate touch contact while the
    // stylus is down; ignoring it is the difference between writing and
    // smearing.
    if (drawing.current && event.pointerType === "touch") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;

    const point = at(event);
    if (tool === "eraser") {
      erase(point.x, point.y);
      return;
    }

    strokes.current.push({ pen, points: [point] });
    if (!written) {
      setWritten(true);
      onFirstStroke?.();
    }
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const point = at(event);

    if (tool === "eraser") {
      erase(point.x, point.y);
      return;
    }

    const stroke = strokes.current[strokes.current.length - 1];
    if (!stroke) return;
    stroke.points.push(point);
    redraw();
  };

  const up = () => {
    drawing.current = false;
  };

  return (
    <div className="hp" ref={paperRef}>
      <canvas
        ref={canvasRef}
        className="hp__paper"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      />

      {/* Every tool in one row, the same size and shape.
          The eraser and the bin used to be a word in the far corner, which is
          the one place a hand holding a stylus is not. They sit beside the
          ink now, where the hand already is. */}
      <div className="hp__tools">
        <div className="hp__pens">
          {PENS.map((which) => (
            <button
              key={which}
              type="button"
              className={tool === which ? "hp__pen is-on" : "hp__pen"}
              style={{ background: `var(--ink-${which})` }}
              onClick={() => choosePen(which)}
              aria-label={which}
            />
          ))}

          <span className="hp__divider" aria-hidden />

          <button
            type="button"
            className={tool === "eraser" ? "hp__tool is-on" : "hp__tool"}
            onClick={() => setTool("eraser")}
            title={t("input.eraser")}
            aria-label={t("input.eraser")}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8.5 20H21" />
              <path d="m15.5 4.5-11 11a2 2 0 0 0 0 2.9l2.1 2.1a2 2 0 0 0 2.9 0l11-11a2 2 0 0 0 0-2.9l-2.1-2.1a2 2 0 0 0-2.9 0Z" />
              <path d="m9 10 5 5" />
            </svg>
          </button>

          <button
            type="button"
            className="hp__tool hp__tool--clear"
            onClick={clear}
            disabled={!written}
            title={t("input.clear")}
            aria-label={t("input.clear")}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
