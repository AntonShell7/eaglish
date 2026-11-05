import { localize } from "@/i18n/content";
import { trackModules as legacyModules } from "./trackContent";
import { cycle, type ExpressionSpec, type TrackModule } from "./trackModel";
import { pairSpec } from "./trackPairs";
import { newTrackModules } from "./trackNewContent";

const legacySpecs = legacyModules.flatMap((module) => module.sourceLessons ?? []);
const expressionSources = new Map(legacySpecs.flatMap((spec) => spec.expressions.map((expression) => [expression.short, { expression, lessonId: spec.id }] as const)));
export const legacyLessonAliases: Record<string, string> = {};

// IDs of reduced lessons change: completing the new pair must never imply
// completion of the third expression that belonged to the old lesson.
const reducedModules: TrackModule[] = legacyModules.map((module) => {
  const specs = module.sourceLessons!.map((spec) => {
    if (spec.expressions.length === 2) return { ...spec, reviewPairs: [] };
    const id = `${spec.id}-pair`;
    legacyLessonAliases[spec.id] = id;
    const pair: [ExpressionSpec, ExpressionSpec] = [spec.expressions[0], spec.expressions[1]];
    const answer = spec.scenario.options[spec.scenario.answer].toLowerCase();
    const keepsOriginalScenario = pair.some((expression) =>
      [expression.short, ...(expression.aliases ?? []), ...(expression.gapAnswers ?? [])]
        .some((phrase) => answer.includes(phrase.toLowerCase())));
    return pairSpec(id, spec.kind, pair, {
      withWhomRu: spec.withWhomRu,
      ...(keepsOriginalScenario ? { scenario: spec.scenario } : {}),
    });
  });
  const result = cycle(module.id, module.title, module.titleRu, module.subtitle, module.subtitleRu, specs[0], specs[1], specs[2]);
  result.lessons.slice(0, 3).forEach((lesson, index) => {
    if (lesson.id !== module.sourceLessons![index].id) lesson.legacyCompletionIds = [module.sourceLessons![index].id];
  });
  return result;
});

// Third expressions get their own two-item lessons. Categories with fewer
// leftovers revisit familiar pairs, rather than adding more unfamiliar words.
const regroupedPairs: [string, [string, string], [string, string], [string, string]][] = [
  ["Small Replies", ["tq", "thx"], ["come out on top", "a blessing in disguise"], ["that's wild", "unhinged"]],
  ["Your Take", ["tbh", "imo"], ["bite off more than you can chew", "go out on a limb"], ["kinda", "dunno"]],
  ["All Good", ["all good", "ofc"], ["get off on the wrong foot", "read between the lines"], ["maybe some other time", "suit yourself"]],
  ["Enough Already", ["smh", "so frustrating"], ["tighten your belt", "cut corners"], ["bitching", "cross the line"]],
  ["In a Nutshell", ["aka", "tl;dr"], ["on the same page", "off the hook"], ["I'm not buying it", "walk me through it"]],
  ["Need a Minute", ["gtg", "leave me alone"], ["under the weather", "lie low"], ["gotta", "you've got this"]],
  ["Just Kidding", ["autocorrect strikes again", "jk"], ["break a leg", "a piece of cake"], ["top-notch", "no hard feelings"]],
  ["Back to You", ["no cap", "hbu"], ["by the book", "take it with a grain of salt"], ["I'm dead", "no way"]],
];

const regroupedModules = regroupedPairs.map(([title, chat, idiom, speech], index) => {
  const specs = ([chat, idiom, speech] as const).map((terms, kindIndex) => {
    const kind = (["chat", "idiom", "speech"] as const)[kindIndex];
    const pair = terms.map((term) => {
      const source = expressionSources.get(term);
      if (!source) throw new Error(`Missing curriculum expression: ${term}`);
      return source.expression;
    }) as [ExpressionSpec, ExpressionSpec];
    return pairSpec(`regroup-${index + 1}-${kind}`, kind, pair);
  });
  const module = cycle(`regroup-pairs-${index + 1}`, title, title,
    "Two expressions at a time, with familiar idioms revisited.",
    localize("По два выражения за урок. Знакомые идиомы возвращаются для закрепления."),
    specs[0], specs[1], specs[2]);
  module.lessons.slice(0, 3).forEach((lesson, kindIndex) => {
    lesson.legacyCompletionIds = [...new Set(specs[kindIndex].expressions.map((expression) => expressionSources.get(expression.short)!.lessonId))];
  });
  module.lessons[3].legacyCompletionIds = [...new Set(module.lessons.slice(0, 3).flatMap((lesson) => lesson.legacyCompletionIds ?? []))];
  return module;
});

// Older scenarios referenced third expressions that now belong to later lessons.
// Keep their meaning using ordinary English, without teaching future slang early.
const scenarioWording: Record<string, string> = {
  "gtg.": "I have to leave.",
  "thx, bring a charger.": "Thanks, bring a charger.",
  "aka, I didn't like the movie.": "In other words, I didn't like the movie.",
  "tq for finding it.": "Thank you for finding it.",
  "tq!": "Thank you!",
  "hbu?": "What about you?",
  "autocorrect strikes again!": "My phone changed the spelling!",
  "kinda.": "A little.",
  "No biggie. It's all good.": "No biggie.",
  "I'm on edge.": "I'm very nervous.",
  "You wish.": "That will never happen.",
  "I have no idea.": "I don't know the answer.",
  "Your outfit is on cloud nine.": "Your outfit is feeling happy.",
  "Sam read between the lines.": "Sam understood the hidden meaning.",
  "It was a blessing in disguise.": "The problem turned out to be helpful.",
  "What a nerd.": "What a boring person.",
  "No hard feelings.": "I'm not upset with you.",
  "I'm going to lie low.": "I'm going to stay at home quietly.",
  "I'm under the weather.": "I'm feeling ill.",
  "Walk me through it.": "Explain every step to me.",
  "dunno.": "I don't know.",
  "That's top-notch.": "That's excellent.",
  "Maybe some other time.": "I can't join you today.",
  "It's under the weather.": "It's feeling ill.",
  "Do you gotta come with us?": "Do you have to come with us?",
  "Suit yourself.": "Do whatever you prefer.",
};

// One register exercise per three modules, rotating between lesson categories.
// Usage guidance remains available on every introductory card.
export const trackModules: TrackModule[] = [...reducedModules, ...regroupedModules, ...newTrackModules].map((module, index) => ({
  ...module,
  lessons: module.lessons.map((lesson, lessonIndex) => ({
    ...lesson,
    steps: lesson.steps.filter(step => step.kind !== "register" || (index % 3 === 0 && lessonIndex === Math.floor(index / 3) % 3))
      .map(step => step.kind === "choice" && step.id.endsWith("-scenario")
        ? { ...step, options: step.options.map(option => scenarioWording[option] ?? option) } : step),
  })),
}));
