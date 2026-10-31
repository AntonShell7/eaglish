import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trackLessons, trackModules, type TrackKind, type TrackLesson } from "@/data/track";
import { currentLessonId, doneLessons, resetTrack } from "@/lib/trackProgress";
import "./track.css";

export function TrackPath({ onOpen }: { onOpen: (lessonId: string) => void }) {
  const { t, i18n } = useTranslation();
  const ru = i18n.language.startsWith("ru");
  const lessons = trackLessons();
  const current = currentLessonId();
  const done = new Set(doneLessons());
  const finished = lessons.filter(({ lesson }) => done.has(lesson.id)).length;
  const [asking, setAsking] = useState(false);
  const [, bump] = useState(0);

  const minutesOf = (lesson: TrackLesson) => Math.max(2, Math.round(lesson.steps.length * 0.55));
  const progress = lessons.length ? (finished / lessons.length) * 100 : 0;

  return (
    <div className="tk-track">
      <header className="tk-track__head">
        <div>
          <p className="eyebrow">{t("track.pathEyebrow")}</p>
          <h2 className="tk-track__title">{t("track.pathTitle")}</h2>
          <p className="tk-track__note">{t("track.pathNote")}</p>
        </div>
        <div className="tk-track__standing" aria-label={t("track.standing", { done: finished, total: lessons.length })}>
          <strong>{finished}<span>/{lessons.length}</span></strong>
          <small>{t("track.completed")}</small>
        </div>
      </header>

      <div className="tk-track__bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="tk-formats" aria-label={t("track.formatsLabel")}>
        {(["chat", "idiom", "speech", "review"] as const).map((kind, index) => (
          <span key={kind}>
            <b>{index + 1}</b>
            {t(`track.lessonKind.${kind}`)}
          </span>
        ))}
      </div>

      <div className="tk-blocks">
        {trackModules.map((module, moduleIndex) => {
          const blockDone = module.lessons.filter((lesson) => done.has(lesson.id)).length;
          return (
            <section className={`tk-block${blockDone === module.lessons.length ? " tk-block--done" : ""}`} key={module.id}>
              <header className="tk-block__head">
                <div>
                  <span className="tk-block__eyebrow">{t("track.block", { number: moduleIndex + 1 })}</span>
                  <h3>{ru ? module.titleRu : module.title}</h3>
                  <p>{ru ? module.subtitleRu : module.subtitle}</p>
                </div>
                <span className="tk-block__count">{blockDone}/{module.lessons.length}</span>
              </header>
              <div className="tk-block__bar" aria-hidden="true">
                <span style={{ width: `${(blockDone / module.lessons.length) * 100}%` }} />
              </div>

              <div className="tk-path">
                {module.lessons.map((lesson) => {
                  const index = lessons.findIndex((entry) => entry.lesson.id === lesson.id);
                  const isPast = done.has(lesson.id);
                  const here = current === lesson.id;
                  const locked = !isPast && !here;
                  const title = ru ? lesson.titleRu : lesson.title;
                  return (
                    <button
                      type="button"
                      className={`tk-step${locked ? " tk-step--locked" : ""}${here ? " tk-step--here" : ""}${isPast ? " tk-step--done" : ""}${lesson.review ? " tk-step--review" : ""}`}
                      key={lesson.id}
                      disabled={locked}
                      onClick={() => onOpen(lesson.id)}
                      aria-label={`${index + 1}. ${title}`}
                    >
                      <span className="tk-node-wrap">
                        <span className={`tk-press tk-node${isPast ? " tk-node--done" : locked ? " tk-node--locked" : ""}`}>
                          <NodeMark done={isPast} kind={lesson.kind} locked={locked} />
                        </span>
                      </span>

                      <span className="tk-press tk-card">
                        <span className="tk-card__top">
                          <span className="tk-card__kind">{t(`track.lessonKind.${lesson.kind}`)}</span>
                          <span className="tk-card__number">{String(index + 1).padStart(2, "0")}</span>
                        </span>
                        <strong className="tk-card__title">{title}</strong>
                        <span className="tk-card__subtitle">{lesson.subtitleRu}</span>
                        <span className="tk-card__meta">
                          <span>{isPast ? `✓ ${t("track.passed")}` : t("track.minutes", { count: minutesOf(lesson) })}</span>
                          {here && <span className="tk-start">{t("track.start")} →</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {finished > 0 && (
        <div className="tk-track__reset">
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
        </div>
      )}
    </div>
  );
}

function NodeMark({ done, kind, locked }: { done: boolean; kind: TrackKind; locked: boolean }) {
  if (locked) {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
        <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      </svg>
    );
  }
  if (done) {
    return (
      <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (kind === "review") {
    return (
      <svg viewBox="0 0 24 24" width="29" height="29" fill="currentColor" aria-hidden="true">
        <path d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.95z" />
      </svg>
    );
  }
  if (kind === "idiom") {
    return (
      <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 4 3 12l5 8M16 4l5 8-5 8M14 3l-4 18" />
      </svg>
    );
  }
  if (kind === "speech") {
    return (
      <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
        <path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 11.3c0 3.9-3.8 7.1-8.5 7.1-1 0-2-.15-2.9-.42L4 19.6l1.35-3.6C4.2 14.75 3.5 13.1 3.5 11.3c0-3.93 3.8-7.1 8.5-7.1s8.5 3.17 8.5 7.1z" />
    </svg>
  );
}
