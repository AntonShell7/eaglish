import { useTranslation } from "react-i18next";
import { penAvailable, useInputMode } from "@/lib/inputMode";
import "./pen-toggle.css";

/**
 * Keyboard or pen.
 *
 * The switch Apple uses, and it is the right shape for this: two states, both
 * legitimate, neither destructive, and the current one readable without a
 * label. A checkbox would say "turn on handwriting", which frames the pen as
 * an extra rather than as the other half of a pair.
 *
 * It hides itself on a device with no touch or stylus. A mouse can draw, but
 * writing a sentence with one is a joke, and a control that produces a worse
 * experience for everybody who tries it does not belong on the page.
 */
export function PenToggle({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const [mode, setMode] = useInputMode();

  if (!penAvailable()) return null;

  const pen = mode === "pen";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pen}
      className={`pen ${className}`}
      onClick={() => setMode(pen ? "keyboard" : "pen")}
      title={t("input.penHint")}
    >
      <span className="pen__label">{t("input.pen")}</span>
      <span className={pen ? "pen__track is-on" : "pen__track"} aria-hidden>
        <span className="pen__knob" />
      </span>
    </button>
  );
}
