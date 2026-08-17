/**
 * Unsent writing, kept per topic.
 *
 * A 250-word essay is the longest thing anyone does in this app, and losing it
 * to a closed tab is the fastest way to lose the user with it. Drafts are saved
 * as you type and cleared once the piece has been assessed, so the hub can show
 * honestly which briefs have something waiting.
 */

export interface Draft {
  text: string;
  savedAt: number;
}

const STORAGE_KEY = "writingDrafts";

function readAll(): Record<string, Draft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Draft>) : {};
  } catch {
    return {};
  }
}

function writeAll(drafts: Record<string, Draft>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function getDrafts(): Record<string, Draft> {
  return readAll();
}

export function getDraft(topicId: string): Draft | undefined {
  return readAll()[topicId];
}

/** Empty text removes the draft rather than storing a blank one. */
export function saveDraft(topicId: string, text: string) {
  const drafts = readAll();
  if (text.trim().length === 0) delete drafts[topicId];
  else drafts[topicId] = { text, savedAt: Date.now() };
  writeAll(drafts);
}

export function clearDraft(topicId: string) {
  const drafts = readAll();
  delete drafts[topicId];
  writeAll(drafts);
}
