import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemeMode } from "@/context/ThemeContext";

/*
 * Drawn, not typed.
 *
 * These were the characters ☀ ☾ ◐, and the third one does not exist in
 * Manrope. A missing glyph does not announce itself — the browser substitutes
 * whatever it can find, so "follow the system" rendered as a stray mark that
 * read like a broken chevron, in the top bar, on every page. The first two
 * survived by luck rather than by design, and would break the same way on a
 * device whose fallback fonts differ.
 *
 * Icons at this size have to be drawn for the size: the half-filled circle is
 * a plain split rather than a shaded one, because shading at 14px is mud.
 */
const ICONS: Record<ThemeMode, ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </>
  ),
  dark: <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z" />,
  system: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      {/* Filled half, so the two states read at a glance rather than as a
          circle with something faint inside it. */}
      <path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor" stroke="none" />
    </>
  ),
};

const OPTIONS: { mode: ThemeMode }[] = [
  { mode: "light" },
  { mode: "dark" },
  { mode: "system" },
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
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ICONS[option.mode]}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
