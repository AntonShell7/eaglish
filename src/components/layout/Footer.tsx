import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { openConsentSettings } from "@/lib/consent";
import "./footer.css";

const LINKS: { key: string; to: string }[] = [
  { key: "nav.reading", to: "/reading" },
  { key: "nav.dictation", to: "/dictation" },
  { key: "nav.slang", to: "/slang" },
  { key: "nav.vocabulary", to: "/vocabulary" },
  { key: "nav.writing", to: "/writing" },
  { key: "nav.progress", to: "/progress" },
  { key: "footer.privacy", to: "/privacy" },
  { key: "footer.terms", to: "/terms" },
];

/**
 * The footer, on every page, at one size.
 *
 * It used to be a small site map: a tagline, two columns of links and a
 * copyright bar of its own, adding up to a quarter of a screen under every
 * page — including the ones whose content was three lines long. A footer is
 * not a destination. Everything in it is either already in the navigation or
 * is something a person looks for once, so it earns a single quiet line and
 * no more.
 *
 * One row, one size of type, one colour, separated by dots. The tagline is
 * gone because it repeats the front page to people who have already read it.
 */
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="ft">
      <div className="ft__row">
        <span className="ft__brand">
          © {new Date().getFullYear()} {t("brand")}
        </span>

        <nav className="ft__links">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="ft__link">
              {t(link.key)}
            </Link>
          ))}

          {/* Consent has to be as easy to revisit as it was to give. */}
          <button type="button" onClick={openConsentSettings} className="ft__link">
            {t("footer.cookieSettings")}
          </button>
        </nav>
      </div>
    </footer>
  );
}
