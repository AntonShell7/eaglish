import { useTranslation } from "react-i18next";
import { useTheme, type ThemeMode } from "@/context/ThemeContext";

const OPTIONS: { mode: ThemeMode; icon: string }[] = [
  { mode: "light", icon: "☀" },
  { mode: "dark", icon: "☾" },
  { mode: "system", icon: "◐" },
];

export function ThemeToggle({ compact = false }: { compact?: boolean } = {}) {
  const { mode, setMode } = useTheme();
  const { t } = useTranslation();

  /* On the front page the choice is light or dark and nothing else: "follow
     the system" is a preference for people who already live in the app, and
     offering three states to a first-time visitor is a question they did not
     come here to answer. */
  const options = compact ? OPTIONS.filter((o) => o.mode !== "system") : OPTIONS;

  return (
    <div
      role="radiogroup"
      aria-label={t("theme.label")}
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
    >
      {options.map((option) => {
        const active = option.mode === mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={active}
            title={t(`theme.${option.mode}`)}
            onClick={() => setMode(option.mode)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200"
            style={{
              background: active ? "var(--color-surface)" : "transparent",
              color: active ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: active ? "var(--shadow-soft)" : "none",
            }}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
