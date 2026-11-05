import { findLesson, trackModules } from "@/data/track";

export const FREE_LISTENING_FRAGMENTS = 10;

/** Browsing stays free; only lessons after the introductory block need Pro. */
export function isFreeSlangPath(pathname: string): boolean {
  let parts: string[];
  try { parts = pathname.split("/").map(decodeURIComponent); } catch { return false; }
  const [, section, topic, id] = parts;
  if (section !== "slang" || topic !== "track" || !id) return true;
  const found = findLesson(id);
  return !found || found.module.id === trackModules[0].id;
}
