import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { ActiveVocabulary } from "@/components/activation/ActiveVocabulary";
import "./vocabulary.css";
import "./smart-repetition.css";

export default function Writing() {
  const { t } = useTranslation();
  return (
    <SectionHero className="writing-page smart-repetition" title={t("activation.title")}
      description={t("activation.intro")}>
      <ActiveVocabulary />
    </SectionHero>
  );
}
