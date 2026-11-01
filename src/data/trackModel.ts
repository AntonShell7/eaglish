import type { Register } from "./slangDialogues";
import { sameWordBank } from "../lib/assembly";

/** One screen in a lesson. */
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
      kind: "assemble";
      id: string;
      promptRu: string;
      quote: string;
      /** Every accepted order uses exactly the words in the first answer. */
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

type ChoiceStep = Extract<Step, { kind: "choice" }>;

/* The theory card may show nearby variants. Practice uses one stable meaning,
   so a learner is never asked to choose between two equally valid synonyms. */
const primaryMeaningOverrides: Record<string, string> = {
  "built different": "не такой, как все",
  fr: "серьёзно",
  "know the drill": "знать, что и как делать",
};

function primaryMeaning(expression: Pick<ExpressionSpec, "short" | "meaningRu">): string {
  return primaryMeaningOverrides[expression.short] ?? expression.meaningRu.split(/[;,]/, 1)[0].trim();
}

const primaryGlossOverrides: Record<string, string> = {
  "built different — не такой, как все, особенный": "не такой, как все",
  "know the drill — знаю, что и как делать": "знаю, что и как делать",
  "ofc — конечно, само собой; fr — правда, серьёзно": "конечно; серьёзно",
  "What the hell — что, чёрт возьми, случилось": "что, чёрт возьми, случилось",
  "lowkey — слегка, по-тихому; здесь — не афишируя своего восторга": "по-тихому",
};

function primaryGloss(gloss: string | undefined): string | undefined {
  if (!gloss) return undefined;
  if (primaryGlossOverrides[gloss]) return primaryGlossOverrides[gloss];
  return gloss.split(";").map((part) => {
    const separator = part.lastIndexOf("—");
    if (separator === -1) return "";
    return part.slice(separator + 1).trim().split(/[;,]/, 1)[0].trim();
  }).filter(Boolean).join("; ");
}

function choiceStep(
  id: string,
  promptRu: string,
  quote: string | undefined,
  correct: string,
  distractors: string[],
  whyRu: string,
  teaches: string[],
): ChoiceStep {
  const options = [...new Set([correct, ...distractors.filter((item) => item !== correct)])].slice(0, 4);
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const answer = seed % options.length;
  const offset = (options.length - answer) % options.length;
  const rotated = options.map((_, index) => options[(index + offset) % options.length]);
  return { kind: "choice", id, prompt: promptRu, promptRu, quote, options: rotated, answer, whyRu, teaches };
}

function meaningChoice(expression: ExpressionSpec, id: string): ChoiceStep {
  return choiceStep(
    id,
    `Что значит «${expression.short}»?`,
    undefined,
    primaryMeaning(expression),
    expression.wrong,
    `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    [expression.short],
  );
}

function gapChoice(expression: ExpressionSpec, pool: ExpressionSpec[], id: string): ChoiceStep {
  return choiceStep(
    id,
    "Вставь пропущенное выражение",
    `${expression.before}_____${expression.after}\n«${expression.gapRu}»`,
    expression.gapAnswers?.[0] ?? expression.short,
    pool.map((item) => item.gapAnswers?.[0] ?? item.short),
    `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    [expression.short],
  );
}

function sentenceAssembly(expression: ExpressionSpec, id: string): Extract<Step, { kind: "assemble" }> {
  const canonical = expression.translationEn[0];
  return {
    kind: "assemble",
    id,
    promptRu: "Собери предложение из слов",
    quote: `«${expression.translationRu}»`,
    // Keep genuine word-order and punctuation variants. Alternatives that
    // need different vocabulary belong to another tile bank, not this one.
    answers: expression.translationEn.filter((answer) => sameWordBank(canonical, answer)),
    teaches: [expression.short],
  };
}

const neutralExpressions = new Set([
  "on the same page",
  "by the book",
  "on edge",
  "change my mind",
  "the best seats in the house",
]);

/** Usage matters as much as meaning: a correct phrase in the wrong room is
   still the wrong phrase. These are selection tasks, not typed judgements. */
function registerChoice(expression: ExpressionSpec, kind: LessonSpec["kind"], id: string): Extract<Step, { kind: "register" }> {
  const neutral = neutralExpressions.has(expression.short);
  const rooms = kind === "idiom"
    ? [
        { labelRu: "Разговор с другом", ok: true },
        { labelRu: "Неформальная беседа с коллегами", ok: true },
        { labelRu: "Личная переписка", ok: true },
        { labelRu: "Официальный документ или заявление", ok: neutral },
      ]
    : [
        { labelRu: "Личный чат с другом", ok: true },
        { labelRu: "Разговор с близким человеком", ok: true },
        { labelRu: "Официальное письмо в университет", ok: false },
        { labelRu: "Деловое письмо незнакомому человеку", ok: false },
      ];
  return {
    kind: "register",
    id,
    phrase: expression.short,
    rooms,
    whyRu: `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    register: neutral ? "neutral" : expression.short === "fair enough" ? "casual" : kind === "speech" ? "veryCasual" : "casual",
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
        })),
      },
      {
        kind: "chat",
        id: `${spec.id}-chat`,
        title: "Expressions in context",
        titleRu: "Выражения в переписке",
        withWhom: spec.withWhomRu,
        withWhomRu: spec.withWhomRu,
        lines: spec.lines.map((line) => ({ ...line, glossRu: primaryGloss(line.glossRu) })),
      },
      meaningChoice(first, `${spec.id}-meaning`),
      gapChoice(second, expressions, `${spec.id}-gap`),
      {
        kind: "type",
        id: `${spec.id}-recall`,
        promptRu: "Напиши выражение",
        quote: `«${primaryMeaning(second)}»`,
        answers: [second.short, ...(second.aliases ?? [])],
        teaches: [second.short],
      },
      sentenceAssembly(third, `${spec.id}-assemble`),
      {
        kind: "match",
        id: `${spec.id}-match`,
        promptRu: "Соедини пары",
        pairs: [
          ...expressions.map((item): [string, string] => [item.short, primaryMeaning(item)]),
          ...(spec.reviewPairs ?? []).map(([short, meaningRu]): [string, string] => [short, primaryMeaning({ short, meaningRu })]),
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
      registerChoice(first, spec.kind, `${spec.id}-register`),
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
        pairs: expressions.slice(0, middle).map((item): [string, string] => [item.short, primaryMeaning(item)]),
        teaches: expressions.slice(0, middle).map((item) => item.short),
      },
      meaningChoice(second, `${id}-meaning`),
      gapChoice(third, expressions, `${id}-gap`),
      {
        kind: "match",
        id: `${id}-match-b`,
        promptRu: "Соедини оставшиеся выражения и значения",
        pairs: expressions.slice(middle).map((item): [string, string] => [item.short, primaryMeaning(item)]),
        teaches: expressions.slice(middle).map((item) => item.short),
      },
      sentenceAssembly(first, `${id}-assemble`),
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
