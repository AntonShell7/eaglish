import type { Register } from "./slangDialogues";

/** One screen in a lesson. Word-tile assembly is deliberately not a format. */
export type Step =
  | {
      kind: "rule";
      id: string;
      title: string;
      titleRu: string;
      body: string;
      bodyRu: string;
      forms?: { short: string; long: string; fullForm?: string; note?: string; noteRu?: string }[];
    }
  | {
      kind: "chat";
      id: string;
      title: string;
      titleRu: string;
      withWhom: string;
      withWhomRu: string;
      lines: { me?: boolean; text: string; at: string; glossRu?: string }[];
    }
  | {
      kind: "choice";
      id: string;
      prompt: string;
      promptRu: string;
      quote?: string;
      options: string[];
      answer: number;
      whyRu: string;
      teaches?: string[];
    }
  | {
      kind: "match";
      id: string;
      promptRu: string;
      pairs: [string, string][];
      teaches?: string[];
    }
  | {
      kind: "type";
      id: string;
      promptRu: string;
      quote?: string;
      hint?: string;
      answers: string[];
      teaches?: string[];
    }
  | {
      kind: "gap";
      id: string;
      promptRu: string;
      /** Full Russian context, so the missing expression is unambiguous. */
      quote: string;
      before: string;
      after: string;
      answers: string[];
      teaches?: string[];
    }
  | {
      kind: "register";
      id: string;
      phrase: string;
      rooms: { labelRu: string; ok: boolean }[];
      whyRu: string;
      register: Register;
      teaches?: string[];
    };

export type TrackKind = "chat" | "idiom" | "speech" | "review";

export interface TrackLesson {
  id: string;
  kind: TrackKind;
  title: string;
  titleRu: string;
  subtitleRu: string;
  review?: boolean;
  steps: Step[];
}

export interface TrackModule {
  id: string;
  title: string;
  titleRu: string;
  subtitle: string;
  subtitleRu: string;
  tone: "mint";
  lessons: TrackLesson[];
}

export interface ExpressionSpec {
  short: string;
  meaningRu: string;
  noteRu: string;
  wrong: [string, string];
  before: string;
  after: string;
  gapRu: string;
  gapAnswers?: string[];
  translationRu: string;
  translationEn: string[];
  aliases?: string[];
  fullForm?: string;
}

export interface LessonSpec {
  id: string;
  kind: Exclude<TrackKind, "review">;
  title: string;
  titleRu: string;
  subtitleRu: string;
  ruleTitleRu: string;
  introRu: string;
  withWhomRu: string;
  lines: { me?: boolean; text: string; at: string; glossRu?: string }[];
  expressions: [ExpressionSpec, ExpressionSpec, ...ExpressionSpec[]];
  reviewPairs?: [string, string][];
  scenario: {
    promptRu: string;
    quote: string;
    options: string[];
    answer: number;
    whyRu: string;
  };
}

function meaningChoice(expression: ExpressionSpec, id: string): Extract<Step, { kind: "choice" }> {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const answer = seed % 3;
  const options = [expression.meaningRu, ...expression.wrong];
  const offset = (3 - answer) % 3;
  const rotated = options.map((_, index) => options[(index + offset) % options.length]);
  return {
    kind: "choice",
    id,
    prompt: `What does ${expression.short} mean?`,
    promptRu: `Что значит «${expression.short}»?`,
    options: rotated,
    answer,
    whyRu: `${expression.short} — ${expression.meaningRu}. ${expression.noteRu}`,
    teaches: [expression.short],
  };
}

/** A short lesson: context, recognition, recall, pairs and a situation. */
export function teachingLesson(spec: LessonSpec): TrackLesson {
  const [first, second, third = second] = spec.expressions;
  const expressions = spec.expressions;
  return {
    id: spec.id,
    kind: spec.kind,
    title: spec.title,
    titleRu: spec.titleRu,
    subtitleRu: spec.subtitleRu,
    steps: [
      {
        kind: "rule",
        id: `${spec.id}-rule`,
        title: spec.expressions.map((item) => item.short).join(" · "),
        titleRu: spec.ruleTitleRu,
        body: spec.introRu,
        bodyRu: spec.introRu,
        forms: expressions.map((item) => ({
          short: item.short,
          long: item.meaningRu,
          fullForm: item.fullForm,
          noteRu: item.noteRu,
        })),
      },
      {
        kind: "chat",
        id: `${spec.id}-chat`,
        title: "Expressions in context",
        titleRu: "Выражения в контексте",
        withWhom: spec.withWhomRu,
        withWhomRu: spec.withWhomRu,
        lines: spec.lines,
      },
      meaningChoice(first, `${spec.id}-meaning`),
      {
        kind: "gap",
        id: `${spec.id}-gap`,
        promptRu: "Вставь подходящее выражение",
        quote: `«${second.gapRu}»`,
        before: second.before,
        after: second.after,
        answers: second.gapAnswers ?? [second.short],
        teaches: [second.short],
      },
      {
        kind: "type",
        id: `${spec.id}-translate`,
        promptRu: "Переведи фразу на английский",
        quote: `«${third.translationRu}»`,
        answers: third.translationEn,
        teaches: [third.short],
      },
      {
        kind: "match",
        id: `${spec.id}-match`,
        promptRu: spec.reviewPairs?.length
          ? "Соедини пары — среди них есть выражения из прошлых уроков"
          : "Соедини выражения и их значения",
        pairs: [
          ...expressions.map((item): [string, string] => [item.short, item.meaningRu]),
          ...(spec.reviewPairs ?? []),
        ],
        teaches: expressions.map((item) => item.short),
      },
      {
        kind: "choice",
        id: `${spec.id}-scenario`,
        prompt: spec.scenario.promptRu,
        promptRu: spec.scenario.promptRu,
        quote: spec.scenario.quote,
        options: spec.scenario.options,
        answer: spec.scenario.answer,
        whyRu: spec.scenario.whyRu,
      },
      {
        kind: "type",
        id: `${spec.id}-recall`,
        promptRu: "Вспомни выражение и напиши его по-английски",
        quote: `«${first.meaningRu}»`,
        answers: [first.short, ...(first.aliases ?? [])],
        teaches: [first.short],
      },
    ],
  };
}

/** No new material in a review: only mixed recall from this block. */
function reviewLesson(id: string, title: string, titleRu: string, specs: LessonSpec[]): TrackLesson {
  const expressions = specs.flatMap((spec) => spec.expressions);
  const middle = Math.ceil(expressions.length / 2);
  const second = expressions[Math.min(2, expressions.length - 1)];
  const third = expressions[Math.min(4, expressions.length - 1)];
  const last = expressions[expressions.length - 1];
  const first = expressions[0];
  return {
    id,
    kind: "review",
    review: true,
    title: `Review: ${title}`,
    titleRu: `Закрепление: ${titleRu}`,
    subtitleRu: "Без новых правил — только практика и повторение.",
    steps: [
      {
        kind: "match",
        id: `${id}-match-a`,
        promptRu: "Соедини выражения и их значения",
        pairs: expressions.slice(0, middle).map((item): [string, string] => [item.short, item.meaningRu]),
        teaches: expressions.slice(0, middle).map((item) => item.short),
      },
      meaningChoice(second, `${id}-meaning`),
      {
        kind: "gap",
        id: `${id}-gap`,
        promptRu: "Вставь пропущенное выражение",
        quote: `«${third.gapRu}»`,
        before: third.before,
        after: third.after,
        answers: third.gapAnswers ?? [third.short],
        teaches: [third.short],
      },
      {
        kind: "match",
        id: `${id}-match-b`,
        promptRu: "Теперь ещё несколько пар",
        pairs: expressions.slice(middle).map((item): [string, string] => [item.short, item.meaningRu]),
        teaches: expressions.slice(middle).map((item) => item.short),
      },
      {
        kind: "type",
        id: `${id}-translate`,
        promptRu: "Переведи фразу без подсказок",
        quote: `«${first.translationRu}»`,
        answers: first.translationEn,
        teaches: [first.short],
      },
      meaningChoice(last, `${id}-last`),
    ],
  };
}

export function cycle(
  id: string,
  title: string,
  titleRu: string,
  subtitle: string,
  subtitleRu: string,
  chat: LessonSpec,
  idiom: LessonSpec,
  speech: LessonSpec,
): TrackModule {
  return {
    id,
    title,
    titleRu,
    subtitle,
    subtitleRu,
    tone: "mint",
    lessons: [
      teachingLesson(chat),
      teachingLesson(idiom),
      teachingLesson(speech),
      reviewLesson(`${id}-check`, title, titleRu, [chat, idiom, speech]),
    ],
  };
}
