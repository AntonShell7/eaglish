import { useId, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { isSupabaseConfigured } from "@/lib/supabase";

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
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-10">
      <form
        className="w-full rounded-[var(--radius-lg)] border p-8"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
        onSubmit={onSubmit}
      >
        <h1 className="page-title text-2xl">{title}</h1>

        {intro && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {intro}
          </p>
        )}

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
    <div className="mt-6">
      <label htmlFor={id} className="block text-sm font-medium">
        {t("auth.email")}
      </label>
      <input
        id={id}
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-[var(--radius-md)] border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
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
      className="mt-6 w-full rounded-full py-3 text-sm font-semibold on-primary disabled:opacity-60"
      style={{ background: "var(--color-primary)" }}
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
