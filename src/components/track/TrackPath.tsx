import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trackModules, type TrackLesson } from "@/data/track";
import { currentLessonId, doneLessons, resetTrack } from "@/lib/trackProgress";
import "./track.css";

/**
 * A module's contents.
 *
 * This was a winding path of circles, and the circles were the problem — not
 * because they were badly drawn but because they were Duolingo's, and a
 * borrowed shape arrives with the reputation of what it was borrowed from.
 * On a product people pay for, that is expensive.
 *
 * What the path got right is kept whole: exactly one lesson is open, and only
 * that one has a button. That is the single question worth asking a learner
 * who comes back in the evening — are you doing today's one — and a numbered
 * list asks it just as well as a map does, while looking like the rest of
 * this product rather than like somebody else's.
 *
 * Locked lessons are listed rather than hidden. Seeing what is ahead is most
 * of the reason anybody does what is in front of them.
 */
export function TrackPath({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { t } = useTranslation();
  const current = currentLessonId();
  /* Read once per render rather than per row: isDone() parses the same JSON
     every time it is called, and a module of eight lessons would parse it
     eight times to draw one list. */
  const done = new Set(doneLessons());
  const [asking, setAsking] = useState(false);
  const [, bump] = useState(0);

  /** Six screens is about four minutes, and a round number is honest enough. */
  const minutesOf = (lesson: TrackLesson) => Math.max(2, Math.round(lesson.steps.length * 0.7));

  return (
    <div>
      {trackModules.map((module, moduleIndex) => {
        const finished = module.lessons.filter((lesson) => done.has(lesson.id)).length;
        return (
          <section className={`tk-module tk-module--${module.tone}`} key={module.id}>
            <p className="eyebrow">
              <span className="tk-module__n">{t("track.moduleN", { n: moduleIndex + 1 })}</span>
              {module.lessons.length > 0 && (
                <> · {t("track.lessonCount", { count: module.lessons.length })}</>
              )}
            </p>
            <h2 className="tk-module__h">{module.titleRu}</h2>
            <p className="tk-module__p">{module.subtitleRu}</p>

            {module.lessons.length > 0 && (
              <div className="tk-module__state">
                <span className="tk-ticks" aria-hidden="true">
                  {module.lessons.map((lesson) => (
                    <span
                      className={`tk-tick${done.has(lesson.id) ? " tk-tick--on" : ""}`}
                      key={lesson.id}
                    />
                  ))}
                </span>
                <span className="tabular">
                  {t("track.progress", { done: finished, total: module.lessons.length })}
                </span>
                {finished > 0 && (
                  /* Two taps rather than a browser confirm box, which is the
                     one dialog nobody reads and the only one that looks like
                     a different application. */
                  <button
                    type="button"
                    className="tk-reset"
                    onClick={() => {
                      if (!asking) {
                        setAsking(true);
                        return;
                      }
                      resetTrack();
                      setAsking(false);
                      bump((n) => n + 1);
                    }}
                    onBlur={() => setAsking(false)}
                  >
                    {asking ? t("track.againSure") : t("track.again")}
                  </button>
                )}
              </div>
            )}

            {module.soon ? (
              <p className="tk-soon">{t("track.soon")}</p>
            ) : (
              <ol className="tk-list">
                {module.lessons.map((lesson, index) => {
                  const isPast = done.has(lesson.id);
                  const here = current === lesson.id;
                  const locked = !isPast && !here;
                  const open = isPast || here;
                  return (
                    <li
                      className={`tk-row${here ? " tk-row--here" : ""}${
                        locked ? " tk-row--locked" : ""
                      }${open ? " tk-row--go" : ""}`}
                      key={lesson.id}
                      onClick={open ? () => onOpen(lesson.id) : undefined}
                    >
                      <span className="tk-row__n">{index + 1}</span>

                      <div>
                        <h3 className="tk-row__h">{lesson.titleRu}</h3>
                        {/* Only the open lesson says what is inside it. A
                            finished one has already said it, and a locked one
                            has nothing to promise yet. */}
                        {here && <p className="tk-row__p">{lesson.subtitleRu}</p>}
                        {here && (
                          <button type="button" className="tk-go" onClick={() => onOpen(lesson.id)}>
                            {t("track.start")}
                          </button>
                        )}
                      </div>

                      <span className="tk-row__meta">
                        {locked
                          ? t("track.opensAfter", { n: index })
                          : `${t("track.stepCount", { count: lesson.steps.length })}${
                              isPast ? ` · ${t("track.passed")}` : ` · ${t("track.minutes", { count: minutesOf(lesson) })}`
                            }`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
