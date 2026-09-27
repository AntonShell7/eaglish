import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { curateVoices } from "./voices";
import { load as loadRecording, prefetch, recordings } from "@/lib/voice";

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
 *
 * ── Since then ──
 * The library is now voiced ahead of time by a neural model and shipped as
 * files (see lib/voice.ts and scripts/voice.py). Every sentence that has a
 * recording plays the recording; only sentences written after that run — a
 * text generated for one learner — still reach speechSynthesis. That inverts
 * the old dependency: the section no longer needs the operating system to own
 * a decent English voice, and no longer dies when it owns none.
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
  /** null while we are still asking; true once the library is known to be voiced. */
  const [voiced, setVoiced] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    void recordings().then((found) => {
      if (live) setVoiced(Boolean(found?.count));
    });
    return () => {
      live = false;
    };
  }, []);

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

  /** The recording currently playing, so a replay can interrupt it. */
  const playing = useRef<HTMLAudioElement | null>(null);
  /** Which request is the live one, so a slow load cannot speak over a newer. */
  const token = useRef(0);

  const silence = useCallback(() => {
    if (playing.current) {
      playing.current.pause();
      playing.current.currentTime = 0;
      playing.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const synthesise = useCallback(
    (text: string, rate: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const chosen = voice();
      if (chosen) utterance.voice = chosen;
      utterance.lang = chosen?.lang ?? "en-US";
      utterance.rate = rate;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      current.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voice],
  );

  const speak = useCallback(
    (text: string, rate = 1) => {
      silence();
      const mine = ++token.current;
      setSpeaking(true);

      void loadRecording(text).then((audio) => {
        // Replayed or moved on while this was loading: that request is stale
        // and speaking now would talk over whatever replaced it.
        if (mine !== token.current) return;

        if (!audio) {
          synthesise(text, rate);
          return;
        }

        // A separate element per playback. Sharing one across a replay races
        // with its own pause, and the browser answers by playing nothing.
        const element = audio.cloneNode() as HTMLAudioElement;
        element.playbackRate = rate;
        // Slow practice should sound slow, not like a different person.
        element.preservesPitch = true;
        element.onended = () => setSpeaking(false);
        element.onerror = () => synthesise(text, rate);
        playing.current = element;
        void element.play().catch(() => synthesise(text, rate));
      });
    },
    [silence, synthesise],
  );

  const stop = useCallback(() => {
    token.current += 1;
    silence();
    setSpeaking(false);
  }, [silence]);

  /*
   * The section works if anything can read a sentence aloud.
   *
   * This used to require a system English voice, which meant a browser with an
   * empty voice list — not rare — was shown an apology for a feature that was
   * about to work fine. Recordings do not need the list at all, so the gate is
   * now only the one thing that would genuinely leave a learner with silence:
   * no audio support whatsoever.
   */
  const supported =
    typeof window !== "undefined" &&
    typeof Audio !== "undefined" &&
    // Recordings need no system voice. Without them we are back to relying on
    // one, and a machine with none genuinely cannot do this — say so instead of
    // showing an exercise that will never make a sound.
    (voiced !== false || english.length > 0);

  return {
    speak,
    stop,
    speaking,
    supported,
    /** Dictation is sequential, so the next line is fetched while this one is typed. */
    prefetch,
    voices: english,
    voice: voice(),
    chooseVoice,
  };
}
