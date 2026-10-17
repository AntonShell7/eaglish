import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, EmailField, FormError, SubmitButton } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { Trans } from "react-i18next";
import { recordLegalAcceptance } from "@/lib/consent";

export default function Register() {
  const { t } = useTranslation();
  const { signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* Which of the two endings happened. Null until the form is submitted. */
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  /* One resend per minute. Supabase rate-limits them anyway, and a button
     that can be hammered produces an error message instead of an email. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError(t("auth.mustAccept"));
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signUpError, needsConfirmation } = await signUp(email, password);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    // Keep the moment of acceptance: consent you cannot evidence is not consent.
    recordLegalAcceptance();

    /* Two endings, and they are not interchangeable. With a session the
       person is signed in and onboarding will open; without one there is
       nothing behind the auth wall for them yet, and sending them there
       bounces them to the login page with no idea what went wrong. */
    if (needsConfirmation) {
      setSentTo(email);
      setCooldown(60);
      return;
    }
    navigate("/onboarding");
  };

  const resend = async () => {
    if (cooldown > 0 || !sentTo) return;
    setResent(false);
    const { error: resendError } = await resendConfirmation(sentTo);
    if (resendError) {
      setError(resendError);
      return;
    }
    setResent(true);
    setCooldown(60);
  };

  return (
    <AuthCard
      /* Once the letter is away the card is no longer a sign-up form, and a
         heading that still says "create an account" reads as a form that
         failed to submit. */
      title={sentTo ? t("auth.checkEmailTitle") : t("auth.signUp")}
      onSubmit={handleSubmit}
      footer={
        <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
            {t("auth.logIn")}
          </Link>
        </p>
      }
    >
      {sentTo ? (
        /* The account exists but there is no session yet. This screen is the
           whole of what the person can do next, so it says which address the
           letter went to — the commonest failure is a typo nobody can see
           once the form is gone — where to look when it does not arrive, and
           how to get another one. */
        <div className="auth-sent">
          <p className="auth-sent__lede">{t("auth.checkEmailBody")}</p>
          <p className="auth-sent__addr">{sentTo}</p>
          <p className="auth-sent__note">{t("auth.checkEmailSpam")}</p>

          <FormError message={error} />
          {resent && <p className="auth-sent__ok">{t("auth.resendSent")}</p>}

          <button
            type="button"
            className="btn btn--ghost auth-sent__resend"
            onClick={resend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? t("auth.resendIn", { count: cooldown }) : t("auth.resendEmail")}
          </button>

          <GoogleButton label={t("auth.useGoogleInstead")} />
        </div>
      ) : (
        <>
          {/* Google first: the password field is where sign-ups are
              abandoned, and this route skips both it and the email. */}
          <GoogleButton label={t("auth.signUpWithGoogle")} lead />

          <EmailField value={email} onChange={setEmail} />

          <PasswordField
            label={t("auth.password")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            showStrength
            hint={t("auth.passwordHint")}
          />

          {/* No "repeat password" field. It guards against a typo in a value
              the person cannot see — but the field already has a reveal, and
              a forgotten password is one reset email away, so the second box
              buys very little and costs a step on the one screen where steps
              are most expensive. */}

          {/* Consent lives next to the button that acts on it, not in a
              sentence under it that nobody reads. */}
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                setError(null);
              }}
              className="mt-0.5 h-4 w-4 flex-none accent-[var(--color-primary)]"
            />
            <span className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              <Trans
                i18nKey="auth.acceptLegal"
                components={{
                  terms: <Link to="/terms" className="font-semibold underline" style={{ color: "var(--color-primary)" }} />,
                  privacy: <Link to="/privacy" className="font-semibold underline" style={{ color: "var(--color-primary)" }} />,
                }}
              />
            </span>
          </label>

          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {t("auth.dataNote")}
          </p>

          <FormError message={error} />

          <SubmitButton loading={loading} label={t("auth.createAccount")} />
        </>
      )}
    </AuthCard>
  );
}
