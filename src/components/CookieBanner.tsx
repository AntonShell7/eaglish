import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const STORAGE_KEY = "cookieConsent";

export function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(STORAGE_KEY));
  }, []);

  if (!visible) return null;

  const respond = (value: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div
        className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-soft-lg)" }}
      >
        <p className="flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("cookies.message")}{" "}
          <Link to="/privacy" className="font-medium underline" style={{ color: "var(--color-text)" }}>
            {t("footer.privacy")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => respond("declined")}
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("cookies.decline")}
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="rounded-full px-4 py-2 text-sm font-semibold on-primary"
            style={{ background: "var(--color-primary)" }}
          >
            {t("cookies.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
