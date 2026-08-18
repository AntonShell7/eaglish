import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LAST_UPDATED, type LegalDoc } from "@/data/legal";
import { openConsentSettings } from "@/lib/consent";
import "./legal.css";

/**
 * Shared layout for the privacy policy and the terms.
 *
 * Legal pages are usually unreadable by design. This one opens with three lines
 * a reader can stop after, keeps a table of contents in view on wide screens,
 * and sets the body at proper reading measure — the same care the reading
 * section gets, since this is the text a cautious person actually reads before
 * signing up.
 */
export function LegalPage({ doc, other }: { doc: LegalDoc; other: { to: string; label: string } }) {
  const { t, i18n } = useTranslation();

  const updated = new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(LAST_UPDATED));

  return (
    <div className="legal">
      <header className="legal__head">
        <h1 className="page-title legal__title">{doc.title}</h1>
        <p className="legal__updated">{t("legal.updated", { date: updated })}</p>
      </header>

      <section className="legal__summary" aria-label={t("legal.summary")}>
        <p className="legal__summary-h">{t("legal.summary")}</p>
        <ul>
          {doc.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="legal__body">
        <nav className="legal__toc" aria-label={t("legal.contents")}>
          <p className="legal__toc-h">{t("legal.contents")}</p>
          <ol>
            {doc.sections.map((section, i) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  {section.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal__text">
          {doc.sections.map((section, i) => (
            <section key={section.id} id={section.id}>
              <h2>
                <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                {section.h}
              </h2>
              {section.p.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <footer className="legal__foot">
            <Link to={other.to} className="legal__link">
              {other.label}
            </Link>
            <button type="button" className="legal__link" onClick={openConsentSettings}>
              {t("footer.cookieSettings")}
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
