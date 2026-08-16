import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="page-title text-3xl">{t("footer.privacy")}</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        <p>
          This page is a placeholder for Eaglish&apos;s privacy policy. It will explain what data we collect
          (account details, learning progress, submitted texts), why we collect it, and how long it is kept.
        </p>
        <p>
          Writing submissions and word lookups are processed by a third-party AI provider (Groq) to generate
          feedback and translations. We will link Groq&apos;s own privacy policy here before launch.
        </p>
        <p>Cookies are used only to keep you signed in and to understand basic product usage.</p>
      </div>
    </div>
  );
}
