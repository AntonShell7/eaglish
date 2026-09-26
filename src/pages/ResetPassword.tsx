import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthCard, FormError, SubmitButton } from "@/components/auth/AuthCard";
import { PasswordField, scorePassword } from "@/components/auth/PasswordField";

/**
 * Setting a new password.
 *
 * The flow existed up to this point and then stopped: the email was sent, the
 * link worked, and it delivered the learner to the login screen — where they
 * still did not know their password. Everything before this page was theatre.
 *
 * The link carries a one-time token that the Supabase client exchanges for a
 * short-lived session as soon as the page loads. That session can do exactly
 * one useful thing, which is change the password, and it is why this route is
 * public: the person holding it is, by definition, not signed in yet.
 */

/** How long to wait for the client to exchange the token before giving up. */
const EXCHANGE_TIMEOUT = 4000;

type Stage = "checking" | "ready" | "expired" | "done";

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setStage("expired");
      return;
    }

    // Supabase reports a dead link in the URL fragment rather than by failing,
    // so an expired token is read here rather than waited for.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("error")) {
      setStage("expired");
      return;
    }

    let settled = false;
    const ready = () => {
      if (settled) return;
      settled = true;
      setStage("ready");
    };

    // Two ways in, because the exchange may finish before this effect runs or
    // after it: whichever happens first wins.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) ready();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) ready();
    });

    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setStage("expired");
      }
    }, EXCHANGE_TIMEOUT);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("auth.passwordsDontMatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (!supabase) return;

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStage("done");
    // The recovery session is already a signed-in session, so there is nothing
    // left to ask for — going back to the login screen would be a form the
    // person has just earned the right to skip.
    window.setTimeout(() => navigate("/", { replace: true }), 1400);
  };

  const strength = scorePassword(password);

  return (
    <AuthCard
      title={t("auth.newPasswordTitle")}
      intro={stage === "ready" ? t("auth.newPasswordIntro") : undefined}
      onSubmit={submit}
      footer={
        stage === "expired" ? (
          <p className="mt-5 text-center text-sm">
            <Link to="/forgot-password" className="font-semibold" style={{ color: "var(--color-primary)" }}>
              {t("auth.requestNewLink")}
            </Link>
          </p>
        ) : undefined
      }
    >
      {stage === "checking" && (
        <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("auth.checkingLink")}
        </p>
      )}

      {stage === "expired" && (
        <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--color-danger)" }}>
          {t("auth.linkExpired")}
        </p>
      )}

      {stage === "done" && (
        <p className="mt-6 text-sm leading-relaxed" style={{ color: "var(--color-success)" }}>
          {t("auth.passwordChanged")}
        </p>
      )}

      {stage === "ready" && (
        <>
          <PasswordField
            label={t("auth.newPassword")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            showStrength
            minLength={8}
            hint={t(`auth.strength.${strength.key}`)}
          />
          <PasswordField
            label={t("auth.confirmPassword")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            minLength={8}
          />
          <FormError message={error} />
          <SubmitButton loading={loading} label={t("auth.savePassword")} />
        </>
      )}
    </AuthCard>
  );
}
