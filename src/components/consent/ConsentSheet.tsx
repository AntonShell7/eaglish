import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  CONSENT_REOPEN,
  STORAGE_INVENTORY,
  getConsent,
  saveConsent,
} from "@/lib/consent";
import "./consent.css";

/**
 * The consent panel.
 *
 * Two states rather than a wall of text: a small card that says what is stored
 * and why, and a details view with the actual inventory and the one switch that
 * exists. The compact card carries no scrim and no blocked scrolling — holding a
 * reader hostage over a theme preference would be absurd — while the details
 * view dims the page, because that is a decision worth focus.
 *
 * The copy is the design here: most banners are vague because vagueness is
 * legally safer for companies that track people. Naming every key we write is
 * the opposite move, and it is the reason this one can afford to be small.
 */
export function ConsentSheet() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (!stored) {
      // A beat before it appears: arriving to a modal already on screen reads as
      // an obstacle, arriving to one that slides in reads as an offer.
      const timer = window.setTimeout(() => setOpen(true), 700);
      return () => window.clearTimeout(timer);
    }
    setAnalytics(stored.analytics);
  }, []);

  useEffect(() => {
    const reopen = () => {
      const stored = getConsent();
      setAnalytics(stored?.analytics ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_REOPEN, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN, reopen);
  }, []);

  // Escape closes the details view the same way the "back" button does.
  useEffect(() => {
    if (!details) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDetails(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [details]);

  if (!open) return null;

  const decide = (value: boolean) => {
    saveConsent(value);
    setOpen(false);
    setDetails(false);
  };

  return (
    <>
      {details && <div className="consent-scrim" onClick={() => setDetails(false)} aria-hidden />}

      <section
        className={`consent${details ? " consent--details" : ""}`}
        role="dialog"
        aria-modal={details}
        aria-labelledby="consent-title"
      >
        <div className="consent__head">
          <span className="consent__mark" aria-hidden>
            <BrandLogo variant="chip" className="h-5 w-5" />
          </span>
          <h2 id="consent-title" className="consent__title">
            {t("consent.title")}
          </h2>
        </div>

        <p className="consent__lede">{t("consent.lede")}</p>

        {details ? (
          <>
            <div className="consent__rows">
              <div className="consent-row">
                <div className="consent-row__text">
                  <p className="consent-row__h">{t("consent.necessary.h")}</p>
                  <p className="consent-row__p">{t("consent.necessary.p")}</p>
                </div>
                <span className="consent-row__locked">{t("consent.always")}</span>
              </div>

              <div className="consent-row">
                <div className="consent-row__text">
                  <p className="consent-row__h">{t("consent.analytics.h")}</p>
                  <p className="consent-row__p">{t("consent.analytics.p")}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  aria-label={t("consent.analytics.h")}
                  className={`consent-switch${analytics ? " is-on" : ""}`}
                  onClick={() => setAnalytics((v) => !v)}
                >
                  <span className="consent-switch__dot" />
                </button>
              </div>
            </div>

            <div className="consent__inventory">
              <p className="consent__inventory-h">{t("consent.inventoryTitle")}</p>
              <ul>
                {STORAGE_INVENTORY.map((item) => (
                  <li key={item.key}>
                    <code>{item.key}</code>
                    <span>{t(`consent.purposes.${item.purpose}`)}</span>
                  </li>
                ))}
              </ul>
              <p className="consent__inventory-note">{t("consent.noThirdParty")}</p>
            </div>

            <div className="consent__actions">
              <button type="button" className="consent__primary" onClick={() => decide(analytics)}>
                {t("consent.save")}
              </button>
              <button type="button" className="consent__ghost" onClick={() => setDetails(false)}>
                {t("consent.back")}
              </button>
            </div>
          </>
        ) : (
          <div className="consent__actions">
            <button type="button" className="consent__primary" onClick={() => decide(false)}>
              {t("consent.gotIt")}
            </button>
            <button type="button" className="consent__ghost" onClick={() => setDetails(true)}>
              {t("consent.customise")}
            </button>
          </div>
        )}

        <p className="consent__foot">
          <Link to="/privacy">{t("footer.privacy")}</Link>
          <span aria-hidden>·</span>
          <Link to="/terms">{t("footer.terms")}</Link>
        </p>
      </section>
    </>
  );
}
