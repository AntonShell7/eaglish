import { localize } from "@/i18n/content";
import type { DialogueFillStep, TrackModule } from "./trackModel";
import authored from "./trackDialoguePractice.json";

type AuthoredDialogue = Pick<DialogueFillStep, "scene" | "sceneRu" | "lines" | "replies" | "teaches">;
const dialogues = authored as Record<string, AuthoredDialogue>;

export function addDialoguePractice(modules: TrackModule[]): TrackModule[] {
  return modules.map(module => ({ ...module, lessons: module.lessons.map(lesson => {
    const source = dialogues[lesson.id];
    if (!source) return lesson;
    const step: DialogueFillStep = {
      ...source, id: `${lesson.id}-dialogue-fill`, kind: "dialogueFill",
      sceneRu: localize(source.sceneRu),
      lines: source.lines.map(line => ({ ...line, glossRu: localize(line.glossRu) })),
    };
    const steps = [...lesson.steps];
    steps.splice(Math.max(0, steps.length - 1), 0, step);
    return { ...lesson, steps };
  }) }));
}
