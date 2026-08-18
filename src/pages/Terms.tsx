import { useTranslation } from "react-i18next";
import { LegalPage } from "@/components/legal/LegalPage";
import { termsDoc } from "@/data/legal";

export default function Terms() {
  const { t, i18n } = useTranslation();
  const doc = termsDoc[i18n.language.startsWith("ru") ? "ru" : "en"];

  return <LegalPage doc={doc} other={{ to: "/privacy", label: t("footer.privacy") }} />;
}
