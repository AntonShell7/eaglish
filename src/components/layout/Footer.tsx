import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { openConsentSettings } from "@/lib/consent";
import { useAuth } from "@/context/AuthContext";
import { looksLikeAdmin } from "@/lib/admin";
import { CONTACT_EMAIL } from "@/data/legal";
import "./footer.css";

const LINKS: { key: string; to: string }[] = [
  { key: "nav.slang", to: "/slang" },
  { key: "nav.reading", to: "/reading" },
  { key: "nav.dictation", to: "/dictation" },
  { key: "nav.vocabulary", to: "/vocabulary" },
  { key: "nav.writing", to: "/writing" },
  { key: "nav.progress", to: "/progress" },
  /* Next to the legal pages rather than among the sections: a payment
     provider's moderator looks for prices, terms and contacts together, and
     so does anyone wondering what this costs. */
  { key: "nav.pricing", to: "/pricing" },
  { key: "footer.offer", to: "/offer" },
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
  const { user } = useAuth();

  return (
    <footer className="ft">
      <div className="ft__row">
        <span className="ft__brand">
          © {new Date().getFullYear()} {t("brand")}
          {/* A dot for the owner. Hiding it is a courtesy to everyone else's
              screen, not a security measure — the door itself is locked on the
              server, and this only decides whether the handle is drawn. */}
          {looksLikeAdmin(user?.id) && (
            <Link to="/admin" className="ft__admin" title={t("admin.title")} aria-label={t("admin.title")} />
          )}
        </span>

        <nav className="ft__links">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="ft__link">
              {t(link.key)}
            </Link>
          ))}

          {/* The address itself rather than a "Contact" link.
              A payment provider moderating the site looks for a way to reach
              a human, and so does anybody deciding whether to send money to a
              stranger's website — both of them are looking for this string,
              and a label that hides it behind one more click serves neither. */}
          <a href={`mailto:${CONTACT_EMAIL}`} className="ft__link">
            {CONTACT_EMAIL}
          </a>

          {/* Consent has to be as easy to revisit as it was to give. */}
          <button type="button" onClick={openConsentSettings} className="ft__link">
            {t("footer.cookieSettings")}
          </button>
        </nav>
      </div>
    </footer>
  );
}
