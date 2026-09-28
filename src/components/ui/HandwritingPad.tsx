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

  useEffect(() => {
    padRef?.({ hasInk: () => strokes.current.length > 0, clear });
  }, [padRef, clear]);

  const choosePen = (next: Pen) => {
    setPen(next);
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

  const down = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // A palm resting on a tablet arrives as a separate touch contact while the
    // stylus is down; ignoring it is the difference between writing and
    // smearing.
    if (drawing.current && event.pointerType === "touch") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    strokes.current.push({ pen, points: [at(event)] });
    if (!written) {
      setWritten(true);
      onFirstStroke?.();
    }
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const stroke = strokes.current[strokes.current.length - 1];
    if (!stroke) return;
    stroke.points.push(at(event));
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

      <div className="hp__tools">
        <div className="hp__pens">
          {PENS.map((which) => (
            <button
              key={which}
              type="button"
              className={which === pen ? "hp__pen is-on" : "hp__pen"}
              style={{ background: `var(--ink-${which})` }}
              onClick={() => choosePen(which)}
              aria-label={which}
            />
          ))}
        </div>

        <button type="button" className="hp__clear" onClick={clear} disabled={!written}>
          {t("input.clear")}
        </button>
      </div>
    </div>
  );
}
