import type { ExpressionSpec, LessonSpec } from "./trackModel";
import { pairDialogue } from "./trackPairDialogues";

/** A deliberately small lesson; each example and task uses only this pair. */
export function pairSpec(
  id: string,
  kind: LessonSpec["kind"],
  expressions: [ExpressionSpec, ExpressionSpec],
  overrides: Partial<Omit<LessonSpec, "id" | "kind" | "expressions">> = {},
): LessonSpec {
  const [first, second] = expressions;
  const title = expressions.map((item) => item.short).join(" · ");
  const spec: LessonSpec = {
    id, kind, expressions,
    title, titleRu: title, ruleTitleRu: title,
    introRu: expressions.map((item) => `${item.short} — ${item.meaningRu}. ${item.noteRu}`).join("\n\n"),
    withWhomRu: "Майя", lines: overrides.lines ?? pairDialogue(id),
    // No extra review vocabulary inside a two-expression teaching lesson.
    reviewPairs: [],
    scenario: {
      promptRu: "Выбери подходящую реплику",
      quote: first.translationRu,
      options: [first.translationEn[0], second.translationEn[0], "Could you repeat that, please?"],
      answer: 0,
      whyRu: `${first.translationEn[0]} — ${first.translationRu}. ${first.noteRu}`,
    },
    ...overrides,
    // The card must always describe exactly the expressions being taught.
    subtitleRu: `${first.short} · ${second.short}`,
  };
  // Restore the short Russian hints under target expressions in the chat.
  spec.lines = spec.lines.map((line) => {
    if (line.glossRu) return line;
    const matches = expressions.filter((expression) =>
      [expression.short, ...(expression.aliases ?? []), ...(expression.gapAnswers ?? [])]
        .some((phrase) => line.text.toLowerCase().includes(phrase.toLowerCase())));
    return { ...line, ...(matches.length ? { glossRu: matches.map((expression) => `${expression.short} — ${expression.meaningRu}`).join("; ") } : {}) };
  });
  return spec;
}
