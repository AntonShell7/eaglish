import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Sign in with a Google account.
 *
 * `lead` puts it above the email form instead of below it, with the divider
 * underneath reading "or with email".
 *
 * It used to sit only below, on the argument that it would otherwise crowd
 * the fields. That reasoning holds for a product whose users already have an
 * account; it is wrong for a sign-up page being handed to people who have
 * never seen the app. Most abandoned sign-ups are abandoned at the password
 * field — inventing one, or failing to remember which one was used — and the
 * route that skips the field entirely, and skips the confirmation email with
 * it, should not be the one printed smallest and last.
 *
 * The mark is Google's own published asset, used exactly as supplied — their
 * G is a trademark with rules about its shape, colour and the space around
 * it, so drawing an approximation would be both wrong and worse-looking. It
 * ships in two versions, for a light page and a dark one, and the stylesheet
 * picks between them the same way everything else in the app switches theme.
 */
export function GoogleButton({ label, lead = false }: { label: string; lead?: boolean }) {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) return null;

  const go = async () => {
    setBusy(true);
    setError(null);
    const { error: oauthError } = await signInWithGoogle();
    // On success the browser has already left for Google, so reaching this
    // line at all means the attempt failed.
    setBusy(false);
    if (oauthError) setError(oauthError);
  };

  const rule = (
    <div className="auth-alt__rule">
      <span />
      <span className="auth-alt__or">{lead ? t("auth.orByEmail") : t("auth.or")}</span>
      <span />
    </div>
  );

  const button = (
    <button
      type="button"
      className={lead ? "btn btn--ghost auth-alt__btn auth-alt__btn--lead" : "btn btn--ghost auth-alt__btn"}
      onClick={go}
      disabled={busy}
    >
      <span aria-hidden className="auth-alt__mark" />
      {busy ? t("auth.googleGoing") : label}
    </button>
  );

  return (
    <div className={lead ? "auth-alt auth-alt--lead" : "auth-alt"}>
      {lead ? (
        <>
          {button}
          {error && <p className="auth-alt__error">{error}</p>}
          {rule}
        </>
      ) : (
        <>
          {rule}
          {button}
          {error && <p className="auth-alt__error">{error}</p>}
        </>
      )}
    </div>
  );
}
