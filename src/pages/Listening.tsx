import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";

export default function Listening() {
  const { t } = useTranslation();

  return (
    <SectionHero
      kicker={t("nav.listening")}
      title={t("nav.listening")}
      description={t("home.descriptions.listening")}
    >
      <div
        className="mt-8 flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed p-16 text-center"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <span className="text-3xl">🎧</span>
        <p className="text-sm font-medium">{t("common.comingSoon")}</p>
      </div>
    </SectionHero>
  );
}
