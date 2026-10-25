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
                      {done ? "✓" : lesson.glyph}
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
