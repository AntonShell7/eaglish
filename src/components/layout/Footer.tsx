import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { openConsentSettings } from "@/lib/consent";

const SECTIONS = ["reading", "writing", "listening", "everydayEnglish", "vocabulary"] as const;

const PATHS: Record<(typeof SECTIONS)[number], string> = {
  reading: "/reading",
  writing: "/writing",
  listening: "/listening",
  everydayEnglish: "/everyday-english",
  vocabulary: "/vocabulary",
};

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t" style={{ borderColor: "var(--color-border)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="page-title text-lg">{t("brand")}</p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {t("footer.tagline")}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-2">
          <ul className="space-y-2">
            {SECTIONS.map((key) => (
              <li key={key}>
                <Link
                  to={PATHS[key]}
                  className="text-sm transition-colors duration-150 hover:text-[var(--color-primary)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="space-y-2">
            <li>
              <Link
                to="/progress"
                className="text-sm transition-colors duration-150 hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("nav.progress")}
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-sm transition-colors duration-150 hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-sm transition-colors duration-150 hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              {/* Consent has to be as easy to revisit as it was to give. */}
              <button
                type="button"
                onClick={openConsentSettings}
                className="text-sm transition-colors duration-150 hover:text-[var(--color-primary)]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {t("footer.cookieSettings")}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div
        className="mx-auto max-w-6xl border-t px-5 py-5 text-xs"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        © {new Date().getFullYear()} {t("brand")}
      </div>
    </footer>
  );
}
