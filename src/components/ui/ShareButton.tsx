import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./share-button.css";

/**
 * Send this page to someone.
 *
 * It only became possible once the sections got real addresses — before that
 * every text, lesson and dialogue lived at the same URL, so "read this one"
 * meant describing where to click.
 *
 * Two behaviours rather than one, because the right gesture differs by
 * device. On a phone the system share sheet is what people expect and it
 * reaches the app they actually want; on a desktop there is usually no sheet,
 * and a copied link pasted into whatever they were already typing in is
 * better than a dialog. `navigator.share` decides which.
 *
 * It says what it did. A share button that silently copies is a share button
 * people press three times.
 */
export function ShareButton({ title }: { title?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: title ?? document.title, url });
        return;
      } catch {
        /* Dismissed, or the sheet refused. Falling through to the clipboard
           gives them something rather than nothing — except when the
           clipboard also fails, which is handled below. */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* Clipboard access can be refused outright. Selecting the address bar
         is then the only honest suggestion, and silence is worse than it. */
      window.prompt(t("share.copyManually"), url);
    }
  };

  return (
    <button type="button" className={`share${copied ? " is-copied" : ""}`} onClick={share}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {copied ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </>
        )}
      </svg>
      {copied ? t("share.copied") : t("share.action")}
    </button>
  );
}
