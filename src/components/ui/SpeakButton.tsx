import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { curateVoices } from "@/components/dictation/voices";
import "./speak-button.css";

/**
 * Hear the word.
 *
 * A translation answers "what does it mean" and leaves the other half of
 * knowing a word untouched. Somebody who has read *genuine* a dozen times and
 * never heard it will say it wrong, and will keep saying it wrong, because
 * nothing in a reading app ever corrects them. One button fixes that at the
 * exact moment they are already looking at the word.
 *
 * It uses the system's own voice rather than a recording. That is a real
 * compromise — a synthesised word is less good than a recorded one — but the
 * alternative is a sound file per word for a vocabulary that is different for
 * every learner and grows every day, which cannot be recorded in advance. The
 * voice list is the same curated one the dictation uses, so this never reaches
 * for the novelty voices macOS ships.
 *
 * It hides itself where there is no English voice at all. A button that does
 * nothing is worse than no button, because the learner tries it twice.
 */
export function SpeakButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(curateVoices(window.speechSynthesis.getVoices()));
    load();
    // Chrome fills the list asynchronously, and an empty first read is normal.
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const speak = useCallback(() => {
    const voice = voices[0];
    if (!voice) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    /* Slightly under natural pace. A single word at full speed is over before
       the ear has started, and the point here is to be copied, not understood. */
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);

    /* Some browsers never fire onend for a short utterance, which would leave
       the button lit forever. A ceiling costs nothing and cannot get stuck. */
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSpeaking(false), 4000);
  }, [text, voices]);

  if (voices.length === 0 || !text.trim()) return null;

  return (
    <button
      type="button"
      className={`spk ${speaking ? "is-on" : ""} ${className}`}
      onClick={(event) => {
        // Often sits inside something clickable; hearing a word should never
        // also open, close or submit whatever it is sitting in.
        event.preventDefault();
        event.stopPropagation();
        speak();
      }}
      title={t("lookup.listen")}
      aria-label={t("lookup.listen")}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path className="spk__wave spk__wave--near" d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path className="spk__wave spk__wave--far" d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
