import { useId, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { isSupabaseConfigured } from "@/lib/supabase";
import "./auth.css";

interface AuthCardProps {
  title: string;
  intro?: string;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, intro, onSubmit, children, footer }: AuthCardProps) {
  const { t } = useTranslation();

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1 className="page-title auth-card__title">{title}</h1>

        {intro && <p className="auth-card__intro">{intro}</p>}

        {!isSupabaseConfigured && (
          <p
            className="mt-4 rounded-lg px-3 py-2 text-xs"
            style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
          >
            {t("auth.notConfigured")}
          </p>
        )}

        {children}

        {footer}
      </form>
    </div>
  );
}

export function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {t("auth.email")}
      </label>
      <input
        id={id}
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      />
    </div>
  );
}

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn btn--primary auth-submit"
    >
      {loading ? t("common.loading") : label}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-3 text-xs font-medium" style={{ color: "var(--color-danger)" }}>
      {message}
    </p>
  );
}
