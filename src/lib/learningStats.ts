import { trackLessons, type Step } from "@/data/track";

/** Count only known completed lessons and first introductions, never replays. */
export function summarizeTrack(doneIds: readonly string[]) {
  const done = new Set(doneIds);
  const completed = trackLessons().filter(({ lesson }) => done.has(lesson.id));
  const expressions = new Set<string>();
  for (const { lesson } of completed) {
    for (const step of lesson.steps) {
      if (step.kind === "rule") step.forms?.forEach(form => expressions.add(form.short));
    }
  }
  return { lessons: completed.length, expressions: expressions.size };
}

/** A lesson summary includes both new expressions and material practised again. */
export function practicedExpressions(steps: readonly Step[]): string[] {
  return [...new Set(steps.flatMap(step => step.kind === "match"
    ? step.pairs.map(([expression]) => expression)
    : "teaches" in step ? step.teaches ?? [] : []))];
}
