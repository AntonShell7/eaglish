import { useTranslation } from "react-i18next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacyDoc } from "@/data/legal";

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const doc = privacyDoc[i18n.language.startsWith("ru") ? "ru" : "en"];

  return <LegalPage doc={doc} other={{ to: "/terms", label: t("footer.terms") }} />;
}
