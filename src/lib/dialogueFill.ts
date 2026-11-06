import type { DialogueFillStep } from "@/data/trackModel";

/** A stable bank of whole replies, independent of the learner's placements. */
export function dialogueReplyOrder(step: DialogueFillStep): number[] {
  const ids = step.replies.map((_, id) => id);
  let seed = [...step.id].reduce((value, ch) => (Math.imul(value, 31) + ch.charCodeAt(0)) >>> 0, 7);
  for (let i = ids.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  // Never give away the answer by presenting replies in dialogue order.
  return ids.every((id, index) => id === index) ? [...ids.slice(1), ids[0]] : ids;
}

export function dialogueReady(step: DialogueFillStep, selected: readonly number[]): boolean {
  return selected.length === step.replies.length && new Set(selected).size === selected.length &&
    selected.every(id => Number.isInteger(id) && id >= 0 && id < step.replies.length);
}
export function dialogueCorrect(step: DialogueFillStep, selected: readonly number[]): boolean {
  return dialogueReady(step, selected) && selected.every((id, gap) => id === gap);
}
