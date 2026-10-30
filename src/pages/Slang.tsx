import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { SectionHero } from "@/components/SectionHero";
import { TrackPath } from "@/components/track/TrackPath";
import { LessonPlayer } from "@/components/track/LessonPlayer";
import { findLesson } from "@/data/track";
import "@/components/slang/slang.css";

/** Slang is one guided path: messaging, idioms and natural speech in turn. */
export default function Slang() {
  const { t } = useTranslation();
  const { topic, id } = useParams<{ topic?: string; id?: string }>();
  const navigate = useNavigate();

  if (topic === "track" && id) {
    const found = findLesson(id);
    if (!found) return <Navigate to="/slang" replace />;

    return (
      <div className="py-8">
        <LessonPlayer
          key={found.lesson.id}
          module={found.module}
          lesson={found.lesson}
          onExit={() => navigate("/slang")}
        />
      </div>
    );
  }

  // Old dialogue and topic links now lead to the single course instead of a
  // second, competing library underneath it.
  if (topic) return <Navigate to="/slang" replace />;

  return (
    <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
      <TrackPath onOpen={(lessonId) => navigate(`/slang/track/${lessonId}`)} />
    </SectionHero>
  );
}
