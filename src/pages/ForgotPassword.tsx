import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthCard, EmailField, FormError, SubmitButton } from "@/components/auth/AuthCard";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (supabase) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) {
        setLoading(false);
        setError(resetError.message);
        return;
      }
    }

    setLoading(false);
    // Always show the same confirmation so the form can't be used to probe
    // which email addresses are registered.
    setSent(true);
  };

  return (
    <AuthCard
      title={t("auth.resetTitle")}
      intro={sent ? undefined : t("auth.resetIntro")}
      onSubmit={handleSubmit}
      footer={
        <p className="mt-5 text-center text-sm">
          <Link to="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
            {t("auth.backToLogin")}
          </Link>
        </p>
      }
    >
      {sent ? (
        <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--color-success)" }}>
          {t("auth.resetSent")}
        </p>
      ) : (
        <>
          <EmailField value={email} onChange={setEmail} />
          <FormError message={error} />
          <SubmitButton loading={loading} label={t("auth.sendResetLink")} />
        </>
      )}
    </AuthCard>
  );
}
