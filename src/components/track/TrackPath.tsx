import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trackModules, type TrackLesson } from "@/data/track";
import { currentLessonId, doneLessons, resetTrack } from "@/lib/trackProgress";
import "./track.css";

/**
 * The module, and its lessons as a path.
 *
 * The path was briefly replaced by a numbered list, on the argument that the
 * list carries the same information without borrowing anybody's shape. It
 * carries the information and not the pull: a row of type is something you
 * read, a node is something you press. The idea was always right; what was
 * wrong was the drawing, so the drawing is what changed — the geometry here
 * is measured rather than guessed, and the press comes from the one mechanic
 * the whole section shares.
 */
export function TrackPath({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { t } = useTranslation();
  const current = currentLessonId();
  /* Read once per render rather than per row: isDone() parses the same JSON
     every time it is called. */
  const done = new Set(doneLessons());
  const [asking, setAsking] = useState(false);
  const [, bump] = useState(0);

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
              <div className="tk-path">
                {module.lessons.map((lesson, index) => {
                  const isPast = done.has(lesson.id);
                  const here = current === lesson.id;
                  const locked = !isPast && !here;
                  return (
                    <div
                      className={`tk-step${locked ? " tk-step--locked" : ""}${
                        here ? " tk-step--here" : ""
                      }`}
                      key={lesson.id}
                    >
                      <div className="tk-node-wrap">
                        {here && <span className="tk-start">{t("track.start")}</span>}
                        <button
                          type="button"
                          className={`tk-press tk-node${
                            isPast ? " tk-node--done" : locked ? " tk-node--locked" : ""
                          }`}
                          disabled={locked}
                          onClick={() => onOpen(lesson.id)}
                          aria-label={lesson.titleRu}
                        >
                          <NodeMark done={isPast} review={lesson.review} locked={locked} />
                        </button>
                      </div>
                      <span className="tk-label">
                        {index + 1}. {lesson.titleRu}
                        <small>
                          {isPast
                            ? t("track.passed")
                            : t("track.minutes", { count: minutesOf(lesson) })}
                        </small>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/**
 * What sits inside a node.
 *
 * A shape rather than the lesson's first abbreviation, which is what used to
 * be here: "np" drawn inside a circle read as the lesson's name, so the path
 * announced a lesson called np. The title is already written underneath.
 */
function NodeMark({ done, review, locked }: { done: boolean; review?: boolean; locked: boolean }) {
  if (locked) {
    return (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
        <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      </svg>
    );
  }
  if (done) {
    return (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (review) {
    return (
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.95z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 11.3c0 3.9-3.8 7.1-8.5 7.1-1 0-2-.15-2.9-.42L4 19.6l1.35-3.6C4.2 14.75 3.5 13.1 3.5 11.3c0-3.93 3.8-7.1 8.5-7.1s8.5 3.17 8.5 7.1z" />
    </svg>
  );
}
