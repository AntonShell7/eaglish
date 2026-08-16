import { useTranslation } from "react-i18next";

const LANGUAGES: { code: "en" | "ru"; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith("ru") ? "ru" : "en";

  return (
    <div
      role="radiogroup"
      aria-label={t("language.label")}
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
    >
      {LANGUAGES.map((lang) => {
        const active = lang.code === current;
        return (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => i18n.changeLanguage(lang.code)}
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
