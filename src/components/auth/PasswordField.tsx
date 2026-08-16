import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  key: "weak" | "fair" | "good" | "strong";
}

/** Rough strength estimate: length plus character-class variety. */
export function scorePassword(value: string): PasswordStrength {
  let points = 0;
  if (value.length >= 8) points++;
  if (value.length >= 12) points++;
  if (/\d/.test(value) && /[a-zA-Z]/.test(value)) points++;
  if (/[^a-zA-Z0-9]/.test(value)) points++;

  const score = Math.min(3, Math.max(0, points - 1)) as 0 | 1 | 2 | 3;
  const key = (["weak", "fair", "good", "strong"] as const)[score];
  return { score, key };
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  showStrength?: boolean;
  error?: string | null;
  hint?: string;
  minLength?: number;
}

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete = "current-password",
  showStrength = false,
  error,
  hint,
  minLength,
}: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const id = useId();

  const strength = showStrength && value ? scorePassword(value) : null;
  const strengthColors = ["var(--color-danger)", "#8b6fe8", "var(--color-accent)", "var(--color-success)"];

  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border py-3 pl-4 pr-12 text-sm outline-none focus:border-[var(--color-primary)]"
          style={{
            borderColor: error ? "var(--color-danger)" : "var(--color-border)",
            background: "var(--color-surface-2)",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          title={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ color: "var(--color-text-muted)" }}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {strength && (
        <div className="mt-2">
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-200"
                style={{
                  background: i <= strength.score ? strengthColors[strength.score] : "var(--color-border)",
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {t("auth.strengthLabel")}: {t(`auth.strength.${strength.key}`)}
          </p>
        </div>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 4l16 16" />
      <path d="M9.9 5.7A9.8 9.8 0 0112 5.5c6.4 0 10 6.5 10 6.5a17 17 0 01-3.3 4.1" />
      <path d="M6.5 7.6A16.6 16.6 0 002 12s3.6 6.5 10 6.5c1.4 0 2.6-.3 3.7-.7" />
      <path d="M9.8 9.9a3.2 3.2 0 004.4 4.4" />
    </svg>
  );
}
