import { localize, localizeTemplate } from "@/i18n/content";
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
      forms?: { short: string; long: string; fullForm?: string; note?: string; noteRu?: string; usageRu?: string }[];
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
      reply?: { context: string; expression: string; forms: string[] };
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
  /** Old completion records that cover every expression in this lesson. */
  legacyCompletionIds?: string[];
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
  /** Source material retained for curriculum regrouping and progress migration. */
  sourceLessons?: LessonSpec[];
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
  gapDistractors?: string[];
  translationRu: string;
  translationEn: string[];
  aliases?: string[];
  fullForm?: string;
  register?: Register;
  registerRooms?: { labelRu: string; ok: boolean }[];
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
  "a blessing in disguise": localize("неприятность, которая обернулась благом"),
  "built different": localize("не такой, как все"),
  "come again?": localize("повтори, пожалуйста"),
  "go out on a limb": localize("рискнуть, высказав мнение или поддержав кого-то"),
  lemme: localize("позволь мне"),
  "maybe some other time": localize("может, в другой раз"),
  fr: localize("серьёзно"),
  highkey: localize("очень"),
  "I don't think so": localize("думаю, что нет"),
  "know the drill": localize("знать, что и как делать"),
  "off the hook": localize("свободен от обязанности"),
  "piece of shit": localize("полное д*рьмо"),
};

function primaryMeaning(expression: Pick<ExpressionSpec, "short" | "meaningRu">): string {
  return primaryMeaningOverrides[expression.short] ?? expression.meaningRu.split(/[;,]/, 1)[0].trim();
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
    localizeTemplate("Что значит «{{p0}}»?", [expression.short]),
    undefined,
    primaryMeaning(expression),
    expression.wrong,
    `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    [expression.short],
  );
}

function gapChoice(expression: ExpressionSpec, pool: ExpressionSpec[], id: string): ChoiceStep {
  // Synonyms can both fit the same sentence. Never mark a valid synonym wrong.
  const interchangeableGroups = [
    ["over the moon", "on cloud nine"], ["tq", "thx"],
    ["my bad", "that's on me"], ["I'm down", "count me in", "I'm game"],
    ["tbh", "imo", "imho", "fwiw", "tbf"],
    ["say less", "no biggie", "all good", "nbd", "dw"],
    ["be for real", "you can't be serious"],
    ["a silver lining", "the light at the end of the tunnel"],
  ];
  const interchangeable = interchangeableGroups.find((group) => group.includes(expression.short)) ?? [];
  const distractors = pool
    .filter((item) => item.short !== expression.short && !interchangeable.includes(item.short))
    .map((item) => item.gapAnswers?.[0] ?? item.short);
  if (distractors.length === 0) {
    distractors.push(...["break a leg", "chill out"].filter((phrase) => phrase !== expression.short));
  }
  return choiceStep(
    id,
    localize("Вставь пропущенное выражение"),
    `${expression.before}_____${expression.after}\n«${expression.gapRu}»`,
    expression.gapAnswers?.[0] ?? expression.short,
    distractors,
    `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    [expression.short],
  );
}

function sentenceAssembly(expression: ExpressionSpec, id: string): Extract<Step, { kind: "assemble" }> {
  const canonical = expression.translationEn[0];
  return {
    kind: "assemble",
    id,
    promptRu: localize("Собери предложение из слов"),
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

/** Practical boundaries shown before the learner uses a new expression. */
function usageHint(expression: ExpressionSpec, kind: LessonSpec["kind"]): string {
  const term = expression.short.toLowerCase();
  if (["piece of shit", "douchebag", "bitching", "bullshit", "idgaf", "ffs"].includes(term))
    return localize("Где: только среди близких, которым привычен мат. Риск: может оскорбить; не для работы и незнакомых.");
  if (["lmao", "deadass", "badass", "damn", "that sucks"].includes(term))
    return localize("Где: друзья и неформальные чаты. Есть грубый оттенок — не для официального общения.");
  if (term === "nvm") return localize("Где: личный чат, когда просьба уже не актуальна. На важное сообщение может прозвучать пренебрежительно.");
  if (term === "break a leg") return localize("Где: пожелание удачи перед выступлением или важной попыткой. Не буквальный совет.");
  if (term === "a piece of cake") return localize("Где: разговор о лёгкой задаче. Не обесценивай чужие трудности: человеку она может даваться тяжело.");
  if (kind === "chat") return expression.fullForm
    ? localize("Где: личные сообщения и неформальные чаты. В официальном письме используй полную форму.")
    : localize("Где: неформальная переписка. Учитывай тон из пояснения; незнакомому человеку лучше ответить нейтрально.");
  if (kind === "idiom") return localize("Где: разговор и неформальная переписка в ситуации из примера. В документах лучше сказать буквально.");
  return localize("Где: непринуждённый разговор. Смысл и резкость зависят от интонации и отношений с собеседником.");
}

function friendReply(spec: LessonSpec): Extract<Step, { kind: "type" }> {
  for (let i = 1; i < spec.lines.length; i++) {
    if (Boolean(spec.lines[i].me) === Boolean(spec.lines[i - 1].me)) continue;
    for (const expression of spec.expressions) {
      const forms = [expression.short, ...(expression.aliases ?? []), ...(expression.fullForm ? [expression.fullForm] : [])];
      const phraseTail = expression.short.split(" ").slice(-2).join(" ");
      const candidates = [...forms, ...(expression.gapAnswers ?? []), ...expression.translationEn,
        ...(expression.short.split(" ").length >= 3 ? [phraseTail] : [])];
      const target = candidates.find(form => spec.lines[i].text.toLowerCase().includes(form.toLowerCase().replace(/[.!?]+$/, "")));
      if (!target) continue;
      const answer = spec.lines[i].text;
      const context = spec.lines.slice(Math.max(0, i - 2), i)
        .map(line => localizeTemplate("{{p0}}: {{p1}}", [Boolean(line.me) === Boolean(spec.lines[i - 1].me) ? localize("Друг") : localize("Ты"), line.text])).join("\n");
      return {
        kind: "type", id: `${spec.id}-reply`,
        promptRu: localizeTemplate("Ответь другу — используй «{{p0}}»", [expression.short]),
        quote: context,
        hint: localize("Напиши короткую реплику по-английски. Можно своими словами."),
        answers: [answer], teaches: [expression.short],
        reply: { context, expression: expression.short, forms },
      };
    }
  }
  throw new Error(`No contextual reply in ${spec.id}`);
}

/** Usage matters as much as meaning: a correct phrase in the wrong room is
   still the wrong phrase. These are selection tasks, not typed judgements. */
function registerChoice(expression: ExpressionSpec, kind: LessonSpec["kind"], id: string): Extract<Step, { kind: "register" }> {
  const neutral = expression.register === "neutral" || neutralExpressions.has(expression.short);
  const rooms = kind === "idiom"
    ? [
        { labelRu: localize("Разговор с другом"), ok: true },
        { labelRu: localize("Неформальная беседа с коллегами"), ok: true },
        { labelRu: localize("Личная переписка"), ok: true },
        { labelRu: localize("Официальный документ или заявление"), ok: neutral },
      ]
    : [
        { labelRu: localize("Личный чат с другом"), ok: true },
        { labelRu: kind === "chat" ? localize("Неформальный групповой чат") : localize("Разговор с близким человеком"), ok: true },
        { labelRu: localize("Официальное письмо в университет"), ok: false },
        { labelRu: localize("Деловое письмо незнакомому человеку"), ok: false },
      ];
  return {
    kind: "register",
    id,
    phrase: expression.short,
    rooms: expression.registerRooms ?? rooms,
    whyRu: `${expression.short} — ${primaryMeaning(expression)}. ${expression.noteRu}`,
    register: expression.register ?? (neutral ? "neutral" : expression.short === "fair enough" ? "casual" : kind === "speech" ? "veryCasual" : "casual"),
    teaches: [expression.short],
  };
}

/** A short lesson: context, recognition, recall, pairs and a situation. */
export function teachingLesson(spec: LessonSpec): TrackLesson {
  const [first, second] = spec.expressions;
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
          noteRu: item.fullForm && item.noteRu.toLowerCase().startsWith(item.fullForm.toLowerCase())
            ? item.noteRu.slice(item.fullForm.length).replace(/^[.?!\s]+/, "") : item.noteRu,
          usageRu: usageHint(item, spec.kind),
        })),
      },
      {
        kind: "chat",
        id: `${spec.id}-chat`,
        title: "Expressions in context",
        titleRu: localize("Выражения в переписке"),
        withWhom: spec.withWhomRu,
        withWhomRu: spec.withWhomRu,
        lines: spec.lines,
      },
      meaningChoice(first, `${spec.id}-meaning`),
      gapChoice(second, expressions, `${spec.id}-gap`),
      {
        kind: "type", id: `${spec.id}-recall-first`,
        promptRu: primaryMeaning(first) === primaryMeaning(second) ? localizeTemplate("Напиши сокращение из {{p0}} букв", [first.short.length]) : localize("Напиши выражение из этого урока"),
        quote: `«${primaryMeaning(first)}»`,
        answers: [first.short, ...(first.aliases ?? []), ...(first.fullForm ? [first.fullForm] : [])],
        teaches: [first.short],
      },
      {
        kind: "type",
        id: `${spec.id}-recall`,
        promptRu: primaryMeaning(first) === primaryMeaning(second) ? localizeTemplate("Напиши сокращение из {{p0}} букв", [second.short.length]) : localize("Напиши выражение из этого урока"),
        quote: `«${primaryMeaning(second)}»`,
        answers: [second.short, ...(second.aliases ?? []), ...(second.fullForm ? [second.fullForm] : [])],
        teaches: [second.short],
      },
      sentenceAssembly(first, `${spec.id}-assemble-first`),
      sentenceAssembly(second, `${spec.id}-assemble`),
      {
        kind: "match",
        id: `${spec.id}-match`,
        promptRu: localize("Соедини пары"),
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
      friendReply(spec),
      registerChoice(first, spec.kind, `${spec.id}-register`),
    ],
  };
}

/** No new material in a review: only mixed recall from this block. */
function reviewLesson(id: string, title: string, titleRu: string, specs: LessonSpec[]): TrackLesson {
  // Keep reviews as balanced as teaching lessons: at most one rude expression.
  const rudeExpressions = new Set(["piece of shit", "idgaf", "bitching", "badass", "douchebag", "damn", "bullshit", "deadass", "lmao", "that sucks", "ffs"]);
  let hasRudeExpression = false;
  const expressions = specs.flatMap((spec) => spec.expressions).filter((expression) => {
    if (!rudeExpressions.has(expression.short)) return true;
    if (hasRudeExpression) return false;
    hasRudeExpression = true;
    return true;
  });
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
    titleRu: localizeTemplate("Закрепление: {{p0}}", [titleRu]),
    subtitleRu: localize("Без новых правил — только практика и повторение."),
    steps: [
      {
        kind: "match",
        id: `${id}-match-a`,
        promptRu: localize("Соедини выражения и их значения"),
        pairs: expressions.slice(0, middle).map((item): [string, string] => [item.short, primaryMeaning(item)]),
        teaches: expressions.slice(0, middle).map((item) => item.short),
      },
      meaningChoice(second, `${id}-meaning`),
      gapChoice(third, expressions, `${id}-gap`),
      {
        kind: "match",
        id: `${id}-match-b`,
        promptRu: localize("Соедини оставшиеся выражения и значения"),
        pairs: expressions.slice(middle).map((item): [string, string] => [item.short, primaryMeaning(item)]),
        teaches: expressions.slice(middle).map((item) => item.short),
      },
      sentenceAssembly(first, `${id}-assemble`),
      meaningChoice(last, `${id}-last`),
      sentenceAssembly(last, `${id}-assemble-last`),
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
    sourceLessons: [chat, idiom, speech],
    lessons: [
      teachingLesson(chat),
      teachingLesson(idiom),
      teachingLesson(speech),
      reviewLesson(`${id}-check`, title, titleRu, [chat, idiom, speech]),
    ],
  };
}
