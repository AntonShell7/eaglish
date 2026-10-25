import { useTranslation } from "react-i18next";
import { trackModules } from "@/data/track";
import { currentLessonId, isDone } from "@/lib/trackProgress";
import "./track.css";

/**
 * The track, as a path.
 *
 * A list of lessons and a path hold identical information and are not the
 * same object. A list invites you to look at all of it and decide; a path has
 * one place you can be, and the only question it asks is whether you are
 * doing today's one. That is the right question for a section somebody is
 * meant to open every evening, and the wrong one for a library — which is why
 * reading and listening stay shelves and this does not.
 *
 * Locked nodes are shown rather than hidden. Seeing four more circles below
 * the one you are on is most of why anybody does the one you are on.
 */
/**
 * What sits inside a node.
 *
 * It used to be the lesson's first abbreviation — "np" drawn inside the
 * circle — and that read as the lesson's name, so the path announced a lesson
 * called "np". A shape says "a lesson" without claiming to be a title, and the
 * title is already written underneath. A tick for what is behind you, a star
 * for the check at the end of a module, a speech bubble for the rest.
 */
function NodeMark({ done, review }: { done: boolean; review?: boolean }) {
  if (done) {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (review) {
    return (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.95z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 11.3c0 3.9-3.8 7.1-8.5 7.1-1 0-2-.15-2.9-.42L4 19.6l1.35-3.6C4.2 14.75 3.5 13.1 3.5 11.3c0-3.93 3.8-7.1 8.5-7.1s8.5 3.17 8.5 7.1z" />
    </svg>
  );
}

export function TrackPath({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { t } = useTranslation();
  const current = currentLessonId();

  return (
    <div>
      {trackModules.map((module) => (
        <section className={`tk-module tk-module--${module.tone}`} key={module.id}>
          <header className="tk-band">
            <h2 className="tk-band__h">{module.titleRu}</h2>
            <p className="tk-band__p">{module.subtitleRu}</p>
            {module.lessons.length > 0 && (
              <span className="tk-band__count">
                {t("track.lessonCount", { count: module.lessons.length })}
              </span>
            )}
          </header>

          {module.soon ? (
            <p className="tk-soon">{t("track.soon")}</p>
          ) : (
            <div className="tk-path">
              {module.lessons.map((lesson) => {
                const done = isDone(lesson.id);
                const here = current === lesson.id;
                const locked = !done && !here;
                return (
                  <div className="tk-step" key={lesson.id}>
                    {here && <span className="tk-start">{t("track.start")}</span>}
                    <button
                      type="button"
                      className={`tk-node ${
                        done ? "tk-node--done" : here ? "tk-node--current" : "tk-node--locked"
                      }`}
                      disabled={locked}
                      onClick={() => !locked && onOpen(lesson.id)}
                      aria-label={lesson.titleRu}
                    >
                      <NodeMark done={done} review={lesson.review} />
                    </button>
                    <span className="tk-label">
                      {lesson.titleRu}
                      <small>{lesson.subtitleRu}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
