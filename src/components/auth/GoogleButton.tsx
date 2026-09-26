import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Sign in with a Google account.
 *
 * It sits above the email form rather than below it, because for most people
 * it is the faster path and burying the faster path is a small act of
 * sabotage. The divider underneath says the two are alternatives, not steps.
 *
 * The mark is deliberately plain text rather than Google's coloured logo:
 * that logo is their trademark and comes with its own rules about size,
 * spacing and wording, so the honest options are to use their official asset
 * exactly as published or to use no mark at all. This does the second, and
 * the button works identically either way.
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
    // line at all means something went wrong.
    setBusy(false);
    if (oauthError) setError(oauthError);
  };

  return (
    <>
      <button type="button" className="btn btn--ghost w-full justify-center" onClick={go} disabled={busy}>
        {busy ? t("auth.googleGoing") : label}
      </button>

      {error && (
        <p className="mt-2 text-xs font-medium" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--color-border)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--color-text-faint)" }}>
          {t("auth.or")}
        </span>
        <span className="h-px flex-1" style={{ background: "var(--color-border)" }} />
      </div>
    </>
  );
}
