import type { VideoExercise } from "./videoDictation";

/**
 * Video exercises the learner added themselves.
 *
 * Kept in this browser rather than on the server, deliberately. The transcript
 * of someone else's video is their text, not ours: one person keeping a
 * transcript to study from is ordinary use, and a site publishing a library of
 * them to everyone is a different thing entirely. Storing these locally keeps
 * the feature on the right side of that line while it is being tried out.
 */

const KEY = "videoExercises";

export function getVideoExercises(): VideoExercise[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VideoExercise[]) : [];
  } catch {
    return [];
  }
}

export function saveVideoExercise(exercise: VideoExercise): void {
  const all = getVideoExercises().filter((item) => item.id !== exercise.id);
  try {
    localStorage.setItem(KEY, JSON.stringify([exercise, ...all]));
  } catch {
    // Out of storage is not worth losing the session over.
  }
}

export function removeVideoExercise(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(getVideoExercises().filter((item) => item.id !== id)));
  } catch {
    /* ignore */
  }
}
