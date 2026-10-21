import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Sign in with a Google account.
 *
 * It sits under the email form, after the submit button, and the rule above
 * it says "or" — these are two doors to the same room, not two steps. It led
 * for a while, on the argument that the password field is where sign-ups are
 * abandoned and the route that skips it should be printed first. That is a
 * real effect, but it bought the click at the cost of the screen: the first
 * thing a new visitor met was somebody else's logo, and the form they had
 * come to fill in started below a horizontal rule, looking like the fallback.
 * The form leads; the shortcut waits underneath for the people who want it.
 *
 * The mark is Google's own published asset, used exactly as supplied — their
 * G is a trademark with rules about its shape, colour and the space around
 * it, so drawing an approximation would be both wrong and worse-looking. It
 * ships in two versions, for a light page and a dark one, and the stylesheet
 * picks between them the same way everything else in the app switches theme.
 */
export function GoogleButton({ label }: { label: string }) {
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

  return (
    <div className="auth-alt">
      <div className="auth-alt__rule">
        <span />
        <span className="auth-alt__or">{t("auth.or")}</span>
        <span />
      </div>

      <button type="button" className="btn btn--ghost auth-alt__btn" onClick={go} disabled={busy}>
        <span aria-hidden className="auth-alt__mark" />
        {busy ? t("auth.googleGoing") : label}
      </button>

      {error && <p className="auth-alt__error">{error}</p>}
    </div>
  );
}
