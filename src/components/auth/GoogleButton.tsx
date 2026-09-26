import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Sign in with a Google account.
 *
 * It sits below the email form, after a divider. Above the form it read as the
 * primary path and crowded the fields; below, it is what it actually is — the
 * other way in, for people who would rather not invent a password.
 *
 * The mark is loaded from a file rather than drawn here. Google's G is their
 * trademark and comes with published rules about its shape, colour and
 * clear space, so the right way to show it is their own asset, unaltered. If
 * the file is absent the button simply appears without it and works exactly
 * the same, which is why nothing here depends on it arriving.
 */
export function GoogleButton({ label }: { label: string }) {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markMissing, setMarkMissing] = useState(false);

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
        {!markMissing && (
          <img
            src="/google-mark.svg"
            alt=""
            width={18}
            height={18}
            className="auth-alt__mark"
            onError={() => setMarkMissing(true)}
          />
        )}
        {busy ? t("auth.googleGoing") : label}
      </button>

      {error && (
        <p className="auth-alt__error">{error}</p>
      )}
    </div>
  );
}
