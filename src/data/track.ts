import { trackModules, legacyLessonAliases } from "./trackCurriculum";
import type { TrackModule, TrackLesson } from "./trackModel";

export * from "./trackModel";
export { trackModules } from "./trackCurriculum";

export function trackLessons(): { module: TrackModule; lesson: TrackLesson }[] {
  return trackModules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
}

export function findLesson(id: string) {
  return trackLessons().find((entry) => entry.lesson.id === (legacyLessonAliases[id] ?? id)) ?? null;
}
