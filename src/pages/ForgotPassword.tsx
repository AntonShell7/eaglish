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
        // The link has to land somewhere that can actually set a password.
        // It used to land on the login screen, where the person still did not
        // know the one thing they came to change.
        redirectTo: `${window.location.origin}/reset-password`,
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
        /*
         * The address goes on screen, because this is the moment a person
         * starts doubting themselves. Nothing has visibly happened, the inbox
         * is empty, and the only question they have is "did I even type it
         * right?" — which the old confirmation left them to answer alone.
         *
         * Printing what they typed is safe: it says nothing about whether an
         * account exists, only what they entered a second ago.
         */
        <div className="auth-sent">
          <p className="auth-sent__lead">{t("auth.resetSentTo")}</p>
          <p className="auth-sent__mail">{email}</p>
          <p className="auth-sent__note">{t("auth.resetSentNote")}</p>

          <button
            type="button"
            className="btn btn--ghost auth-sent__again"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
          >
            {t("auth.resetWrongAddress")}
          </button>
        </div>
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
