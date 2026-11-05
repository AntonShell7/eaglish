import { localize } from "@/i18n/content";
import { useTranslation } from "react-i18next";

import { availableLanguages, changeInterfaceLanguage, selectedLanguage, type InterfaceLanguage } from "@/i18n/content";

const LANGUAGES: { code: InterfaceLanguage; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: localize("Русский") },
  { code: "ar", label: "AR", name: "العربية" },
];

export function LanguageToggle() {
  const { t } = useTranslation();
  const current = selectedLanguage();

  return (
    <div
      dir="ltr"
      role="radiogroup"
      aria-label={t("language.label")}
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
    >
      {LANGUAGES.filter(lang => availableLanguages.includes(lang.code)).map((lang) => {
        const active = lang.code === current;
        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={active}
            title={lang.name}
            aria-label={lang.name}
            onClick={() => changeInterfaceLanguage(lang.code)}
            className="flex h-7 items-center justify-center rounded-full px-2 text-xs font-semibold transition-all duration-200"
            style={{
              background: active ? "var(--color-surface)" : "transparent",
              color: active ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: active ? "var(--shadow-soft)" : "none",
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
