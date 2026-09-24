/**
 * Dictation against a real video.
 *
 * The synthesised voice trains spelling and word recognition, and stops there:
 * it never slurs, never runs two words together, never swallows a syllable —
 * which is most of what makes real listening hard. A recording of a person
 * speaking is the only cure, and YouTube is where those recordings already are.
 *
 * Three constraints shape everything below.
 *
 * The video is never downloaded or re-hosted. It plays in YouTube's own
 * embedded player, which is what their terms allow and what keeps the channel's
 * views and ads intact. We only tell that player where to start and when to
 * stop.
 *
 * The timings have to be written by a person. There is no supported way to read
 * a video's captions from a web page, and scraping the unofficial endpoint both
 * breaks the terms and breaks every few months. So an exercise is a list of
 * segments a human typed — which is exactly how the dictation sites everyone
 * admires are made, and the reason their libraries grow slowly.
 *
 * And the text belongs to whoever made the video. Transcribing a few sentences
 * for study is one thing; publishing a library of full transcripts of other
 * people's work is another, and the second is worth being deliberate about.
 * Videos whose licence permits reuse — Creative Commons, or anything from a
 * public-domain source such as a US government channel — are the safe ground.
 */

export interface VideoSegment {
  /** Seconds from the start of the video. */
  start: number;
  /** Seconds; the player is stopped here. */
  end: number;
  /** What is actually said, as a person transcribed it. */
  text: string;
  /** Russian, shown after the answer — the reading half of the exercise. */
  translationRu?: string;
}

export interface VideoExercise {
  id: string;
  /** YouTube's eleven-character video id, not a full URL. */
  videoId: string;
  title: string;
  /** Who made it, shown with a link: attribution is not optional. */
  channel: string;
  /** What lets us use the transcript at all. */
  licence: "public-domain" | "creative-commons" | "own";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  segments: VideoSegment[];
}

/** Accepts a full URL, a share link, or a bare id. */
export function parseVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** "1:23" or "0:01:23.400" or "83" → 83 seconds. */
export function parseTimestamp(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (!/^[\d:.]+$/.test(cleaned)) return null;

  const parts = cleaned.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

/**
 * Reads the transcript exactly as YouTube's own transcript panel copies it:
 * a timestamp on its own line, then the line of speech, repeated.
 *
 * That format matters more than it looks. It is the one a learner can produce
 * in ten seconds — open the video, "Show transcript", select, copy — which is
 * the difference between a feature that grows and one that waits for a
 * developer.
 */
export function parseTranscript(raw: string): VideoSegment[] {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const stamps: { at: number; text: string }[] = [];
  let pending: number | null = null;

  for (const line of lines) {
    // A line that is only a timestamp introduces the speech that follows.
    const asStamp = /^\d{1,2}:\d{2}(:\d{2})?(\.\d+)?$/.test(line) ? parseTimestamp(line) : null;
    if (asStamp !== null) {
      pending = asStamp;
      continue;
    }

    // Or the timestamp sits at the head of the same line.
    const inline = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.*)$/);
    if (inline) {
      const at = parseTimestamp(inline[1]);
      if (at !== null) {
        stamps.push({ at, text: inline[2].trim() });
        pending = null;
        continue;
      }
    }

    if (pending !== null) {
      stamps.push({ at: pending, text: line });
      pending = null;
    } else if (stamps.length > 0) {
      // A caption wrapped onto a second line belongs to the line above it.
      stamps[stamps.length - 1].text += ` ${line}`;
    }
  }

  return joinIntoSentences(stamps);
}

/**
 * Captions are cut for reading speed, not for meaning: they break mid-clause
 * every two or three seconds, and a sentence often ends in the middle of one.
 * Dictating those fragments teaches nothing, so the captions are stitched back
 * into a single stream and then cut again — this time where the speaker's
 * sentences actually end.
 *
 * Because a sentence can end mid-caption, its boundary has no timestamp of its
 * own. The time is taken from the caption the boundary falls in, which is
 * accurate to a couple of seconds — close enough for a replay button, and the
 * reason each segment is given a small tail rather than a hard cut.
 */
function joinIntoSentences(stamps: { at: number; text: string }[]): VideoSegment[] {
  if (stamps.length === 0) return [];

  // One stream of text, remembering which caption each character came from.
  let stream = "";
  const timeAt: number[] = [];
  stamps.forEach((stamp, i) => {
    const piece = (i === 0 ? "" : " ") + stamp.text.trim();
    for (let c = 0; c < piece.length; c++) timeAt.push(stamp.at);
    stream += piece;
  });

  const out: VideoSegment[] = [];
  let from = 0;

  const push = (to: number) => {
    const text = stream.slice(from, to).replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length >= 3) {
      const start = timeAt[from] ?? 0;
      const nextStart = timeAt[to] ?? null;

      // A sentence that begins and ends inside one caption shares that
      // caption's single timestamp, which would make the segment zero seconds
      // long and play nothing at all. Speech runs at roughly three words a
      // second, so that is the floor.
      const spoken = Math.max(1.5, words.length * 0.35);
      const end = Math.max(nextStart ?? start + 4, start + spoken);
      out.push({ start, end, text });
    }
    from = to;
  };

  for (let i = 0; i < stream.length; i++) {
    const ch = stream[i];
    if (ch === "." || ch === "!" || ch === "?") {
      // Skip a closing quote or bracket, then require a space or the end.
      let j = i + 1;
      while (j < stream.length && /["')\]]/.test(stream[j])) j++;
      if (j >= stream.length || /\s/.test(stream[j])) {
        push(j);
        while (from < stream.length && /\s/.test(stream[from])) from++;
        i = from - 1;
      }
    }
  }

  if (from < stream.length) push(stream.length);

  // A speaker who never finishes a sentence would otherwise produce one
  // enormous segment; split anything unreasonable at a word boundary.
  const capped: VideoSegment[] = [];
  for (const segment of out) {
    const words = segment.text.split(/\s+/);
    if (words.length <= 30) {
      capped.push(segment);
      continue;
    }
    const chunks = Math.ceil(words.length / 24);
    const span = (segment.end - segment.start) / chunks;
    for (let c = 0; c < chunks; c++) {
      capped.push({
        start: segment.start + span * c,
        end: segment.start + span * (c + 1),
        text: words.slice(c * 24, (c + 1) * 24).join(" "),
      });
    }
  }

  return capped;
}
