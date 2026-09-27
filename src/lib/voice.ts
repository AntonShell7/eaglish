/**
 * The recorded voice.
 *
 * Every sentence in the library has been spoken once by a neural voice and
 * shipped as a file, so playback is a fetch rather than a synthesis. The
 * reasons are worth stating, because the previous comment in useSpeech argued
 * the opposite and was right at the time.
 *
 * Synthesis was chosen to avoid licensing, hosting and per-sentence cost. Those
 * arguments have simply expired: voicing all 2,720 sentences costs under five
 * dollars once, the audio is fifty-odd megabytes, and it is served from wherever
 * the site is served. What synthesis bought us is no longer worth its price.
 *
 * And its price was high. window.speechSynthesis delegates to whichever English
 * voice the operating system happens to ship: good on macOS and iOS, robotic on
 * Windows, absent often enough that the section could greet a learner with an
 * apology instead of a lesson. A product whose core feature depends on what
 * Microsoft installed by default is not a product.
 *
 * Synthesis stays as the fallback — for a sentence with no recording, which
 * means anything the app generated for one learner after the library was
 * voiced.
 */

/** Where scripts/voice.py writes, relative to the site root. */
const BASE = "/voice";

/**
 * The file name for a sentence: the first sixteen hex characters of its SHA-1.
 *
 * Content-addressed on purpose. Identical sentences across two texts share one
 * file, editing a text regenerates only what changed, and the client needs no
 * manifest — it derives the same name the generator did. scripts/voice.py
 * computes this identically, and the two must not drift.
 */
const keys = new Map<string, string>();

export async function keyOf(sentence: string): Promise<string> {
  const cached = keys.get(sentence);
  if (cached) return cached;

  const bytes = new TextEncoder().encode(sentence);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);

  keys.set(sentence, hex);
  return hex;
}

export function urlOf(key: string): string {
  return `${BASE}/${key}.m4a`;
}

/*
 * Which sentences we have.
 *
 * Asking the network is the obvious approach and the wrong one: a miss costs a
 * round trip before the fallback can start, and the fallback is the case where
 * the learner is already waiting. So each answer is remembered, and a hit is
 * remembered as the decoded element rather than as a boolean — the same
 * sentence is replayed constantly in dictation, and re-decoding it each time is
 * the difference between instant and nearly instant.
 */
const known = new Map<string, HTMLAudioElement | null>();

/**
 * Load the recording for a sentence, or null if there is none.
 *
 * Resolves only once the browser has enough audio to play without stalling, so
 * a caller that awaits this can start playback knowing it will not break in the
 * middle of a word.
 */
export async function load(sentence: string): Promise<HTMLAudioElement | null> {
  const key = await keyOf(sentence);
  if (known.has(key)) return known.get(key) ?? null;

  const element = new Audio(urlOf(key));
  element.preload = "auto";

  const ready = await new Promise<boolean>((resolve) => {
    const ok = () => finish(true);
    const fail = () => finish(false);
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      element.removeEventListener("canplaythrough", ok);
      element.removeEventListener("error", fail);
      resolve(value);
    };
    element.addEventListener("canplaythrough", ok, { once: true });
    element.addEventListener("error", fail, { once: true });
    // A stalled request must not hold the sentence hostage; the synthesised
    // voice is a worse reading, and no reading at all is worse than that.
    setTimeout(() => finish(element.readyState >= 3), 6000);
  });

  const result = ready ? element : null;
  known.set(key, result);
  return result;
}

/** Warm the cache for a sentence that is about to be needed. */
export function prefetch(sentence: string): void {
  void load(sentence).catch(() => undefined);
}

/*
 * Is the library voiced at all?
 *
 * The question is not idle. A browser with no system English voice and no
 * recordings can make no sound, and the honest thing to do there is say so
 * rather than render a working-looking exercise that stays silent. Probing a
 * single recording cannot answer it — a miss looks the same as a sentence that
 * was never in the library — so the generator leaves a manifest behind and this
 * asks for that.
 *
 * Asked once per session. A failure is treated as "no recordings", which is the
 * safe direction: the worst outcome is falling back to a synthesised voice that
 * would have worked anyway.
 */
export interface VoiceManifest {
  voice: string;
  model: string;
  count: number;
  generated: string;
}

let manifest: Promise<VoiceManifest | null> | null = null;

export function recordings(): Promise<VoiceManifest | null> {
  manifest ??= fetch(`${BASE}/manifest.json`)
    .then((response) => (response.ok ? (response.json() as Promise<VoiceManifest>) : null))
    .catch(() => null);
  return manifest;
}
