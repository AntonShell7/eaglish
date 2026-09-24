import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { curateVoices } from "./voices";

/**
 * The voice for dictation.
 *
 * Speech synthesis rather than recordings, and that is a deliberate choice
 * rather than a shortcut. Recorded content has to be licensed, hosted and paid
 * for, which is why the free dictation sites lean on YouTube and why their
 * libraries are frozen — you practise what they happened to clip. Synthesis
 * turns every sentence the app already has into an exercise, at any speed, for
 * nothing, and a sentence built from the learner's own weak words can be
 * dictated the moment it is generated.
 *
 * The honest limit: a synthetic voice does not slur, crowd or swallow sounds
 * the way people do, so this trains spelling, grammar and word recognition
 * rather than coping with a real accent. Human audio belongs on top of it
 * later, not instead of it.
 */
const VOICE_KEY = "dictationVoice";

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [chosenName, setChosenName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(VOICE_KEY);
    } catch {
      return null;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const current = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    // Chrome fills the list asynchronously, and an empty first read is normal.
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Curated rather than complete: see voices.ts for why the raw system list is
  // not something to put in front of anyone.
  const english = useMemo(() => curateVoices(voices), [voices]);

  /**
   * Which voice reads the sentence — and why the learner gets to decide.
   *
   * Picking a good one automatically turned out to be impossible. macOS ships
   * two dozen English voices, of which a good half are novelty toys — croaks,
   * bells, a voice called "Bad News" — and it localises both their names and
   * their identifiers, so on a Russian system the list reads "Плохие новости"
   * and there is nothing stable left to match against. The first attempt here
   * duly chose Albert, a joke voice, to read dictation with.
   *
   * So the choice is the learner's, remembered between sessions, with the
   * accent shown beside each name: which English you train your ear on is a
   * real decision anyway, not an implementation detail.
   */
  const voice = useCallback(() => {
    if (english.length === 0) return null;
    const saved = chosenName && english.find((v) => v.name === chosenName);
    if (saved) return saved;

    // The list arrives already ranked, best first, so the default is simply
    // its head — the clearest voice the machine has, which is what an exam
    // recording sounds like.
    return english[0] ?? null;
  }, [english, chosenName]);

  const chooseVoice = useCallback((name: string) => {
    setChosenName(name);
    try {
      localStorage.setItem(VOICE_KEY, name);
    } catch {
      // A remembered preference is a convenience, never a requirement.
    }
  }, []);

  const speak = useCallback(
    (text: string, rate = 1) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const chosen = voice();
      if (chosen) utterance.voice = chosen;
      utterance.lang = chosen?.lang ?? "en-US";
      utterance.rate = rate;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      current.current = utterance;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [voice],
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window && english.length > 0;

  return {
    speak,
    stop,
    speaking,
    supported,
    voices: english,
    voice: voice(),
    chooseVoice,
  };
}
