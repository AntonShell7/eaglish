import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { readHandwriting, type Reading } from "@/lib/handwriting";
import type { VocabularyWord } from "@/lib/vocabularyStore";
import "./write-card.css";

/**
 * Writing the word by hand.
 *
 * This is the mode the whole section was asked for: a tablet, a stylus, a
 * ruled strip, and a word that has to come out of the hand rather than off a
 * keyboard. It is worth building for a reason beyond pleasantness — producing
 * a spelling stroke by stroke recruits more of the memory than recognising one
 * does, and a keyboard hides the difference by making every letter equally
 * easy to reach.
 *
 * When the writing is right the card moves on by itself. Asking someone to
 * write a word and then tap a button to confirm they wrote it is the kind of
 * small tax that ends a twenty-word session at eight.
 */

/** How long the pen must rest before the card reads what was written. */
const SETTLE_MS = 900;

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
  const drawing = useRef(false);
  const dirty = useRef(false);
  const settle = useRef<number | null>(null);
  const [state, setState] = useState<State>({ phase: "blank" });
  /* One wrong reading is a spelling slip worth fixing in place; a second means
     the word is not there, and the card should stop pretending otherwise. */
  const [attempts, setAttempts] = useState(0);

  /** Sizes the canvas to its box at device resolution — a canvas stretched by
      CSS draws blurred strokes, which is exactly what handwriting cannot
      afford when something else has to read it. */
  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(box.width * ratio);
    const h = Math.round(box.height * ratio);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111318";
    ctx.lineWidth = 2.6;
  }, []);

  useEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    dirty.current = false;
    setState({ phase: "blank" });
  }, []);

  // A new word arrives on a clean strip.
  useEffect(() => {
    clear();
    setAttempts(0);
  }, [word.id, clear]);

  /**
   * Flattens the strokes onto white before sending.
   *
   * The canvas is transparent, and a transparent PNG read by a model that
   * composites onto black is black ink on black paper. White here costs
   * nothing and removes the whole class of problem.
   */
  const snapshot = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(canvas, 0, 0);
    return flat.toDataURL("image/png");
  };

  const check = useCallback(async () => {
    if (!dirty.current) return;
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

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (state.phase === "reading" || state.phase === "right") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    dirty.current = true;
    if (settle.current) window.clearTimeout(settle.current);
    setState({ phase: "drawing" });

    const box = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - box.left, event.clientY - box.top);
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const box = canvas.getBoundingClientRect();
    // A stylus reports pressure; a finger and a mouse report zero, and a
    // constant line is the right answer for both.
    ctx.lineWidth = event.pressure > 0 ? 1.6 + event.pressure * 2.6 : 2.6;
    ctx.lineTo(event.clientX - box.left, event.clientY - box.top);
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

  return (
    <div className={`wc wc--${state.phase}`}>
      <p className="wc__prompt">{word.translation}</p>
      <p className="wc__ask">{t("vocabulary.write.ask")}</p>

      <div className="wc__paper">
        {/* The ruling is drawn under the canvas rather than on it, so it never
            ends up in the picture the model reads. */}
        <span className="wc__rule wc__rule--top" aria-hidden />
        <span className="wc__rule wc__rule--mid" aria-hidden />
        <span className="wc__rule wc__rule--base" aria-hidden />
        <canvas
          ref={canvasRef}
          className="wc__canvas"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          aria-label={t("vocabulary.write.ask")}
        />
        {state.phase === "blank" && <span className="wc__ghost">{t("vocabulary.write.hint")}</span>}
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
        <button type="button" className="btn btn--ghost btn--sm" onClick={check} disabled={busy || !dirty.current}>
          {t("vocabulary.write.check")}
        </button>
        <button
          type="button"
          className="btn btn--quiet btn--sm"
          onClick={() => onGraded(0)}
          disabled={busy}
        >
          {t("vocabulary.didntKnow")}
        </button>
      </div>
      )}
    </div>
  );
}
