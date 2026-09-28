import { useCallback, useEffect, useState } from "react";

/**
 * Keyboard or pen, once, for the whole app.
 *
 * The request was a switch wherever text is entered, in the style Apple uses.
 * A switch *at* every field would be a switch answered over and over, so there
 * is one preference and the control appears beside whichever field you are
 * looking at — flip it in a dictation and the vocabulary drill is already in
 * pen mode when you get there.
 *
 * It defaults to keyboard, including on a tablet. Writing by hand is slower,
 * and somebody who has not asked for it should not be handed a blank sheet
 * where they expected a text box.
 *
 * The honest limit, recorded here because it decides where the mode is
 * offered: nothing on the server can read handwriting yet. So the pen is
 * available in exercises a learner marks themselves — a vocabulary drill, a
 * dictation checked against the revealed answer — and not in the ones where a
 * model grades the text, which would silently receive an empty string.
 */

const KEY = "inputMode";

export type InputMode = "keyboard" | "pen";

/** Broadcast within the tab; `storage` only fires in the *other* tabs. */
const CHANGED = "eaglish:input-mode";

export function getInputMode(): InputMode {
  try {
    return localStorage.getItem(KEY) === "pen" ? "pen" : "keyboard";
  } catch {
    // Private windows and blocked site data: the preference is a convenience,
    // never a requirement.
    return "keyboard";
  }
}

export function setInputMode(mode: InputMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // Still dispatch: the session should honour the choice even when it
    // cannot be remembered past a reload.
  }
  window.dispatchEvent(new CustomEvent(CHANGED, { detail: mode }));
}

/** The mode, kept in step across every control showing it on the page. */
export function useInputMode(): [InputMode, (mode: InputMode) => void] {
  const [mode, setMode] = useState<InputMode>(getInputMode);

  useEffect(() => {
    const onChange = () => setMode(getInputMode());
    window.addEventListener(CHANGED, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGED, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const set = useCallback((next: InputMode) => setInputMode(next), []);
  return [mode, set];
}

/**
 * Whether a pen is worth offering at all.
 *
 * A mouse can draw, but writing a sentence with one is a joke, and a switch
 * that produces a worse experience for everybody who tries it is a switch that
 * should not be on the page. Offered where the device reports a coarse pointer
 * or a stylus — a tablet, a phone, a laptop with a touchscreen.
 */
export function penAvailable(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(any-pointer: coarse)").matches ||
    window.matchMedia("(any-pointer: fine) and (any-hover: none)").matches
  );
}
