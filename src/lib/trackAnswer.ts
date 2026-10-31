import type { Step } from "@/data/track";
import { askModel } from "./aiClient";

type TypedStep = Extract<Step, { kind: "type" | "gap" }>;

/** Case, apostrophes, spacing and trailing punctuation are not the skill. */
export function sameAnswer(a: string, b: string): boolean {
  const normalize = (value: string) => value
    .trim()
    .toLowerCase()
    .replace(/['’‘ʼ`´]/g, "")
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ");
  return normalize(a) === normalize(b);
}

/**
 * Exact/local checking stays instant. Only open translation tasks use the
 * model: gap and recall tasks ask for one particular expression, so a looser
 * semantic judgement would let the learner skip the material being taught.
 * If the model is unavailable, the existing local verdict remains in force.
 */
export async function judgeTypedAnswer(step: TypedStep, typed: string): Promise<boolean> {
  if (step.answers.some((answer) => sameAnswer(typed, answer))) return true;
  if (step.kind !== "type" || !step.id.endsWith("-translate")) return false;

  try {
    const content = await askModel({
      model: "gpt-4o-mini",
      temperature: 0,
      max_completion_tokens: 80,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You check short Russian-to-English translations in an informal-English course.",
            "Judge meaning and natural usage, not exact string equality.",
            "Accept correct alternative wording, contractions, omitted apostrophes, capitalization differences, and chat spellings such as 'u' for 'you'.",
            "This is informal chat practice: accept minor grammar or wording imperfections when the intended sentence is still clear, for example 'tq, that u send me the link' for 'Спасибо, что прислал ссылку'.",
            "The answer must preserve the full meaning and include the taught expression or its accepted full form.",
            "Reject a missing target expression, changed or unclear meaning, and errors that make the sentence incomprehensible.",
            'Return only JSON in this shape: {"correct":true} or {"correct":false}.',
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            russianPrompt: step.quote,
            learnerAnswer: typed,
            referenceAnswers: step.answers,
            taughtExpression: step.teaches?.[0],
          }),
        },
      ],
    });
    const verdict = JSON.parse(content) as { correct?: unknown };
    return verdict.correct === true;
  } catch {
    return false;
  }
}
