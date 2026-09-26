import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { ActiveVocabulary } from "@/components/activation/ActiveVocabulary";

/**
 * The active vocabulary at its own address.
 *
 * The section itself moved into the vocabulary, where it belongs — it draws on
 * that collection and proving a word is yours is not a separate errand. This
 * route stays because it is in people's history and in old links, and it shows
 * exactly the same thing.
 */
export default function Writing() {
  const { t } = useTranslation();

  return (
    <SectionHero kicker={t("nav.writing")} title={t("activation.title")} description={t("activation.intro")}>
      <ActiveVocabulary />
    </SectionHero>
  );
}
