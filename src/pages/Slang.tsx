import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAccess } from "@/context/AccessContext";
import { SectionHero } from "@/components/SectionHero";
import { TrackPath } from "@/components/track/TrackPath";
import { LessonPlayer } from "@/components/track/LessonPlayer";
import { findLesson, trackLessons } from "@/data/track";
import "@/components/slang/slang.css";

/** Slang is one guided path: messaging, idioms and natural speech in turn. */
export default function Slang() {
  const { t, i18n } = useTranslation();
  const { topic, id } = useParams<{ topic?: string; id?: string }>();
  const navigate = useNavigate();
  const { isPro } = useAccess();
  const playing = topic === "track" && Boolean(id);

  useEffect(() => {
    document.body.classList.toggle("slang-lesson-open", playing);
    return () => document.body.classList.remove("slang-lesson-open");
  }, [playing]);

  if (topic === "track" && id) {
    const found = findLesson(id);
    if (!found) return <Navigate to="/slang" replace />;
    const lessons = trackLessons();
    const next = lessons[lessons.findIndex(entry => entry.lesson.id === found.lesson.id) + 1];
    const canContinue = next && (isPro || next.module.id === found.module.id);

    return (
      <div className="slang-lesson">
        <LessonPlayer
          key={found.lesson.id}
          module={found.module}
          lesson={found.lesson}
          onExit={() => navigate("/slang")}
          onNext={canContinue ? () => navigate(`/slang/track/${next.lesson.id}`) : undefined}
          nextTitle={canContinue ? (!i18n.language.startsWith("en") ? next.lesson.titleRu : next.lesson.title) : undefined}
        />
      </div>
    );
  }

  // Old dialogue and topic links now lead to the single course instead of a
  // second, competing library underneath it.
  if (topic) return <Navigate to="/slang" replace />;

  return (
    <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
      {!isPro && <p className="mt-5 text-sm" style={{ color: "var(--color-text-muted)" }}>{t("pricing.trial.slang")}</p>}
      <TrackPath onOpen={(lessonId) => navigate(`/slang/track/${lessonId}`)} />
    </SectionHero>
  );
}
