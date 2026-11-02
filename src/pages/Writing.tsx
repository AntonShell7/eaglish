import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { ActiveVocabulary } from "@/components/activation/ActiveVocabulary";
import { useAuth } from "@/context/AuthContext";
import { recordWritingVisit } from "@/lib/writingVisits";
import "./vocabulary.css";

export default function Writing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(false);
  const counted = useRef<string | null>(null);
  useEffect(() => {
    if (!user || counted.current === user.id) return;
    counted.current = user.id;
    setShowIntro(recordWritingVisit(localStorage, user.id));
  }, [user?.id]);

  return (
    <SectionHero className="writing-page" title={t("activation.title")}
      description={showIntro ? t("activation.intro") : undefined}>
      <ActiveVocabulary showExplanation={showIntro} />
    </SectionHero>
  );
}
